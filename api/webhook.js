global.receivedSmsList = global.receivedSmsList || [];

export default async function handler(req, res) {
  // GET এবং POST উভয় রিকোয়েস্টের জন্যই কুয়েরি ও বডি একত্রিত করা
  const query = req.query || {};
  const body = req.body || {};
  
  const action = query.action || body.action;
  const trxid = query.trxid || body.trxid;

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // ১. ওয়েবসাইট থেকে যখন ভেরিফাই করার রিকোয়েস্ট আসে
      if (action === 'verify' || trxid) {
        const searchTrx = (trxid || '').trim().toLowerCase();
        console.log("Verifying TrxID:", searchTrx);

        const found = global.receivedSmsList.find(sms => 
          sms.msg && sms.msg.toLowerCase().includes(searchTrx)
        );

        if (found) {
          return res.status(200).json({ valid: true, message: 'TrxID matched', sms: found });
        } else {
          return res.status(200).json({ valid: false, message: 'TrxID match koreni' });
        }
      }

      // ২. SMS Forwarder অ্যাপ থেকে যখন এসএমএস আসে
      const msg = body.msg || query.msg || '';
      const sender = body.sender || query.sender || '';
      const time = body.time || query.time || '';

      if (msg) {
        global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
        // মেমোরিতে সর্বোচ্চ ১০০টি মেসেজ সংরক্ষণ রাখবে
        if (global.receivedSmsList.length > 100) global.receivedSmsList.pop();
        
        console.log(`Saved SMS: ${msg}`);
        return res.status(200).json({ success: true, message: 'SMS stored successfully' });
      }

      return res.status(200).json({ success: true, message: 'Webhook is active' });

    } catch (error) {
      console.error("Webhook Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

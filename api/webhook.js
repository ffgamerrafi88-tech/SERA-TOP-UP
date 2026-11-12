global.receivedSmsList = global.receivedSmsList || [];

export default async function handler(req, res) {
  // সার্ভারে রিকোয়েস্ট আসার পর কনসোলে ডিবাগ দেখার জন্য
  console.log("FULL REQUEST BODY:", JSON.stringify(req.body));
  console.log("FULL REQUEST QUERY:", JSON.stringify(req.query));

  const query = req.query || {};
  const body = req.body || {};
  
  const action = query.action || body.action;
  const trxid = query.trxid || body.trxid;

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // ১. ওয়েবসাইট থেকে যখন ট্রানজেকশন ভেরিফাই করতে আসে
      if (action === 'verify' || trxid) {
        const searchTrx = (trxid || '').trim().toLowerCase();
        console.log("Searching for TrxID:", searchTrx);

        const found = global.receivedSmsList.find(sms => {
          const smsText = (sms.msg || '').toLowerCase();
          return smsText.includes(searchTrx);
        });

        if (found) {
          return res.status(200).json({ valid: true, message: 'TrxID matched', sms: found });
        } else {
          return res.status(200).json({ valid: false, message: 'TrxID match koreni' });
        }
      }

      // ২. SMS Forwarder অ্যাপ থেকে যখন এসএমএস আসে
      const msg = body.msg || body.text || body.key || query.msg || query.text || JSON.stringify(body);
      const sender = body.sender || query.sender || 'Unknown';
      const time = body.time || query.time || '';

      if (msg) {
        global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
        if (global.receivedSmsList.length > 100) global.receivedSmsList.pop();
        
        console.log(`Successfully Stored SMS: ${msg}`);
        return res.status(200).json({ success: true, message: 'SMS stored successfully' });
      }

      return res.status(200).json({ success: true, message: 'Webhook is active, but no msg found' });

    } catch (error) {
      console.error("Webhook Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

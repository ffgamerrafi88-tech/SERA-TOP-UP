global.receivedSmsList = global.receivedSmsList || [];

export default async function handler(req, res) {
  const query = req.query || {};
  const body = req.body || {};
  
  const action = query.action || body.action;
  const trxid = query.trxid || body.trxid;

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // ১. ওয়েবসাইট থেকে যখন ট্রানজেকশন ভেরিফাই করতে আসে
      if (action === 'verify' || trxid) {
        const searchTrx = (trxid || '').trim().toLowerCase();
        console.log("Verifying TrxID:", searchTrx);

        const found = global.receivedSmsList.find(sms => {
          const smsText = (sms.msg || '').toLowerCase();
          return smsText.includes(searchTrx);
        });

        if (found) {
          // এসএমএস থেকে টাকার পরিমাণ বের করা
          const amountMatch = found.msg.match(/(?:Tk|BDT|৳)\s*([\d,.]+)/i);
          const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '0';

          return res.status(200).json({ 
            success: true, 
            valid: true, 
            amount: amount,
            message: 'TrxID matched', 
            sms: found 
          });
        } else {
          return res.status(200).json({ 
            success: false, 
            valid: false, 
            message: 'TrxID match koreni' 
          });
        }
      }

      // ২. SMS Forwarder অ্যাপ থেকে যখন এসএমএস আসে
      const msg = body.msg || body.text || body.key || query.msg || query.text || '';
      const sender = body.sender || query.sender || 'Unknown';
      const time = body.time || query.time || '';

      if (msg) {
        global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
        if (global.receivedSmsList.length > 100) global.receivedSmsList.pop();
        
        console.log(`Successfully Stored SMS: ${msg}`);
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

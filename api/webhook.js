global.receivedSmsList = global.receivedSmsList || [];

export default async function handler(req, res) {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      const msg = req.body?.msg || req.query?.msg || '';
      const sender = req.body?.sender || req.query?.sender || '';
      const time = req.body?.time || req.query?.time || '';

      // ওয়েবসাইট থেকে ভেরিফাই করার রিকোয়েস্ট (action=verify)
      if (req.query.action === 'verify' || req.body?.action === 'verify') {
        const trxid = req.query.trxid || req.body?.trxid;
        const found = global.receivedSmsList.find(sms => sms.msg.includes(trxid));
        if (found) {
          return res.status(200).json({ valid: true, sms: found });
        } else {
          return res.status(200).json({ valid: false, message: 'TrxID match koreni' });
        }
      }

      // SMS Forwarder থেকে আসা এসএমএস স্টোর করা
      if (msg) {
        global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
        if (global.receivedSmsList.length > 100) global.receivedSmsList.pop();
        console.log(`Saved SMS: ${msg}`);
        return res.status(200).json({ success: true, message: 'SMS stored successfully' });
      }

      return res.status(200).json({ success: true, message: 'Webhook received, but no message content' });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

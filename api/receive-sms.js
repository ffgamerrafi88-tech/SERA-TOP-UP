// মেমোরিতে সাময়িকভাবে এসএমএসগুলো জমানোর জন্য (প্রয়োজনে ডাটাবেজ ব্যবহার করতে পারেন)
global.receivedSmsList = global.receivedSmsList || [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { action, trxid } = req.query;

    // ওয়েবসাইট থেকে ট্রানজেকশন ভেরিফাই করার রিকোয়েস্ট হ্যান্ডেল করতে
    if (action === 'verify') {
      const found = global.receivedSmsList.find(sms => sms.msg.includes(trxid));
      if (found) {
        return res.status(200).json({ valid: true, sms: found });
      } else {
        return res.status(200).json({ valid: false, message: 'TrxID match koreni' });
      }
    }

    // SMS Forwarder অ্যাপ থেকে এসএমএস রিসিভ করার অংশ
    const msg = req.query.msg || req.body?.msg;
    const sender = req.query.sender || req.body?.sender;
    const time = req.query.time || req.body?.time;

    if (msg) {
      global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
      // সর্বোচ্চ ১০০টি মেসেজ স্টোর রাখবে
      if (global.receivedSmsList.length > 100) global.receivedSmsList.pop();
    }

    console.log(`Received SMS from ${sender}: ${msg}`);
    return res.status(200).json({ success: true, message: 'SMS stored successfully' });
  } 
  
  if (req.method === 'POST') {
    const { msg, sender, time } = req.body || {};
    if (msg) {
      global.receivedSmsList.unshift({ msg, sender, time, receivedAt: new Date() });
    }
    return res.status(200).json({ success: true, message: 'SMS stored successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

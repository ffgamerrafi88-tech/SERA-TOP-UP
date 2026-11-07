export default function handler(req, res) {
  if (req.method === 'GET' || req.method === 'POST') {
    const msg = req.query.msg || req.body?.msg;
    const sender = req.query.sender || req.body?.sender;
    const time = req.query.time || req.body?.time;
    
    console.log(`Received SMS from ${sender}: ${msg} at ${time}`);
    
    return res.status(200).json({ success: true, message: 'SMS received successfully' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

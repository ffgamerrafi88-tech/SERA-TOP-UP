export default function handler(req, res) {
  if (req.method === 'POST') {
    const { key, message, text } = req.body;
    console.log("Received SMS Body:", req.body);
    
    // সফলভাবে ডাটা পাওয়ার রেসপন্স পাঠানো
    return res.status(200).json({ success: true, message: "Webhook received successfully" });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

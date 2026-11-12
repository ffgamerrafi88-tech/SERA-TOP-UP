export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // SMS Forwarder অ্যাপ থেকে আসা ডাটা (Body বা Query থেকে টেক্সট ধরতে পারে)
      const smsText = req.body.message || req.body.text || req.body.key || JSON.stringify(req.body);
      console.log("Received SMS Text:", smsText);

      // Regex দিয়ে TrxID বের করার নিয়ম
      const trxMatch = smsText.match(/TrxID\s*([A-Za-z0-9]+)/i);
      // Regex দিয়ে টাকার পরিমাণ বের করার নিয়ম
      const amountMatch = smsText.match(/(?:Tk|BDT)\s*([0-9]+\.[0-9]+|[0-9]+)/i);

      if (trxMatch && amountMatch) {
        const trxId = trxMatch[1];
        const amount = amountMatch[1];

        console.log(`Parsed -> TrxID: ${trxId}, Amount: ${amount}`);

        // TODO: এখানে আপনার ডাটাবেজে চেক করে ইউজারের ওয়ালেটে ব্যালেন্স যোগ করার কুয়েরি বা কোড বসাবেন

        return res.status(200).json({ 
          success: true, 
          message: "Payment processed successfully", 
          trxId, 
          amount 
        });
      }

      return res.status(200).json({ success: true, message: "Webhook received, but no TrxID found" });
    } catch (error) {
      console.error("Webhook Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

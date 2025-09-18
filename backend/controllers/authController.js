const { v4: uuidv4 } = require('uuid');
const otps = {};
exports.requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps[phone] = code;
  console.log(`OTP for ${phone} => ${code}`);
  return res.json({ message: 'OTP sent (demo)', code });
};
exports.verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone & code required' });
  if (otps[phone] && otps[phone] === code) {
    const token = uuidv4();
    return res.json({ token, roles: ['farmer'] });
  }
  return res.status(401).json({ error: 'Invalid code' });
};

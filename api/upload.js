export default async function handler(req, res) {
  // Temporarily return all available environment variable keys for debugging
  try {
    const envKeys = Object.keys(process.env);
    res.status(200).json({
      message: "Variáveis de ambiente disponíveis no servidor:",
      keys: envKeys
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
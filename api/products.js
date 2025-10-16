import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Return products from KV, or an empty array if it doesn't exist yet.
      const products = await kv.get('products') || []; 
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products from KV:', error);
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  } else if (req.method === 'POST') {
    try {
      const products = req.body;
      await kv.set('products', products);
      res.status(200).json({ message: 'Produtos salvos com sucesso!' });
    } catch (error) {
      console.error('Error saving products to KV:', error);
      res.status(500).json({ error: 'Failed to save products.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
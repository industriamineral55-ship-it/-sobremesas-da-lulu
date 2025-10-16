
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let products = await kv.get('products');
      // If KV is empty, seed it from the local JSON file
      if (!products) {
        const filePath = path.join(process.cwd(), 'products.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        products = JSON.parse(fileContent);
        await kv.set('products', products);
      }
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else if (req.method === 'POST') {
    try {
      const products = req.body;
      await kv.set('products', products);
      res.status(200).json({ message: 'Produtos salvos com sucesso!' });
    } catch (error) {
      console.error('Error saving products:', error);
      res.status(500).json({ error: 'Failed to save products' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

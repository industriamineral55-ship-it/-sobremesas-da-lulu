// This script seeds the Vercel KV store with initial product data.
import { createClient } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.development.local
dotenv.config({ path: '.env.development.local' });

async function seed() {
  // Check for environment variables
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('ERRO: Variáveis de ambiente do Vercel KV não encontradas.');
    console.error('Certifique-se de que o arquivo .env.development.local existe e tem as chaves KV.');
    console.error('Você pode gerá-lo com o comando: vercel env pull .env.development.local');
    return;
  }

  console.log('Conectando ao banco de dados Vercel KV...');
  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    // Read the local products.json file
    const filePath = path.join(process.cwd(), 'products.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const products = JSON.parse(fileContent);

    console.log(`Encontrados ${products.length} produtos no products.json.`);
    console.log('Enviando para o banco de dados...');

    // Save the products to the KV store under the key 'products'
    await kv.set('products', products);

    console.log('\nSUCESSO! ✅ O banco de dados foi populado com os produtos iniciais.');

  } catch (error) {
    console.error('\nFALHA AO EXECUTAR O SCRIPT:', error);
  }
}

seed();

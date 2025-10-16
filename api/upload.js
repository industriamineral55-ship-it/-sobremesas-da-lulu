import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

// --- DEBUGGING BLOCK ---
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('ERRO DE CONFIGURAÇÃO: Uma ou mais variáveis de ambiente do Cloudinary não foram encontradas.');
  console.error('Verifique se CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, e CLOUDINARY_API_SECRET estão definidas no painel do Vercel.');
}
// --- END DEBUGGING BLOCK ---

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Vercel specific config to disable body-parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // Check if config is valid before proceeding
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'A configuração do servidor de imagens está incompleta.' });
  }

  try {
    const file = await new Promise((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        const uploadedFile = Array.isArray(files.productImage) ? files.productImage[0] : files.productImage;
        resolve(uploadedFile);
      });
    });

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'sobremesas-da-lulu',
    });

    res.status(200).json({ filePath: result.secure_url });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Image upload failed.' });
  }
}
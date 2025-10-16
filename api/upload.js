
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

let initializationError = null;

try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Uma ou mais variáveis de ambiente do Cloudinary não foram encontradas no servidor.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} catch (e) {
  console.error('ERRO NA INICIALIZAÇÃO DO CLOUDINARY:', e);
  initializationError = e;
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (initializationError) {
    console.error('Responding with initialization error:', initializationError);
    return res.status(500).json({ 
      error: 'Server initialization failed.', 
      message: initializationError.message 
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const file = await new Promise((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
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
    console.error('Upload error during handler execution:', error);
    res.status(500).json({ error: 'Image upload failed during execution.', message: error.message });
  }
}

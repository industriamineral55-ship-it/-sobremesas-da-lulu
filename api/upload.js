
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

  try {
    const file = await new Promise((resolve, reject) => {
      const form = formidable({}); // Create a new formidable instance
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        // formidable v3+ nests files in an array
        const uploadedFile = Array.isArray(files.productImage) ? files.productImage[0] : files.productImage;
        resolve(uploadedFile);
      });
    });

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'sobremesas-da-lulu', // Optional: organize uploads in a folder
    });

    res.status(200).json({ filePath: result.secure_url });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Image upload failed.' });
  }
}

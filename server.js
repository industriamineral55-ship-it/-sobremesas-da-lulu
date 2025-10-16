const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer

const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve images statically

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Route for uploading images
app.post('/api/upload', upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }
    // Return the path to the uploaded file
    res.status(200).json({ filePath: `/images/${req.file.filename}` });
});

// Route for saving products
app.post('/api/products', (req, res) => {
    const products = req.body;
    const filePath = path.join(__dirname, 'products.json');

    fs.writeFile(filePath, JSON.stringify(products, null, 4), (err) => {
        if (err) {
            console.error('Erro ao salvar o arquivo:', err);
            return res.status(500).send('Erro interno ao salvar os produtos.');
        }
        res.status(200).send('Produtos salvos com sucesso!');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Acesse a loja em http://localhost:8000');
    console.log('Acesse a área de admin em http://localhost:8000/admin.html');
});
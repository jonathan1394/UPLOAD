const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 1000;

// Asegurar que la carpeta '/tmp/uploads' existe
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento con Multer en `/tmp/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // Limitar a 500 MB
}).single('archivo');

// Página HTML para subir archivos
app.get('/', (req, res) => {
    res.send(res.sendFile(path.join(__dirname, 'index.html')));
});

// Manejar la carga de archivos
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err); // Mostrar el error en los logs de Render
            return res.status(500).send(`Error al subir el archivo: ${err.message}`);
        }
        res.status(200).send(`Archivo subido correctamente: ${req.file.filename}`);
    });
});

// Listar archivos subidos
app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).send('Error al leer los archivos.');
        res.json(files);
    });
});

// Descargar archivos subidos
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    res.download(filePath);
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

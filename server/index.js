const express = require('express');
const cors = require('cors');
const app = express();
const PORT = parseInt(process.env.PORT) || 8080;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');

// Enable CORS for all routes with specific configuration
app.use(cors({
    origin: ['https://expenser-2335.web.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: false,
    optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

const admin = require('firebase-admin');
const serviceAccount = require('./private-key.json'); // Path to the Firebase service account JSON file. can be downloaded in the project settings
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'expenser-2335.firebasestorage.app',
});

const bucket = admin.storage().bucket();
const uploadsDir = 'server/uploads';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/uploads/');
    },
    filename: function (req, file, cb) {
        // Naming set as encrypted when saving the file to uploads
        const ext = path.extname(file.originalname); // .pdf
        const filename = path.basename(file.originalname, ext); // "File Name"
        const new_filename = `${filename}-${"encrypted"}${ext}`; // Final Name
        cb(null, new_filename);// Saving the file as encrypted
    }
});

const upload = multer({ storage: storage });

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = path.join(__dirname, 'uploads', req.file.filename);
    const outputPath = path.join(__dirname, 'uploads', req.file.originalname);

    try {
        await runQpdf(inputPath, outputPath);

        const file = bucket.file(`pdfs/${req.file.originalname}`);
        await file.save(fs.readFileSync(outputPath), {
            contentType: 'application/pdf',
        });

        const downloadURL = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
        });

        const formFields = JSON.parse(req.body.formFields || '[]');

        const pdfDoc = {
            name: req.file.originalname,
            url: downloadURL[0],
            size: req.file.size,
            contentType: 'application/pdf',
            formFields,
            originalPdfUrl: downloadURL[0],
            uploadedAt: new Date().toISOString(),
        };

        const db = admin.firestore();
        await db.collection('pdfs').add(pdfDoc);

        //clear out the uploads folder
        const uploadsFolder = path.join(__dirname, 'uploads');
        await clearUploadsFolder(uploadsFolder);

        res.status(200).json({ message: "File uploaded and metadata stored successfully" });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).json({ message: "Error processing PDF", error: error.message });
    }
});

// Function to run the qpdf command as a Promise
const runQpdf = (inputPath, outputPath) => {
    const command = `qpdf --decrypt "${inputPath}" "${outputPath}"`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);// Command did not run due to some issues
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);// Command ran but outputed error codes
            }
            resolve(stdout); // Decryption completed successfully
        });
    });
};

const clearUploadsFolder = (folderPath) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) return reject(`Error reading folder: ${err}`);

            let deletePromises = files.map((file) => {
                const filePath = path.join(folderPath, file);
                return fs.promises.unlink(filePath);
            });

            Promise.allSettled(deletePromises)
                .then((results) => {
                    const failed = results.filter(r => r.status === "rejected");
                    if (failed.length) {
                        reject(`Some files could not be deleted: ${failed.map(f => f.reason).join(", ")}`);
                    } else {
                        resolve("Uploads folder cleared.");
                    }
                })
                .catch(err => reject(`Error deleting files: ${err}`));
        });
    });
};

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Add detailed logging for startup
console.log('Starting server with configuration:', {
    port: PORT,
    environment: process.env.NODE_ENV,
    corsOrigins: ['https://expenser-2335.web.app', 'http://localhost:3000']
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server with error handling
const server = app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
    console.log(`Server is running on 0.0.0.0:${PORT}`);
    console.log('Server started successfully');
});

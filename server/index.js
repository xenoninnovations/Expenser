const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const admin = require('firebase-admin');
const fs = require('fs');
const app = express();
const PORT = parseInt(process.env.PORT) || 8080;
const util = require('util');
const execPromise = util.promisify(exec);

// Initialize Firebase Admin
let bucket;
try {
    console.log('Initializing Firebase Admin...');
    const serviceAccount = require('./private-key.json');
    console.log('Service Account Details:', {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        storageBucket: "expenser-2335.firebasestorage.app"
    });

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "expenser-2335.firebasestorage.app"
    });
    console.log('Firebase Admin initialized successfully');

    bucket = admin.storage().bucket();
    console.log('Storage bucket initialized:', bucket.name);
} catch (error) {
    console.error('Firebase Admin initialization error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    });
    // Don't exit, just log the error and continue
}

const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists with proper permissions
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
} else {
    console.log('Uploads directory exists:', uploadsDir);
    // Ensure directory is writable
    try {
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        console.log('Uploads directory is writable');
    } catch (err) {
        console.error('Uploads directory is not writable:', err);
        // Try to fix permissions
        fs.chmodSync(uploadsDir, 0o755);
        console.log('Updated uploads directory permissions');
    }
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Enable CORS
app.use(cors({
    origin: ['https://expenser-2335.web.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// PDF Upload endpoint
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    console.log('Received upload request:', {
        hasFile: !!req.file,
        body: req.body,
        headers: req.headers
    });

    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({
            success: false,
            error: {
                code: 'NO_FILE',
                message: 'No file uploaded',
                details: 'Please select a PDF file to upload'
            }
        });
    }

    console.log('File received:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
    });

    // Use absolute paths
    const inputPath = req.file.path;
    const outputPath = path.join('/usr/src/app/uploads', `decrypted-${req.file.originalname}`);

    console.log('File paths:', {
        inputPath,
        outputPath,
        exists: {
            input: fs.existsSync(inputPath),
            output: fs.existsSync(outputPath)
        },
        permissions: {
            input: fs.statSync(inputPath).mode,
            uploadsDir: fs.statSync('/usr/src/app/uploads').mode
        }
    });

    try {
        // Verify input file exists and is readable
        if (!fs.existsSync(inputPath)) {
            throw {
                code: 'FILE_NOT_FOUND',
                message: `Input file not found at ${inputPath}`,
                details: 'The uploaded file could not be found on the server'
            };
        }

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true, mode: 0o755 });
        }

        console.log('Attempting to decrypt PDF...');
        const qpdfCommand = `qpdf --decrypt "${inputPath}" "${outputPath}"`;
        console.log('Running qpdf command:', qpdfCommand);

        try {
            const { stdout, stderr } = await execPromise(qpdfCommand);
            console.log('qpdf stdout:', stdout);
            if (stderr) console.log('qpdf stderr:', stderr);
        } catch (qpdfError) {
            throw {
                code: 'QPDF_ERROR',
                message: 'Failed to decrypt PDF',
                details: qpdfError.message,
                qpdfError: qpdfError
            };
        }

        // Verify output file exists and is readable
        if (!fs.existsSync(outputPath)) {
            throw {
                code: 'DECRYPT_FAILED',
                message: `Decrypted file not found at ${outputPath}`,
                details: 'The PDF decryption process failed to create the output file'
            };
        }

        console.log('PDF decrypted successfully, size:', fs.statSync(outputPath).size);

        console.log('Uploading to Firebase Storage...');
        const file = bucket.file(`pdfs/${req.file.originalname}`);
        let fileContent;
        try {
            fileContent = fs.readFileSync(outputPath);
            console.log('File read successfully, size:', fileContent.length);
        } catch (readError) {
            console.error('Error reading file:', {
                path: outputPath,
                error: readError.message,
                code: readError.code
            });
            throw {
                code: 'FILE_READ_ERROR',
                message: 'Failed to read decrypted file',
                details: readError.message
            };
        }

        try {
            console.log('Starting Firebase upload...');
            const uploadOptions = {
                contentType: 'application/pdf',
                metadata: {
                    contentType: 'application/pdf',
                    metadata: {
                        originalName: req.file.originalname,
                        uploadedAt: new Date().toISOString()
                    }
                },
                resumable: true
            };

            // Add retry logic
            let retryCount = 0;
            const maxRetries = 3;
            let lastError;

            while (retryCount < maxRetries) {
                try {
                    console.log(`Upload attempt ${retryCount + 1} of ${maxRetries}`);
                    await file.save(fileContent, uploadOptions);
                    console.log('File saved to Firebase Storage successfully');
                    break;
                } catch (error) {
                    lastError = error;
                    console.error(`Upload attempt ${retryCount + 1} failed:`, {
                        code: error.code,
                        message: error.message,
                        details: error.details || 'No additional details available'
                    });
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Retrying in ${retryCount * 1000}ms...`);
                        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
                    }
                }
            }

            if (retryCount === maxRetries) {
                throw lastError;
            }
        } catch (firebaseError) {
            console.error('Firebase upload error after all retries:', {
                code: firebaseError.code,
                message: firebaseError.message,
                details: firebaseError.details || 'No additional details available',
                stack: firebaseError.stack
            });

            // Check for specific Firebase error codes
            let errorMessage = 'Failed to upload to Firebase Storage';
            if (firebaseError.code === 'storage/unauthorized') {
                errorMessage = 'Unauthorized access to Firebase Storage. Please check your credentials.';
            } else if (firebaseError.code === 'storage/quota-exceeded') {
                errorMessage = 'Storage quota exceeded. Please contact support.';
            } else if (firebaseError.code === 'storage/retry-limit-exceeded') {
                errorMessage = 'Upload failed after multiple attempts. Please try again later.';
            }

            throw {
                code: 'FIREBASE_UPLOAD_ERROR',
                message: errorMessage,
                details: firebaseError.message
            };
        }

        let downloadURL;
        try {
            console.log('Generating download URL...');
            downloadURL = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500',
            });
            console.log('Download URL generated successfully');
        } catch (urlError) {
            console.error('URL generation error:', {
                code: urlError.code,
                message: urlError.message
            });
            throw {
                code: 'URL_GENERATION_ERROR',
                message: 'Failed to generate download URL',
                details: urlError.message
            };
        }

        let formFields;
        try {
            formFields = JSON.parse(req.body.formFields || '[]');
            console.log('Form fields:', formFields);
        } catch (parseError) {
            throw {
                code: 'FORM_FIELDS_PARSE_ERROR',
                message: 'Failed to parse form fields',
                details: parseError.message
            };
        }

        const pdfDoc = {
            name: req.file.originalname,
            url: downloadURL[0],
            size: req.file.size,
            contentType: 'application/pdf',
            formFields,
            originalPdfUrl: downloadURL[0],
            uploadedAt: new Date().toISOString(),
        };

        try {
            console.log('Storing metadata in Firestore...');
            const db = admin.firestore();
            await db.collection('pdfs').add(pdfDoc);
            console.log('Metadata stored successfully');
        } catch (firestoreError) {
            throw {
                code: 'FIRESTORE_ERROR',
                message: 'Failed to store metadata in Firestore',
                details: firestoreError.message
            };
        }

        // Clean up files
        console.log('Cleaning up files...');
        try {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log('Deleted decrypted file');
            }
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
                console.log('Deleted input file');
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }

        res.status(200).json({
            success: true,
            message: "File uploaded and metadata stored successfully",
            file: {
                name: req.file.originalname,
                url: downloadURL[0],
                size: req.file.size
            }
        });
    } catch (error) {
        console.error("Error uploading PDF:", {
            code: error.code,
            message: error.message,
            details: error.details,
            stack: error.stack
        });

        // Clean up any files that might have been created
        try {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log('Deleted decrypted file on error');
            }
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
                console.log('Deleted input file on error');
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }

        res.status(500).json({
            success: false,
            error: {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'An unknown error occurred',
                details: error.details || error.stack
            }
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Verify qpdf installation
async function verifyQpdf() {
    try {
        const { stdout } = await execPromise('qpdf --version');
        console.log('qpdf version:', stdout.trim());
        return true;
    } catch (error) {
        console.error('qpdf verification failed:', error);
        return false;
    }
}

// Start server
async function startServer() {
    try {
        console.log('Starting server initialization...');
        console.log('Current working directory:', process.cwd());
        console.log('Environment variables:', {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            PWD: process.env.PWD
        });

        // Verify qpdf is available
        console.log('Verifying qpdf installation...');
        const qpdfAvailable = await verifyQpdf();
        if (!qpdfAvailable) {
            console.error('qpdf is not available. Please ensure it is installed correctly.');
            process.exit(1);
        }
        console.log('qpdf verification successful');

        // Check bucket existence inside async function
        if (bucket) {
            try {
                const [exists] = await bucket.exists();
                if (!exists) {
                    console.error('Storage bucket does not exist:', bucket.name);
                } else {
                    console.log('Storage bucket exists and is accessible');
                }
            } catch (err) {
                console.error('Error checking bucket existence:', err);
            }
        }

        // Create server instance
        console.log('Creating server instance...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is listening on port ${PORT}`);
            console.log('Server startup complete');
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
        });

        // Handle server close
        server.on('close', () => {
            console.log('Server is shutting down');
        });

        // Handle process termination
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Starting graceful shutdown...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Starting graceful shutdown...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    });
    // Give time for logging before exit
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', {
        promise: promise,
        reason: reason,
        stack: reason.stack
    });
    // Give time for logging before exit
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// Start the server
console.log('Starting server...');
startServer().catch(error => {
    console.error('Failed to start server:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// export default AddPDF;
import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as pdfjsLib from 'pdfjs-dist';

import "../../pages/assets/styles/UploadPDF.css";//TODO: Update this to my own css script


// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function AddPDF({ closeModal, pdfID, refreshUploadPDF }) {
    const [selectedPDFFile, setSelectedPDFFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const storage = getStorage();

    // Function to upload file to Firebase Storage
    const uploadToFirebase = async (file) => {
        try {
            console.log('Starting Firebase upload for file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Create a unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name}`;
            const storageRef = ref(storage, `pdfs/${filename}`);

            console.log('Created storage reference:', {
                path: `pdfs/${filename}`,
                fullPath: storageRef.fullPath
            });

            // Upload the file
            console.log('Uploading file to Firebase...');
            const snapshot = await uploadBytes(storageRef, file);
            console.log('File uploaded to Firebase successfully:', {
                ref: snapshot.ref.fullPath,
                metadata: snapshot.metadata
            });

            // Get the download URL
            console.log('Getting download URL...');
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL obtained:', downloadURL);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading to Firebase:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to upload to Firebase: ${error.message}`);
        }
    };

    //TODO: This should be done no matter because regular files need to be read differently compare to a file like a government file
    const parsePDF = async (file) => {
        try {
            // This code needs to be improved
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const formFields = [];

            // Process each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Get page dimensions
                const viewport = page.getViewport({ scale: 1.0 });

                // Process text items on the page
                textContent.items.forEach((item, index) => {
                    // Look for common form field indicators
                    const text = item.str.toLowerCase();
                    const isLabel = text.includes(':') || text.includes('?') || text.includes('(');

                    if (isLabel) {
                        // Calculate the position of the potential input field
                        const fieldPosition = {
                            x: item.transform[4],
                            y: item.transform[5],
                            width: 150, // Default width for input fields
                            height: 20, // Default height for input fields
                            page: pageNum
                        };

                        // Determine field type based on label text
                        let fieldType = 'text';
                        if (text.includes('date')) fieldType = 'date';
                        if (text.includes('email')) fieldType = 'email';
                        if (text.includes('phone')) fieldType = 'tel';
                        if (text.includes('amount') || text.includes('$')) fieldType = 'number';
                        if (text.includes('signature')) fieldType = 'signature';
                        if (text.includes('check') || text.includes('box')) fieldType = 'checkbox';

                        formFields.push({
                            id: `field_${pageNum}_${index}`,
                            label: item.str,
                            type: fieldType,
                            position: fieldPosition,
                            value: '',
                            required: false
                        });
                    }
                });
            }

            return formFields;
        } catch (error) {
            console.error("PDF Parsing Error:", error);
            throw new Error("Error parsing PDF: " + error.message);
        }
    };

    const handleUpload = async () => {
        if (!selectedPDFFile) {
            setError("Please select a PDF file first");
            return;
        }

        if (!selectedPDFFile.type.includes('pdf')) {
            setError("Please select a valid PDF file");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Parse form fields
            const parsedFields = await parsePDF(selectedPDFFile);
            setParsedData(parsedFields);

            // Upload to Firebase first
            console.log('Uploading to Firebase...');
            const firebaseUrl = await uploadToFirebase(selectedPDFFile);
            console.log('Firebase upload successful:', firebaseUrl);

            // Then upload to Express server
            const formData = new FormData();
            formData.append('pdf', selectedPDFFile);
            formData.append('formFields', JSON.stringify(parsedFields));
            formData.append('firebaseUrl', firebaseUrl);
            if (password) {
                formData.append('password', password);
            }

            console.log('Uploading to Express server...');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-pdf`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            console.log('Server response status:', response.status);
            const data = await response.json();
            console.log('Server response data:', data);

            if (!response.ok) {
                console.error('Server error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });

                let errorMessage = 'Upload failed';

                if (data.error) {
                    switch (data.error.code) {
                        case 'NO_FILE':
                            errorMessage = 'No file was uploaded. Please select a PDF file.';
                            break;
                        case 'FILE_NOT_FOUND':
                            errorMessage = 'The uploaded file could not be found on the server';
                            break;
                        case 'QPDF_ERROR':
                            errorMessage = 'Failed to process PDF. The file might be corrupted or password protected.';
                            break;
                        case 'DECRYPT_FAILED':
                            errorMessage = 'Failed to process PDF. Please check if the password is correct.';
                            break;
                        case 'FILE_READ_ERROR':
                            errorMessage = 'Failed to read the processed PDF file';
                            break;
                        case 'FIREBASE_UPLOAD_ERROR':
                            errorMessage = 'Failed to upload to storage. Please try again.';
                            break;
                        case 'URL_GENERATION_ERROR':
                            errorMessage = 'Failed to generate download URL';
                            break;
                        case 'FORM_FIELDS_PARSE_ERROR':
                            errorMessage = 'Failed to process form fields';
                            break;
                        case 'FIRESTORE_ERROR':
                            errorMessage = 'Failed to save document information';
                            break;
                        default:
                            errorMessage = data.error.message || 'An unknown error occurred';
                    }

                    if (data.error.details) {
                        console.error('Error details:', data.error.details);
                    }
                }

                throw new Error(errorMessage);
            }

            console.log('Express server upload successful:', data);

            if (refreshUploadPDF) await refreshUploadPDF();
            closeModal();
        } catch (error) {
            console.error("Error in upload process:", error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const browseFile = async () => {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/pdf";

            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    if (!file.type.includes('pdf')) {
                        setError("Please select a valid PDF file");
                        return;
                    }
                    setSelectedPDFFile(file);
                    setError(null);
                }
            };

            input.click();
        } catch (error) {
            console.error("Error Browsing PDF File: ", error);
            setError("Error selecting file: " + error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload PDF File</h2>
                <p>
                    Upload your legal form PDF to create a fillable version!
                </p>

                <p>Selected File: {selectedPDFFile?.name || "No file selected"}</p>

                {loading && <div className="loading">Processing PDF...</div>}
                {error && <div className="error">{error}</div>}

                <div className="password-input">
                    <label htmlFor="pdf-password">PDF Password (if protected):</label>
                    <input
                        type="password"
                        id="pdf-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter PDF password if protected"
                    />
                </div>

                {parsedData && (
                    <div className="preview-section">
                        <h3>Detected Form Fields:</h3>
                        <div className="form-fields-preview">
                            {parsedData.map((field, index) => (
                                <div key={field.id} className="field-preview">
                                    <span className="field-label">{field.label}</span>
                                    <span className="field-type">({field.type})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="button-group">
                    <button
                        className="modal-button"
                        onClick={browseFile}
                        disabled={loading}
                    >
                        Browse File
                    </button>
                    <button
                        className="modal-button"
                        onClick={handleUpload}
                        disabled={loading || !selectedPDFFile}
                    >
                        Upload PDF File
                    </button>
                    <button
                        className="cancel-button"
                        onClick={closeModal}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddPDF;

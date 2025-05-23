// export default AddPDF;
import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import * as pdfjsLib from 'pdfjs-dist';

import "../../pages/assets/styles/UploadPDF.css";//TODO: Update this to my own css script


// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Improved extractFormFieldsFromAcroForm: find the closest text in any direction with larger tolerance
async function extractFormFieldsFromAcroForm(pdf) {
    const fields = [];
    if (pdf && pdf._pdfInfo && pdf._pdfInfo.acroForm) {
        if (typeof pdf.getFieldObjects === 'function') {
            const fieldObjects = await pdf.getFieldObjects();
            for (const [name, objs] of Object.entries(fieldObjects)) {
                const obj = objs[0];
                let label = obj.alternativeText || obj.fieldName || name;
                let page = obj.pageIndex !== undefined ? obj.pageIndex + 1 : 1;
                let rect = obj.rect || null;
                if (rect && pdf.getPage) {
                    try {
                        const pageObj = await pdf.getPage(page);
                        const textContent = await pageObj.getTextContent();
                        let minDist = Infinity;
                        let bestLabel = label;
                        textContent.items.forEach(item => {
                            // Calculate the center of the field and the text
                            const fieldX = (rect[0] + rect[2]) / 2;
                            const fieldY = (rect[1] + rect[3]) / 2;
                            const textX = item.transform[4];
                            const textY = item.transform[5];
                            // Use Euclidean distance
                            const dx = fieldX - textX;
                            const dy = fieldY - textY;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            // Use a larger tolerance (e.g., 60pt)
                            if (dist < minDist && dist < 60) {
                                minDist = dist;
                                bestLabel = item.str;
                            }
                        });
                        label = bestLabel;
                    } catch (e) { /* fallback to default label */ }
                }
                fields.push({
                    id: name,
                    label,
                    type: obj.fieldType || 'text',
                    value: '',
                    required: false
                });
            }
        } else if (pdf._pdfInfo.acroForm.fields) {
            for (const field of pdf._pdfInfo.acroForm.fields) {
                fields.push({
                    id: field.T || field.FT || Math.random().toString(36).substr(2, 9),
                    label: field.T || 'Field',
                    type: field.FT || 'text',
                    value: '',
                    required: false
                });
            }
        }
    }
    return fields;
}

function AddPDF({ closeModal, pdfID, refreshUploadPDF }) {
    const [selectedPDFFile, setSelectedPDFFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const storage = getStorage();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [pdfType, setPdfType] = useState("");

    // Function to upload file to Firebase Storage
    const uploadToFirebase = async (file) => {
        try {
            console.log('Starting Firebase upload for file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Function to generate the next available filename
            const getNextAvailableFilename = async (baseName) => {
                const storageRef = ref(storage, 'pdfs');
                try {
                    // List all files in the pdfs directory
                    const listResult = await listAll(storageRef);
                    const existingFiles = listResult.items.map(item => item.name);

                    // If the base name doesn't exist, return it
                    if (!existingFiles.includes(baseName)) {
                        return baseName;
                    }

                    // Extract name and extension
                    const lastDotIndex = baseName.lastIndexOf('.');
                    const nameWithoutExt = baseName.substring(0, lastDotIndex);
                    const extension = baseName.substring(lastDotIndex);

                    // Find the highest number used
                    let maxNumber = 0;
                    const regex = new RegExp(`^${nameWithoutExt} \\((\\d+)\\)${extension}$`);

                    existingFiles.forEach(existingName => {
                        const match = existingName.match(regex);
                        if (match) {
                            const num = parseInt(match[1]);
                            maxNumber = Math.max(maxNumber, num);
                        }
                    });

                    // Return the next available name
                    return `${nameWithoutExt} (${maxNumber + 1})${extension}`;
                } catch (error) {
                    console.error('Error checking existing files:', error);
                    // If there's an error, fall back to timestamp
                    return `${Date.now()}-${baseName}`;
                }
            };

            // Get the next available filename
            const finalFileName = await getNextAvailableFilename(file.name);
            const storageRef = ref(storage, `pdfs/${finalFileName}`);

            console.log('Created storage reference:', {
                path: `pdfs/${finalFileName}`,
                fullPath: storageRef.fullPath
            });

            // Create a new File object with the unique name
            const fileWithUniqueName = new File([file], finalFileName, { type: file.type });

            // Upload the file
            console.log('Uploading file to Firebase...');
            const snapshot = await uploadBytes(storageRef, fileWithUniqueName);
            console.log('File uploaded to Firebase successfully:', {
                ref: snapshot.ref.fullPath,
                metadata: snapshot.metadata
            });

            // Get the download URL
            console.log('Getting download URL...');
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL obtained:', downloadURL);

            return { downloadURL, uniqueFileName: finalFileName, fileWithUniqueName };
        } catch (error) {
            console.error('Error uploading to Firebase:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to upload to Firebase: ${error.message}`);
        }
    };

    const parsePDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            try {
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                // Detect AcroForm (regular PDF) using pdf._pdfInfo.acroForm
                if (pdf._pdfInfo && pdf._pdfInfo.acroForm) {
                    setPdfType("AcroForm/Regular PDF");
                    return await extractFormFieldsFromAcroForm(pdf);
                }
                setPdfType("Plain PDF (no AcroForm)");
                const formFields = [];
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const viewport = page.getViewport({ scale: 1.0 });
                    textContent.items.forEach((item, index) => {
                        const text = item.str.toLowerCase();
                        const isLabel = text.includes(':') || text.includes('?') || text.includes('(');
                        if (isLabel) {
                            const fieldPosition = {
                                x: item.transform[4],
                                y: item.transform[5],
                                width: 150,
                                height: 20,
                                page: pageNum
                            };
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
                if (error.name === 'PasswordException') {
                    setShowPasswordModal(true);
                    throw new Error('Password required');
                }
                throw error;
            }
        } catch (error) {
            console.error("PDF Parsing Error:", error);
            if (error.message === 'Password required') {
                throw error;
            }
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
        setUploadProgress(0);

        try {
            console.log('=== CLIENT: Starting Upload Process ===');

            // Parse PDF first
            console.log('=== CLIENT: Parsing PDF ===');
            let parsedFields;
            try {
                parsedFields = await parsePDF(selectedPDFFile);
                setUploadProgress(25);
            } catch (error) {
                if (error.message === 'Password required') {
                    setLoading(false);
                    return;
                }
                throw error;
            }

            // Firebase upload (get unique filename and file object)
            const { downloadURL, uniqueFileName, fileWithUniqueName } = await uploadToFirebase(selectedPDFFile);
            setUploadProgress(50);

            // Server upload
            const formData = new FormData();
            formData.append('pdf', fileWithUniqueName);
            formData.append('formFields', JSON.stringify(parsedFields));
            formData.append('isPasswordProtected', 'false');
            formData.append('password', '');
            formData.append('uniqueFileName', uniqueFileName); // Pass to server
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-pdf`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Server upload failed');
            }

            setUploadProgress(90);

            // Start the refresh process before showing 100%
            if (refreshUploadPDF) {
                console.log('=== CLIENT: Refreshing PDF List ===');
                await refreshUploadPDF();
            }

            setUploadProgress(100);
            console.log('=== CLIENT: Upload Complete ===');

            // Close modal after a brief delay to show completion
            setTimeout(() => {
                closeModal();
            }, 500);
        } catch (error) {
            console.error('=== CLIENT ERROR: Upload Process ===', error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!password) {
            setError("Please enter a password");
            return;
        }

        // Prevent multiple uploads if already loading
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('=== CLIENT: Starting Upload Process with Password ===');
            const arrayBuffer = await selectedPDFFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
                password: password
            }).promise;

            // If we get here, the password was correct
            const formFields = [];
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
                            width: 150,
                            height: 20,
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

            setUploadProgress(25);

            // Firebase upload (get unique filename and file object)
            const { downloadURL, uniqueFileName, fileWithUniqueName } = await uploadToFirebase(selectedPDFFile);
            setUploadProgress(50);

            // Server upload
            const formData = new FormData();
            formData.append('pdf', fileWithUniqueName);
            formData.append('formFields', JSON.stringify(formFields));
            formData.append('isPasswordProtected', 'true');
            formData.append('password', password);
            formData.append('uniqueFileName', uniqueFileName); // Pass to server
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-pdf`, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Server upload failed');
            }

            setUploadProgress(90);

            // Start the refresh process before showing 100%
            if (refreshUploadPDF) {
                console.log('=== CLIENT: Refreshing PDF List ===');
                await refreshUploadPDF();
            }

            setUploadProgress(100);
            console.log('=== CLIENT: Upload Complete ===');

            // Only close the modal after successful upload
            setShowPasswordModal(false);
            setTimeout(() => {
                closeModal();
            }, 500);
        } catch (error) {
            console.error('=== CLIENT ERROR: Password Upload Process ===', error);
            if (error.name === 'PasswordException') {
                setError('Incorrect password. Please try again.');
                setPassword('');
            } else {
                setError(error.message || "Something went wrong");
            }
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
            console.error("Error in file selection:", error);
            setError("Error selecting file");
        }
    };

    return (
        <div className="upload-pdf-container">
            {showPasswordModal ? (
                <div className="password-modal">
                    <div className="password-modal-content">
                        <h3>Password Protected PDF</h3>
                        <p>This PDF file is password protected. Please enter the password to continue.</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter PDF password"
                            disabled={loading}
                            style={{ width: '100%', marginBottom: '10px' }}
                            data-form-type="other"
                        />
                        {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                        {loading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="progress-text">
                                    {uploadProgress < 25 ? 'Verifying password...' :
                                        uploadProgress < 50 ? 'Uploading to Firebase...' :
                                            uploadProgress < 90 ? 'Uploading to server...' :
                                                uploadProgress < 100 ? 'Finalizing...' :
                                                    'Complete!'} {uploadProgress}%
                                </div>
                            </div>
                        )}
                        <div className="password-modal-buttons">
                            <button 
                                onClick={handlePasswordSubmit}
                                disabled={loading || !password}
                            >
                                {loading ? "Processing..." : "Submit"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPassword('');
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="upload-pdf-content">
                    <h2>Upload PDF</h2>
                    <div className="file-input-container">
                        <button onClick={browseFile} className="browse-button">
                            Browse PDF
                        </button>
                            {selectedPDFFile && (
                                <div className="selected-file">
                                    Selected: {selectedPDFFile.name}
                                </div>
                            )}
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        {loading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="progress-text">
                                    {uploadProgress < 25 ? 'Parsing PDF...' :
                                        uploadProgress < 50 ? 'Uploading to Firebase...' :
                                            uploadProgress < 90 ? 'Uploading to server...' :
                                                uploadProgress < 100 ? 'Finalizing...' :
                                                    'Complete!'} {uploadProgress}%
                                </div>
                            </div>
                        )}
                        {pdfType && (
                            <div className="pdf-type-info" style={{ marginBottom: '10px', color: '#888' }}>
                                Detected PDF Type: <b>{pdfType}</b>
                            </div>
                        )}
                        <div className="button-container">
                            <button
                                onClick={handleUpload}
                                disabled={!selectedPDFFile || loading}
                                className="upload-button"
                            >
                                {loading ? "Uploading..." : "Upload PDF"}
                            </button>
                            <button onClick={closeModal} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
            )}
        </div>
    );
}

export default AddPDF;
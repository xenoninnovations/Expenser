import React, { useState, useEffect } from "react";
import { doc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as pdfjsLib from 'pdfjs-dist';

import "../../pages/assets/styles/UploadPDF.css";//TODO: Update this to my own css script

import { db } from "../../config.js";
import axios from 'axios';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function AddPDF({ closeModal, pdfID, refreshUploadPDF }) {
    const [selectedPDFFile, setSelectedPDFFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const storage = getStorage();

    const parsePDF = async (file) => {
        try {
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
            // First parse the PDF
            const parsedFields = await parsePDF(selectedPDFFile);
            setParsedData(parsedFields);

            // Then upload to Firebase Storage
            const storageRef = ref(storage, `pdfs/${selectedPDFFile.name}`);
            const snapshot = await uploadBytes(storageRef, selectedPDFFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Store the parsed data in Firestore along with the PDF metadata
            const pdfDoc = {
                name: selectedPDFFile.name,
                url: downloadURL,
                size: selectedPDFFile.size,
                contentType: selectedPDFFile.type,
                formFields: parsedFields,
                originalPdfUrl: downloadURL,
                uploadedAt: new Date().toISOString()
            };

            //TODO: Remove restrictions before uploading
            // Add to Firestore collection
            await addDoc(collection(db, "pdfs"), pdfDoc);
  
            // Refresh the list and close modal
            refreshUploadPDF && refreshUploadPDF();
            closeModal();
        } catch (error) {
            console.error("Error processing PDF:", error);
            setError(error.message || "Error uploading PDF. Please try again.");
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

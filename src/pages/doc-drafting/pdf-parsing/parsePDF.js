import React, { useState, useEffect } from 'react'
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import PDFParser from "pdf2json";
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

function ParsePDF() {
    const [pdfForm, setPdfForm] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedPdf(file);
        setLoading(true);
        setError(null);

        try {
            // Create a URL for the selected file
            const fileUrl = URL.createObjectURL(file);
            
            // Create PDF parser instance
            const pdfParser = new PDFParser();
            
            // Set up event handlers
            pdfParser.on("pdfParser_dataError", (errData) => {
                console.error(errData.parserError);
                setError("Error parsing PDF: " + errData.parserError);
                setLoading(false);
            });

            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                // Extract form fields from the parsed data
                const formFields = extractFormFields(pdfData);
                setParsedData(formFields);
                setPdfForm(pdfData);
                setLoading(false);
            });

            // Load and parse the PDF
            pdfParser.loadPDF(fileUrl);
        } catch (err) {
            console.error("Error processing PDF:", err);
            setError("Error processing PDF: " + err.message);
            setLoading(false);
        }
    };

    const extractFormFields = (pdfData) => {
        // This function will extract form fields from the parsed PDF data
        // You'll need to customize this based on your PDF structure
        const fields = {};
        
        if (pdfData && pdfData.Pages) {
            pdfData.Pages.forEach((page, pageIndex) => {
                // Look for form fields in each page
                if (page.Texts) {
                    page.Texts.forEach((text, textIndex) => {
                        // Add logic to identify and extract form fields
                        // This is a basic example - you'll need to adjust based on your PDF structure
                        if (text.R && text.R[0]) {
                            fields[`field_${pageIndex}_${textIndex}`] = {
                                text: text.R[0].T,
                                position: text.x,
                                page: pageIndex + 1
                            };
                        }
                    });
                }
            });
        }
        
        return fields;
    };

    return (
        <div>
            <div className="pdf-parser-container">
                <h2>PDF Form Field Extractor</h2>
                
                <div className="file-input-container">
                    <input 
                        type="file" 
                        accept=".pdf"
                        onChange={handleFileSelect}
                        disabled={loading}
                    />
                </div>

                {loading && <div className="loading">Processing PDF...</div>}
                {error && <div className="error">{error}</div>}

                {parsedData && (
                    <div className="results">
                        <h3>Extracted Form Fields:</h3>
                        <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ParsePDF;
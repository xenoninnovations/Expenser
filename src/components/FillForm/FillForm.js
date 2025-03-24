import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FillForm({ pdfData, onClose }) {
    const [formValues, setFormValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize form values
    useEffect(() => {
        if (!pdfData?.formFields) {
            setError("No form fields found in this PDF");
            return;
        }

        const initialValues = {};
        pdfData.formFields.forEach(field => {
            initialValues[field.id] = field.value || '';
        });
        setFormValues(initialValues);
    }, [pdfData]);

    const handleInputChange = (fieldId, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const generateFilledPDF = async () => {
        if (!pdfData?.formFields || pdfData.formFields.length === 0) {
            setError("No form fields to fill out");
            return;
        }

        if (!pdfData.originalPdfUrl) {
            setError("Original PDF URL is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Validate the URL
            const pdfUrl = new URL(pdfData.originalPdfUrl);
            if (!pdfUrl.protocol.startsWith('http')) {
                throw new Error('Invalid PDF URL protocol');
            }

            // Load the original PDF with timeout and error handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(pdfData.originalPdfUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
            }

            const pdfBytes = await response.arrayBuffer();
            if (!pdfBytes || pdfBytes.byteLength === 0) {
                throw new Error('Received empty PDF data');
            }

            const pdfDoc = await PDFDocument.load(pdfBytes);

            // Add text to each page
            for (const field of pdfData.formFields) {
                const page = pdfDoc.getPage(field.position.page - 1);
                const { width, height } = page.getSize();
                
                // Convert coordinates to PDF space
                const x = field.position.x;
                const y = height - field.position.y; // Flip Y coordinate

                // Add the text
                page.drawText(formValues[field.id] || '', {
                    x,
                    y,
                    size: 12,
                    color: rgb(0, 0, 0)
                });
            }

            // Save the modified PDF
            const modifiedPdfBytes = await pdfDoc.save();
            
            // Create a download link
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `filled_${pdfData.name}`;
            link.click();
            URL.revokeObjectURL(downloadUrl);

            // Update the form data in Firestore
            const pdfRef = doc(db, 'pdfs', pdfData.id);
            await updateDoc(pdfRef, {
                formValues,
                lastFilled: new Date().toISOString()
            });

            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
            if (error.name === 'AbortError') {
                setError('Request timed out while loading the PDF');
            } else if (error.message.includes('Failed to load PDF')) {
                setError('Unable to access the PDF file. Please check if the file exists and is accessible.');
            } else {
                setError('Error generating filled PDF: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!pdfData?.formFields || pdfData.formFields.length === 0) {
        return (
            <div className="fill-form-modal">
                <div className="fill-form-content">
                    <h2>Error</h2>
                    <p>No form fields found in this PDF.</p>
                    <button className="cancel-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fill-form-modal">
            <div className="fill-form-content">
                <h2>Fill Form: {pdfData.name}</h2>
                
                <div className="form-fields">
                    {pdfData.formFields.map((field) => (
                        <div key={field.id} className="form-field">
                            <label htmlFor={field.id}>{field.label}</label>
                            {field.type === 'checkbox' ? (
                                <input
                                    type="checkbox"
                                    id={field.id}
                                    checked={formValues[field.id] || false}
                                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                                />
                            ) : field.type === 'signature' ? (
                                <div className="signature-pad">
                                    <input
                                        type="text"
                                        id={field.id}
                                        value={formValues[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        placeholder="Type signature"
                                    />
                                </div>
                            ) : (
                                <input
                                    type={field.type}
                                    id={field.id}
                                    value={formValues[field.id] || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {error && <div className="error">{error}</div>}

                <div className="button-group">
                    <button
                        className="generate-button"
                        onClick={generateFilledPDF}
                        disabled={loading}
                    >
                        {loading ? 'Generating PDF...' : 'Generate Filled PDF'}
                    </button>
                    <button
                        className="cancel-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FillForm; 
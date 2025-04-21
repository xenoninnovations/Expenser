import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import * as PdfToJson from './PdfToJson';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FillForm({ pdfData, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdfJsonData, setPdfJsonData] = useState([]);

    // Initialize form values
    useEffect(() => {
        if (!pdfData?.formFields) {
            setError("No form fields found in this PDF");
            return;
        }

        const convertPdfToJson = async () => {
            try {
                const jsonResult = await PdfToJson.convertPdfToJson(pdfData.url);
                setPdfJsonData(jsonResult);
                // jsonResult[0].inputField.inputType; // This holds what type of field it is
                //               Tx = text box
                //               Ch = drop down list 
                //               Chk = Check boxes

                // jsonResult[0].inputField.options; // This is an array that is set based on the inputType. If Ch, then its a list of options(['Northwest', 'Northeast', 'East', etc.. )
                // jsonResult[0].inputField.value = "East"; // the value for the first question
                // jsonResult[0].label;   // the question for the first annotation
                // jsonResult[0].associatedLabel; // This might not be there but if it exists then theres an association between the question and the associatedLabel
                console.log(jsonResult);

            } catch (err) {
                console.error("Error converting PDF to JSON:", err);
                setError("Failed to parse form fields");
            }
        };
        convertPdfToJson();
    }, [pdfData]);

    const handleInputChange = (idx, value) => {

        setPdfJsonData(prevData => {
            if (!prevData || !prevData[idx] || !prevData[idx].inputField) {
                console.warn(`Invalid index or missing inputField at index ${idx}`);
                return prevData;
            }


            const updatedData = [...prevData];
            const inputType = updatedData[idx].inputField.inputType?.toLowerCase();

            console.log(value);
            updatedData[idx] = {
                ...updatedData[idx],
                inputField: {
                    ...updatedData[idx].inputField,
                    value: inputType === 'chk'
                        ? value === 'Off' || !value
                            ? ''
                            : value
                        : inputType === 'ch'
                            ? value === '-- select --' || value.length === 0
                                ? []
                                : [value]
                            : value
                }
            };

            return updatedData;
        });
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

            PdfToJson.DownloadUpdatedJsonToPdf(pdfData, pdfJsonData);

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
            <div className="fill-form-content" style={{ padding: '20px' }}>
                <h2>Fill Form: {pdfData.name}</h2>

                <div
                    className="form-fields"

                >
                    {pdfJsonData.length === 0 ? (
                        <p>Loading form…</p>
                    ) : (
                            pdfJsonData.map((fieldObj, idx) => {
                                const { label, inputField } = fieldObj;
                                const name = inputField.fieldName;
                                const type = (inputField.inputType || '').toLowerCase();
                                let value = inputField.value ?? '';
                                const options = inputField.options || [];
                                const { width, height } = inputField;

                                //Ignore the ones we dont want
                                if (type === '' || /^field\s?\d+$/i.test(label.trim().toLowerCase())) {
                                    return null;
                                }

                                // Handling multi-value checkboxes
                                if (type === 'ch' && Array.isArray(value)) {
                                    value = value[0] || '';
                                }

                                return (
                                <div
                                    key={idx}
                                    className="form-field"
                                >
                                    <label
                                        htmlFor={name}
                                        className="field-label"
                                    >
                                        {Array.isArray(label) ? label[0] : label}
                                    </label>

                                    {/* Render Checkbox */}
                                    {type === 'chk' ? (
                                        <div className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                id={name}
                                                checked={value !== 'Off' && !!value}
                                                onChange={e => handleInputChange(idx, e.target.checked)}
                                                className="field-input"
                                            />
                                            {Array.isArray(label) && label[1] && (
                                                <span className="checkbox-label">{label[1]}</span>
                                            )}
                                        </div>
                                    )
                                        // Render Dropdown (Select)
                                        : type === 'ch' ? (
                                            <select
                                                id={name}
                                                value={value || ''}  // Ensure a fallback empty string if value is undefined
                                                onChange={e => handleInputChange(idx, e.target.value)}
                                                className="field-input select-dropdown"

                                            >
                                                <option value="">-- select --</option>
                                                {options.map(opt => (
                                                    <option key={opt.exportValue} value={opt.exportValue}>
                                                        {opt.displayValue}
                                                    </option>
                                                ))}
                                            </select>
                                        )
                                            // Render Text Input (default)
                                            : (
                                                <input
                                                    type="text"
                                                    id={name}
                                                    value={value}
                                                    onChange={e => handleInputChange(idx, e.target.value)}
                                                    className="field-input"
                                                    style={{ height: `${height * 2}px`, width: `${width * 1.5}px`, maxWidth: '100%' }}
                                                />
                                            )}
                                </div>
                            );
                            })
                    )}
                </div>

                {error && <div className="error">{error}</div>}

                <div className="button-group" style={{ marginTop: '24px' }}>
                    <button
                        className="generate-button"
                        onClick={generateFilledPDF}
                        disabled={loading}
                    >
                        {loading ? 'Generating PDF…' : 'Generate Filled PDF'}
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
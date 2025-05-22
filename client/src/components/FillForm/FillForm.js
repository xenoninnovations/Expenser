import React, { useState, useEffect } from 'react';
import * as PdfToJson from './PdfToJson';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

function FillForm({ pdfData, onClose }) {
    const [loading, setLoading] = useState(false);
    const [parsingLoading, setParsingLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfJsonData, setPdfJsonData] = useState([]);

    // Initialize form values
    useEffect(() => {
        const convertPdfToJson = async () => {
            setParsingLoading(true);
            setError(null);

            try {
                console.log('=== PDF Form Processing ===');
                console.log('PDF Data:', pdfData);
                console.log('PDF URL:', pdfData?.url);

                if (!pdfData?.url) {
                    throw new Error('No PDF URL provided');
                }

                // Check if URL is from Firebase Storage
                if (pdfData.url.includes('firebasestorage.googleapis.com')) {
                    console.log('PDF is hosted on Firebase Storage');
                } else {
                    console.log('PDF is hosted on:', new URL(pdfData.url).origin);
                }

                console.log('Attempting to fetch PDF...');
                const jsonResult = await PdfToJson.convertPdfToJson(pdfData.url);
                console.log('Form fields extracted:', jsonResult);

                if (!jsonResult || jsonResult.length === 0) {
                    setError("No form fields found in this PDF. This might be a regular PDF without form fields.");
                    return;
                }

                setPdfJsonData(jsonResult);
            } catch (err) {
                console.error("=== PDF Processing Error ===");
                console.error("Error type:", err.name);
                console.error("Error message:", err.message);
                console.error("Error stack:", err.stack);

                let errorMsg = "Failed to parse form fields.";

                if (err.message) {
                    errorMsg = err.message;
                }

                // Add more context to network errors
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    errorMsg = `Network error: Unable to reach the PDF server. Please check if the PDF URL is accessible: ${pdfData?.url}`;
                }

                setError(errorMsg);
            } finally {
                setParsingLoading(false);
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
        setLoading(true);
        setError(null);

        try {
            await PdfToJson.DownloadUpdatedJsonToPdf(pdfData, pdfJsonData);
            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError(error.message || 'Failed to generate filled PDF');
        } finally {
            setLoading(false);
        }
    };

    if (parsingLoading) {
        return (
            <div className="fill-form-modal">
                <div className="fill-form-content">
                    <LoadingSpinner size="large" text="Loading form fields..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fill-form-modal">
                <div className="fill-form-content">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="cancel-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!pdfJsonData || pdfJsonData.length === 0) {
        return (
            <div className="fill-form-modal">
                <div className="fill-form-content">
                    <h2>No Form Fields</h2>
                    <p>This PDF does not contain any form fields that can be filled out.</p>
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

                <div className="form-fields">
                    {pdfJsonData.map((fieldObj, idx) => {
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
                            <div key={idx} className="form-field">
                                <label htmlFor={name} className="field-label">
                                    {Array.isArray(label) ? label[0] : label}
                                </label>

                                {type === 'chk' ? (
                                    <div className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            id={name}
                                            checked={!!value}
                                            onChange={e => handleInputChange(idx, e.target.checked)}
                                            className="field-input"
                                        />
                                        {Array.isArray(label) && label[1] && (
                                            <span className="checkbox-label">{label[1]}</span>
                                        )}
                                    </div>
                                ) : type === 'ch' ? (
                                    <select
                                        id={name}
                                            value={value || ''}
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
                                    ) : (
                                        <textarea
                                            id={name}
                                            value={value}
                                            onChange={e => handleInputChange(idx, e.target.value)}
                                            className="field-input"
                                            style={{
                                                height: `${height + 60}px`,
                                                width: `${width + 60}px`,
                                                maxWidth: '100%',
                                                boxSizing: 'border-box',
                                                padding: '6px',
                                                lineHeight: '1'
                                            }}
                                        />
                                )}
                            </div>
                        );
                    })}
                </div>

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
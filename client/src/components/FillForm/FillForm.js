import React, { useState, useEffect } from 'react';
import * as PdfToJson from './PdfToJson';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import SignaturePad from '../SignaturePad/SignaturePad';

function FillForm({ pdfData, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdfJsonData, setPdfJsonData] = useState([]);

    useEffect(() => {
        const convertPdfToJson = async () => {
            try {
                const jsonResult = await PdfToJson.convertPdfToJson(pdfData.url);
                setPdfJsonData(jsonResult);
                console.log(jsonResult);

                if (jsonResult.length === 0) {
                    setError("No form fields found in this PDF");
                    return;
                }
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

                <div className="form-fields">
                    {pdfJsonData.length === 0 ? (
                        <p>Attempting to load form…</p>
                    ) : (
                        pdfJsonData.map((fieldObj, idx) => {
                            const { label, inputField } = fieldObj;
                            const name = inputField.fieldName;
                            const type = (inputField.inputType || '').toLowerCase();
                            let value = inputField.value ?? '';
                            const options = inputField.options || [];
                            const { width, height } = inputField;

                            if (type === '' || /^field\s?\d+$/i.test(label.trim().toLowerCase())) {
                                return null;
                            }

                            // Check if this is a signature field
                            const isSignatureField = label.toLowerCase().includes('signature');
                            if (isSignatureField) {
                                return (
                                    <div key={idx} className="form-field">
                                        <label htmlFor={name} className="field-label no-select">
                                            {Array.isArray(label) ? label[0] : label}
                                        </label>
                                        <SignaturePad
                                            width={width * 2}
                                            height={height * 5}

                                            onChange={dataUrl => {
                                                setPdfJsonData(prevData => {
                                                    const updated = [...prevData];
                                                    if (updated[idx] && updated[idx].inputField) {
                                                        updated[idx] = {
                                                            ...updated[idx],
                                                            inputField: {
                                                                ...updated[idx].inputField,
                                                                value: dataUrl
                                                            }
                                                        };
                                                    }
                                                    return updated;
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            }

                            if (type === 'ch' && Array.isArray(value)) {
                                value = value[0] || '';
                            }

                            return (
                                <div key={idx} className="form-field">
                                    <label htmlFor={name} className="field-label no-select">
                                        {Array.isArray(label) ? label[0] : label}
                                    </label>

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
                                    ) : type === 'ch' ? (
                                        <select
                                            id={name}
                                            value={value || ''}
                                            onChange={e => handleInputChange(idx, e.target.value)}
                                                className="field-input select-dropdown no-select"
                                        >
                                            <option value="">-- select --</option>
                                            {options.map(opt => (
                                                <option key={opt.exportValue} value={opt.exportValue}>
                                                    {opt.displayValue}
                                                </option>
                                            ))}
                                        </select>
                                        ) : height > 20 ? (
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
                                            ) : (
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
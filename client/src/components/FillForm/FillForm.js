import React, { useState, useEffect } from 'react';
import * as PdfToJson from './PdfToJson';

function FillForm({ pdfData, onClose }) {
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [pdfJsonData, setPdfJsonData] = useState([]);

    // Initialize form values
    useEffect(() => {
        const convertPdfToJson = async () => {
            try {
                const jsonResult = await PdfToJson.convertPdfToJson(pdfData.url);
                setPdfJsonData(jsonResult);
                console.log(jsonResult);

                /*
                jsonResult[0] =
                {
                    "fieldType": "dropdown",
                    "label": "Name of Court. Ontario Court of Justice, Superior Court of Justice, Superior Court of Justice Family Court Branch",
                    "associatedLabel": "Name of Court. Ontario Court of Justice, Superior Court of Justice, Superior Court of Justice Family Court Branch",
                    "inputField": {
                        "fieldName": "form1[0].page1[0].body[0].courtDetails[0].court[0].nameOfCourt[0]",
                        "inputType": "ch",
                        "value": [
                            ""
                        ],
                        "options": [
                            {
                                "exportValue": "Ontario Court of Justice",
                                "displayValue": "Ontario Court of Justice"
                            },
                            {
                                "exportValue": "Superior Court of Justice",
                                "displayValue": "Superior Court of Justice"
                            },
                            {
                                "exportValue": "Superior Court of Justice Family Court ",
                                "displayValue": "Superior Court of Justice Family Court "
                            }
                        ],
                        "x": 33.818,
                        "y": 713.53,
                        "width": 335.58500000000004,
                        "height": 16.18100000000004,
                        "page": 1
                    }
                }
                */

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
                        <p>Attempting to load form…</p>
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
                                                // If its a larger text input then its most likely a textarea (Unable to detect textarea inputs)
                                                : height > 20 ? (

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
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { getStorage, ref, getDownloadURL, getBytes } from 'firebase/storage';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function DownloadUpdatedJsonToPdf(pdfData, jsonResult) {
    try {
        console.log('--- PDF Fill Debug ---');
        console.log('Fetching PDF from:', pdfData.url);

        const response = await fetch(pdfData.url);
        console.log('Fetch response status:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log('Fetched PDF size:', arrayBuffer.byteLength);

        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();

        // Debug: Log all fields in the PDF
        const allFields = form.getFields();
        console.log('All fields in PDF:');
        allFields.forEach(f => {
            console.log('  -', f.getName(), '| type:', f.constructor.name);
        });

        // Set values
        for (let i = 0; i < jsonResult.length; i++) {
            const { fieldName, value: fieldValue, options } = jsonResult[i].inputField;
            const field = form.getFieldMaybe?.(fieldName);

            console.log(`Attempting to set field: '${fieldName}' to value:`, fieldValue);

            if (!field) {
                console.warn(`Field '${fieldName}' not found in PDF.`);
                continue;
            }

            const fieldType = field.constructor.name;
            console.log(`Found field '${fieldName}' of type '${fieldType}'. Setting value...`);

            switch (fieldType) {
                case 'PDFTextField':
                    field.setText(fieldValue?.toString() || '');
                    console.log(`Set text field '${fieldName}' to '${fieldValue}'.`);
                    break;

                case 'PDFDropdown': {
                    const normalizedValue = fieldValue?.toString()?.trim() || '';
                    const validOptions = (options || []).map(opt => opt.exportValue || opt);
                    if (validOptions.includes(normalizedValue)) {
                        field.select(normalizedValue);
                        console.log(`Set dropdown field '${fieldName}' to '${normalizedValue}'.`);
                    } else {
                        console.warn(`Invalid dropdown value: "${normalizedValue}" for field "${fieldName}". Skipping.`);
                    }
                    break;
                }

                case 'PDFCheckBox':
                    if (fieldValue === 'Off' || !fieldValue) {
                        field.uncheck();
                        console.log(`Unchecked checkbox field '${fieldName}'.`);
                    } else {
                        field.check();
                        console.log(`Checked checkbox field '${fieldName}'.`);
                    }
                    break;

                default:
                    console.warn(`Unsupported field type: ${fieldType} for field '${fieldName}'.`);
            }
        }

        const pdfBytes = await pdfDoc.save();

        // Trigger file download in the browser
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filled-form-' + pdfData.name + '.pdf';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error in DownloadUpdatedJsonToPdf:', error);
        throw new Error(`Failed to generate filled PDF: ${error.message}`);
    }
}

export async function convertPdfToJson(pdfUrl) {
    try {
        console.log('=== PDF Processing Started ===');
        console.log('Original PDF URL:', pdfUrl);

        // Validate URL
        if (!pdfUrl) {
            throw new Error('PDF URL is required');
        }

        // Validate URL format
        try {
            new URL(pdfUrl);
        } catch (e) {
            throw new Error('Invalid PDF URL format');
        }

        console.log('Fetching PDF from URL...');

        // If it's a Firebase Storage URL, use the SDK
        if (pdfUrl.includes('firebasestorage.googleapis.com')) {
            console.log('Detected Firebase Storage URL');
            const storage = getStorage();

            // Extract and decode the file path from the URL
            const encodedPath = pdfUrl.split('/o/')[1].split('?')[0];
            const filePath = decodeURIComponent(encodedPath);
            console.log('Extracted file path:', filePath);

            const pdfRef = ref(storage, filePath);
            console.log('Created storage reference');

            try {
                // First try to get the download URL
                console.log('Getting download URL...');
                const downloadUrl = await getDownloadURL(pdfRef);
                console.log('Successfully got download URL:', downloadUrl);

                // Try to get the bytes directly first
                try {
                    console.log('Getting PDF bytes from Firebase...');
                    const bytes = await getBytes(pdfRef);
                    console.log('Successfully got PDF bytes, size:', bytes.byteLength, 'bytes');

                    if (bytes.byteLength === 0) {
                        throw new Error('Received empty PDF file');
                    }

                    return processPdfData(bytes);
                } catch (bytesError) {
                    console.log('Failed to get bytes directly, trying download URL...', bytesError);

                    // If getBytes fails, try using the download URL
                    const response = await fetch(downloadUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/pdf'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    return processPdfData(arrayBuffer);
                }
            } catch (error) {
                console.error('=== Detailed Firebase Storage Error ===');
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                console.error('Error details:', {
                    code: error.code,
                    customData: error.customData,
                    serverResponse: error.serverResponse,
                    status: error.status,
                    statusText: error.statusText
                });

                // Check for specific error types
                if (error.name === 'FirebaseError') {
                    console.error('Firebase specific error:', {
                        code: error.code,
                        message: error.message,
                        customData: error.customData
                    });
                }

                // If we get a CORS error, try using the download URL directly
                if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                    console.log('CORS error detected, trying direct download URL...');
                    try {
                        const downloadUrl = await getDownloadURL(pdfRef);
                        const response = await fetch(downloadUrl, {
                            method: 'GET',
                            mode: 'cors',
                            headers: {
                                'Accept': 'application/pdf'
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
                        }

                        const arrayBuffer = await response.arrayBuffer();
                        return processPdfData(arrayBuffer);
                    } catch (fallbackError) {
                        console.error('Fallback download failed:', fallbackError);
                        throw new Error(`Failed to download PDF: ${fallbackError.message}`);
                    }
                }

                throw new Error(`Firebase Storage error: ${error.message}`);
            }
        }

        // For non-Firebase URLs, use regular fetch
        console.log('Using regular fetch for non-Firebase URL');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const fetchOptions = {
            signal: controller.signal,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/pdf'
            }
        };

        console.log('Fetch options:', fetchOptions);
        const response = await fetch(pdfUrl, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('Fetch response not OK:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        console.log('PDF fetched successfully, size:', response.headers.get('content-length'), 'bytes');
        console.log('Content-Type:', response.headers.get('content-type'));

        const arrayBuffer = await response.arrayBuffer();
        console.log('PDF data loaded, size:', arrayBuffer.byteLength, 'bytes');

        if (arrayBuffer.byteLength === 0) {
            throw new Error('Received empty PDF file');
        }

        return processPdfData(arrayBuffer);
    } catch (error) {
        console.error('=== PDF Processing Error ===');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Enhanced error messages based on error type
        if (error.name === 'AbortError') {
            throw new Error('Request timed out while loading the PDF');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            if (error.message.includes('CORS')) {
                throw new Error('CORS error: Unable to access the PDF due to security restrictions. Please check Firebase Storage CORS configuration.');
            }
            throw new Error('Network error: Unable to reach the PDF server');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Failed to fetch PDF: The server may be unreachable or the URL may be invalid');
        } else if (error.message.includes('Invalid PDF')) {
            throw new Error('Invalid PDF format: The file may be corrupted or not a valid PDF');
        } else if (error.message.includes('Invalid URL')) {
            throw new Error('Invalid PDF URL: Please check the URL format');
        }

        throw new Error(`Failed to parse form fields: ${error.message}`);
    }
}

// Helper function to process PDF data
async function processPdfData(arrayBuffer) {
// Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
        cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully. Number of pages:", pdf.numPages);

    const results = [];

    // Loop through all the pages in the PDF
    for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}...`);
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();

        console.log(`Found ${annotations.length} annotations on page ${i}`);

        // Loop through annotations
        for (const annot of annotations) {
            if (annot.fieldName) {
                let inputType = '';
                let fieldType = '';

                // Text fields (input type = 'Tx')
                if (annot.fieldType === 'Tx') {
                    inputType = 'txt';
                    fieldType = 'text';
                }
                // Dropdowns (input type = 'Ch')
                else if (annot.fieldType === 'Ch') {
                    inputType = 'ch';
                    fieldType = 'dropdown';
                }
                // Checkboxes (input type = 'Btn')
                else if (annot.fieldType === 'Btn' && annot.checkBox) {
                    inputType = 'chk';
                    fieldType = 'checkbox';
                }

                const rect = annot.rect || [0, 0, 0, 0];
                const [x1, y1, x2, y2] = rect;
                const x = x1;
                const y = y1;
                const width = Math.abs(x2 - x1);
                const height = Math.abs(y2 - y1);

                // Options are an array (may be empty)
                const options = (annot.options || []).filter(
                    (v, i, a) =>
                        v.exportValue?.trim() &&
                        v.displayValue?.trim() &&
                        a.findIndex(
                            o =>
                                o.exportValue.trim().toLowerCase() === v.exportValue.trim().toLowerCase() &&
                                o.displayValue.trim().toLowerCase() === v.displayValue.trim().toLowerCase()
                        ) === i
                );

                // Handling missing fieldValue (set default to '')
                const fieldValue = annot.fieldValue !== undefined ? annot.fieldValue : '';

                const fieldObj = {
                    fieldType,
                    label: annot.alternativeText || annot.fieldName,
                    associatedLabel: annot.alternativeText || annot.fieldName,
                    inputField: {
                        fieldName: annot.fieldName,
                        inputType,
                        value: fieldValue,
                        options: options,
                        x,
                        y,
                        width,
                        height,
                        page: i,
                    },
                };

                results.push(fieldObj);
            }
        }
    }

    console.log(`PDF conversion complete. Found ${results.length} form fields.`);
    return results;
}


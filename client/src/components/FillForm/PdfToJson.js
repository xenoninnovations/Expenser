import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { getStorage, ref, getDownloadURL, getBytes } from 'firebase/storage';

// Add debug logging for PDF.js version
console.log('=== PDF.js Debug Info ===');
console.log('PDF.js Version:', pdfjsLib.version);
console.log('PDF.js Worker Source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log('PDF.js Build:', pdfjsLib.build);

// Set up the worker for pdf.js with fallback options
const setupPdfWorker = async () => {
    try {
        const pdfjsVersion = pdfjsLib.version;
        console.log('PDF.js version:', pdfjsVersion);

        // Try to load the worker from the public directory first
        try {
            const workerPath = '/pdf.worker.min.js';
            const response = await fetch(workerPath);
            if (response.ok) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
                console.log('PDF.js worker loaded from public directory');
                return;
            }
        } catch (e) {
            console.warn('Failed to load worker from public directory:', e);
        }

        // Try CDN options in sequence
        const cdnUrls = [
            `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.mjs`,
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.mjs`,
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.mjs`
        ];

        for (const url of cdnUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = url;
                    console.log('PDF.js worker loaded from:', url);
                    return;
                }
            } catch (e) {
                console.warn(`Failed to load worker from ${url}:`, e);
            }
        }

        // If all CDN attempts fail, try to load from node_modules
        try {
            const workerUrl = new URL(
                'pdfjs-dist/build/pdf.worker.mjs',
                import.meta.url
            ).toString();
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
            console.log('PDF.js worker loaded from node_modules');
        } catch (e) {
            console.warn('Failed to load worker from node_modules:', e);
            throw new Error('All worker loading attempts failed');
        }
    } catch (error) {
        console.error('Failed to set up PDF.js worker:', error);
        throw error;
    }
};

// Initialize worker
setupPdfWorker().catch(error => {
    console.error('Worker initialization failed:', error);
});

export async function DownloadUpdatedJsonToPdf(pdfData, jsonResult) {
    try {
        console.log('--- PDF Fill Debug ---');
        console.log('Fetching PDF from:', pdfData.url);

        const response = await fetch(pdfData.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();

        // // Set empty values for editable input fields before filling the PDF
        // for (let i = 0; i < jsonResult.length; i++) {
        //     const inputField = jsonResult[i].inputField;
        //     const fieldType = jsonResult[i].fieldType;
        //     if (
        //         fieldType === 'text' &&
        //         (!inputField.value || inputField.value === '')
        //     ) {
        //         inputField.value = 'Empty';
        //     }
        // }

        // Now fill the PDF fields using the updated values
        for (let i = 0; i < jsonResult.length; i++) {
            const { fieldName, value: fieldValue, options, x, y, width, height, page } = jsonResult[i].inputField;
            const field = form.getFieldMaybe?.(fieldName);

            if (!field) {
                console.warn(`Field '${fieldName}' not found.`);
                continue;
            }

            // Get the field type from our form data instead of the constructor
            const fieldType = jsonResult[i].fieldType;
            console.log(`Processing field: ${fieldName}, Type: ${fieldType}, Value: ${fieldValue}`);

            try {
                // Only handle normal field filling, do not draw any lines or dots for fields
                switch (fieldType) {
                    case 'text':
                        if (typeof field.setText === 'function') {
                            field.setText(fieldValue?.toString() || '');
                        }
                        break;

                    case 'dropdown':
                        if (typeof field.select === 'function') {
                            const normalizedValue = fieldValue?.toString()?.trim() || '';
                            const validOptions = (options || []).map(opt => opt.exportValue || opt);

                            if (validOptions.includes(normalizedValue)) {
                                field.select(normalizedValue);
                            } else {
                                console.warn(`Invalid dropdown value: "${normalizedValue}" for field "${fieldName}". Skipping.`);
                            }
                        }
                        break;

                    case 'checkbox':
                        if (typeof field.check === 'function') {
                            if (fieldValue === 'Off' || !fieldValue) {
                                field.uncheck();
                            } else {
                                field.check();
                            }
                        }
                        break;

                    default:
                        // Try to handle unknown field types based on available methods
                        if (typeof field.setText === 'function') {
                            field.setText(fieldValue?.toString() || '');
                        } else if (typeof field.check === 'function') {
                            if (fieldValue === 'Off' || !fieldValue) {
                                field.uncheck();
                            } else {
                                field.check();
                            }
                        } else if (typeof field.select === 'function') {
                            const normalizedValue = fieldValue?.toString()?.trim() || '';
                            field.select(normalizedValue);
                        } else {
                            console.warn(`Unsupported field type: ${fieldType} for field ${fieldName}`);
                        }
                }
            } catch (fieldError) {
                console.error(`Error setting value for field ${fieldName}:`, fieldError);
            }
        }

        // Add a red dot at the top-left corner of each editable text field
        for (let i = 0; i < jsonResult.length; i++) {
            const inputField = jsonResult[i].inputField;
            const fieldType = jsonResult[i].fieldType;
            if (
                fieldType === 'text' &&
                inputField.rect &&
                (!inputField.value || inputField.value === '')
            ) {
                const pdfPage = pdfDoc.getPage(inputField.page - 1);
                const [x1, y1, x2, y2] = inputField.rect;
                const left = Math.min(x1, x2);
                const right = Math.max(x1, x2);
                const bottom = Math.min(y1, y2);
                const top = Math.max(y1, y2);

                pdfPage.drawLine({
                    start: { x: left, y: top },
                    end: { x: right, y: bottom },
                    thickness: 1.5,
                    color: rgb(0, 0, 0),
                });
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

        // If it's a Firebase Storage URL, use the SDK
        if (pdfUrl.includes('firebasestorage.googleapis.com')) {
            console.log('Detected Firebase Storage URL');
            const storage = getStorage();
            const encodedPath = pdfUrl.split('/o/')[1].split('?')[0];
            const filePath = decodeURIComponent(encodedPath);
            const pdfRef = ref(storage, filePath);

            try {
                const downloadUrl = await getDownloadURL(pdfRef);
                const bytes = await getBytes(pdfRef);
                return processPdfData(bytes);
            } catch (error) {
                console.error('Firebase Storage error:', error);
                throw error;
            }
        }

        // For non-Firebase URLs, use regular fetch
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return processPdfData(arrayBuffer);
    } catch (error) {
        console.error('Error in convertPdfToJson:', error);
        throw error;
    }
}

async function processPdfData(arrayBuffer) {
    console.log('Starting PDF processing...');
    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "https://unpkg.com/pdfjs-dist@latest/standard_fonts/",
    });

    try {
        const pdf = await loadingTask.promise;
        console.log("PDF loaded successfully. Number of pages:", pdf.numPages);
        console.log("PDF Info:", pdf._pdfInfo);

        // Check if it's an XFA form
        if (pdf._pdfInfo && pdf._pdfInfo.xfa) {
            console.warn("PDF contains XFA form data");
        }

        // Check if it's an AcroForm
        if (pdf._pdfInfo && pdf._pdfInfo.acroForm) {
            console.log("PDF contains AcroForm data");
        }

        const results = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const annotations = await page.getAnnotations();

            for (const annot of annotations) {
                if (annot.fieldName) {
                    let inputType = '';
                    let fieldType = '';

                    if (annot.fieldType === 'Tx') {
                        inputType = 'txt';
                        fieldType = 'text';
                    } else if (annot.fieldType === 'Ch') {
                        inputType = 'ch';
                        fieldType = 'dropdown';
                    } else if (annot.fieldType === 'Btn' && annot.checkBox) {
                        inputType = 'chk';
                        fieldType = 'checkbox';
                    }

                    const rect = annot.rect || [0, 0, 0, 0];
                    const [x1, y1, x2, y2] = rect;
                    const x = x1;
                    const y = y1;
                    const width = Math.abs(x2 - x1);
                    const height = Math.abs(y2 - y1);

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
                            rect: rect,
                        },
                    };

                    results.push(fieldObj);
                }
            }
        }

        console.log(`PDF conversion complete. Found ${results.length} form fields.`);
        return results;
    } catch (error) {
        console.error('Error in processPdfData:', error);
        throw error;
    }
}


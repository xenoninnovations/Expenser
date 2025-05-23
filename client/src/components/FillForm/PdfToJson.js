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
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();

        // Set values
        for (let i = 0; i < jsonResult.length; i++) {
            const { fieldName, value: fieldValue, options } = jsonResult[i].inputField;
            const field = form.getFieldMaybe?.(fieldName);

            if (!field) {
                console.warn(`Field '${fieldName}' not found.`);
                continue;
            }

            const fieldType = field.constructor.name;

            switch (fieldType) {
                case 'PDFTextField':
                    field.setText(fieldValue?.toString() || '');
                    break;

                case 'PDFDropdown': {
                    const normalizedValue = fieldValue?.toString()?.trim() || '';
                    const validOptions = (options || []).map(opt => opt.exportValue || opt);

                    if (validOptions.includes(normalizedValue)) {
                        field.select(normalizedValue);
                    } else {
                        console.warn(`Invalid dropdown value: "${normalizedValue}" for field "${fieldName}". Skipping.`);
                    }
                    break;
                }

                case 'PDFCheckBox':
                    if (fieldValue === 'Off' || !fieldValue) {
                        field.uncheck();
                    } else {
                        field.check();
                    }
                    break;

                default:
                    console.warn(`Unsupported field type: ${fieldType}`);
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
    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
        cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully. Number of pages:", pdf.numPages);

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
                    },
                };

                results.push(fieldObj);
            }
        }
    }

    console.log(`PDF conversion complete. Found ${results.length} form fields.`);
    return results;
}


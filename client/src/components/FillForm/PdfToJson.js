import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
export async function DownloadUpdatedJsonToPdf(pdfData, jsonResult) {
    const response = await fetch(pdfData.url);
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


    // Make fields uneditable
    // form.flatten();

    const pdfBytes = await pdfDoc.save();

    // Trigger file download in the browser
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filled-form-' + pdfData.name + '.pdf';
    a.click();
    URL.revokeObjectURL(url);
}

export async function convertPdfToJson(pdfUrl) {
    const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
        cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully");

    const results = [];

    // Loop through all the pages in the PDF
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();

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
                        options: options,  // Dropdown options
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


    return results;
}


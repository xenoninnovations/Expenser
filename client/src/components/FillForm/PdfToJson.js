import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
export async function DownloadUpdatedFile(pdfData, jsonResult) {
    const response = await fetch(pdfData.url);
    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Set values
    for (let i = 0; i < jsonResult.length; i++) {
        const fieldName = jsonResult[i].inputField.fieldName;
        const fieldValue = jsonResult[i].inputField.value;
        const field = form.getFieldMaybe(fieldName);

        if (field) {
            const fieldType = field.constructor.name;

            switch (fieldType) {
                case 'PDFTextField':
                    field.setText(fieldValue);
                    break;
                case 'PDFDropdown':
                    field.select(fieldValue);
                    break;
                case 'PDFCheckBox':
                    field.check();
                    break;
                // Add other field types as needed
                default:
                    console.warn(`Unsupported field type: ${fieldType}`);
            }
        } else {
            console.warn(`Field '${fieldName}' not found.`);
        }
    }


    // fields become uneditable
    form.flatten();

    const pdfBytes = await pdfDoc.save();

    // Trigger file download in the browser
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filled-form-' + pdfData.name+ '.pdf';
    a.click();
    URL.revokeObjectURL(url);
}
export async function PDF_TO_JSON(pdfData) {
    const loadingTask = pdfjsLib.getDocument({
        url: pdfData.url,
        cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
        cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    console.log("PDF loaded successfully");

    const results = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const annotations = await page.getAnnotations();

        // Find the "Region" label
        let regionLabel = null;
        for (const item of textContent.items) {
            if (item.str.trim() === "Region") {
                const [, , , , x, y] = item.transform;
                regionLabel = { x, y };
                break;
            }
        }

        if (regionLabel) {
            // Find the nearest input field above the "Region" label
            let nearestField = null;
            let minDistance = Infinity;

            for (const annotation of annotations) {
                const [x1, y1, x2, y2] = annotation.rect;
                const fieldY = (y1 + y2) / 2;
                const fieldX = (x1 + x2) / 2;

                // Check if the field is above the label and within horizontal range
                if (fieldY > regionLabel.y && Math.abs(fieldX - regionLabel.x) < 100) {
                    const distance = fieldY - regionLabel.y;
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestField = {
                            label: "Region",
                            inputField: {
                                fieldName: annotation.fieldName || "Unnamed Field",
                                inputType: annotation.fieldType || "Unknown",
                                value: annotation.fieldValue || "",
                                options: annotation.options ? annotation.options.map(opt => opt.displayValue || opt.value) : []
                            }
                        };
                    }
                }
            }

            if (nearestField) {
                results.push(nearestField);
            }
        }

        // Find the "Court File No. (if known)" label
        let courtFileLabel = null;
        for (const item of textContent.items) {
            if (item.str.trim() === "Court File No. (if known)") {
                const [, , , , x, y] = item.transform;
                courtFileLabel = { x, y };
                break;
            }
        }

        if (courtFileLabel) {
            // Find the nearest text input field above the label
            let nearestField = null;
            let minDistance = Infinity;

            for (const annotation of annotations) {
                const [x1, y1, x2, y2] = annotation.rect;
                const fieldY = (y1 + y2) / 2;
                const fieldX = (x1 + x2) / 2;

                // Check if the field is above the label, within horizontal range, and is a text field
                if (
                    fieldY > courtFileLabel.y &&
                    Math.abs(fieldX - courtFileLabel.x) < 100 &&
                    annotation.fieldType === "Tx"
                ) {
                    const distance = fieldY - courtFileLabel.y;
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestField = {
                            label: "Court File No. (if known)",
                            inputField: {
                                fieldName: annotation.fieldName || "Unnamed Field",
                                inputType: annotation.fieldType || "Unknown",
                                value: annotation.fieldValue || "",
                                options: []
                            }
                        };
                    }
                }
            }

            if (nearestField) {
                results.push(nearestField);
            }
        }
    }

    return results;
}

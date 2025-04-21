import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
export async function DownloadUpdatedJsonToPdf(pdfData, jsonResult) {
    const response = await fetch(pdfData.url);// Uses the url to inject data into the pdf file and download
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
                    if (fieldValue === 'Off' || !fieldValue) {
                        field.uncheck();
                    } else {
                        field.check();
                    }
                    break;
                // Add other fields if requied
                default:
                    console.warn(`Unsupported field type: ${fieldType}`);
            }
        } else {
            console.warn(`Field '${fieldName}' not found.`);
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

        // Finding check boxes:
        for (const annotation of annotations) {
            if (annotation.fieldType === "Btn" && annotation.checkBox) {
                const [x1, y1, x2, y2] = annotation.rect;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;

                let leftLabel = null;
                let rightLabel = null;

                for (const item of textContent.items) {
                    const [, , , , itemX, itemY] = item.transform;
                    const text = item.str.trim();

                    // Check for left label (e.g., "a)")
                    if (
                        itemX < centerX &&
                        Math.abs(itemY - centerY) < 10 &&
                        /^[a-z]\)$/.test(text)
                    ) {
                        leftLabel = text;
                    }

                    // Check for right label
                    if (
                        itemX > centerX &&
                        Math.abs(itemY - centerY) < 10 &&
                        text.length > 0
                    ) {
                        rightLabel = text;
                    }

                    if (leftLabel && rightLabel) {
                        break;
                    }
                }

                if (leftLabel && rightLabel) {
                    results.push({
                        // label: `${leftLabel} ${rightLabel}`,
                        label: [leftLabel, rightLabel],

                        inputField: {
                            fieldName: annotation.fieldName || "Unnamed Field",
                            inputType: "Chk",
                            value: annotation.fieldValue || "",
                            options: []
                        }
                    });
                }
            }
        }

        // Finding associatedLabel with their input text boxes

        // Extract and sort text items by Y-coordinate (top to bottom)
        const sortedTextItems = textContent.items
            .map(item => {
                const [, , , , x, y] = item.transform;
                return { text: item.str.trim(), x, y };
            })
            .sort((a, b) => b.y - a.y); // Higher Y means higher on the page

        let currentSectionLabel = null;

        for (const item of sortedTextItems) {
            const { text, x: labelX, y: labelY } = item;

            // Update current section label if text ends with ":"
            if (text.endsWith(":")) {
                currentSectionLabel = text;
                continue;
            }

            // Check for list item labels like "a.", "b.", etc.
            if (/^[a-z]\.$/.test(text)) {
                let nearestField = null;
                let minDistance = Infinity;

                for (const annotation of annotations) {
                    if (annotation.fieldType === "Tx") {
                        const [x1, y1, x2, y2] = annotation.rect;
                        const fieldX = (x1 + x2) / 2;
                        const fieldY = (y1 + y2) / 2;

                        // Check if the field is to the right of the label and horizontally aligned
                        if (
                            fieldX > labelX &&
                            Math.abs(fieldY - labelY) < 10
                        ) {
                            const distance = fieldX - labelX;
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestField = {
                                    label: text,
                                    inputField: {
                                        fieldName: annotation.fieldName || "Unnamed Field",
                                        inputType: "Txt",
                                        value: annotation.fieldValue || "",
                                        options: []
                                    },
                                    associatedLabel: currentSectionLabel
                                };
                            }
                        }
                    }
                }
                if (nearestField) {
                    results.push(nearestField);
                }
            }
        }
    }
    return results;
}

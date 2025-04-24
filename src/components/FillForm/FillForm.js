import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getStorage, ref, getDownloadURL, uploadBytes, getBlob } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { Stage, Layer, Text, Image } from 'react-konva';
import Konva from 'konva';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FillForm({ pdfData, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [pdfImage, setPdfImage] = useState(null);
    const [textFields, setTextFields] = useState([]);
    const stageRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!pdfData) {
            setError("No PDF data provided");
            return;
        }

        const getPdfUrl = async () => {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, `pdfs/${pdfData.name}`);
                const url = await getDownloadURL(storageRef);
                setPdfUrl(url);
                await loadPdfAndRender(url);
            } catch (error) {
                console.error('Error getting PDF URL:', error);
                setError('Error loading PDF: ' + error.message);
            }
        };

        getPdfUrl();
    }, [pdfData]);

    useEffect(() => {
        if (pdfUrl) {
            loadPdfAndRender(pdfUrl);
        }
    }, [currentPage, scale]);

    const loadPdfAndRender = async (pdfUrl) => {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const image = new Image();
            image.src = canvas.toDataURL();
            
            image.onload = () => {
                const konvaImage = new Konva.Image({
                    image: image,
                    width: viewport.width,
                    height: viewport.height
                });
                setPdfImage(konvaImage);
                setStageSize({
                    width: viewport.width,
                    height: viewport.height
                });
            };
        } catch (error) {
            console.error('Error loading PDF:', error);
            setError('Error loading PDF: ' + error.message);
        }
    };

    const addTextField = () => {
        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();
        
        const newField = {
            id: uuidv4(),
            text: 'Text',
            x: pointerPos ? pointerPos.x / scale : 50,
            y: pointerPos ? pointerPos.y / scale : 50,
            page: currentPage,
            fontSize: 16,
            draggable: true
        };
        
        setTextFields(prev => [...prev, newField]);
    };

    const handleDragEnd = (e, id) => {
        const newPos = e.target.position();
        setTextFields(prev => prev.map(field => 
            field.id === id 
                ? { ...field, x: newPos.x / scale, y: newPos.y / scale }
                : field
        ));
    };

    const handleTextDblClick = (e, id) => {
        const textNode = e.target;
        const textPosition = textNode.getAbsolutePosition();
        
        // Create textarea over the text
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${textPosition.y}px`;
        textarea.style.left = `${textPosition.x}px`;
        textarea.style.width = `${textNode.width()}px`;
        textarea.style.height = `${textNode.height()}px`;
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = '1px solid black';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = '1';
        textarea.style.fontFamily = 'Arial';
        
        textarea.focus();

        textarea.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                textNode.text(textarea.value);
                document.body.removeChild(textarea);
            }
        });

        textarea.addEventListener('blur', function() {
            textNode.text(textarea.value);
            document.body.removeChild(textarea);
            
            setTextFields(prev => prev.map(field => 
                field.id === id 
                    ? { ...field, text: textarea.value }
                    : field
            ));
        });
    };

    const fillAndSavePDF = async () => {
        if (!pdfUrl) {
            setError("PDF URL not available");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(pdfUrl);
            const pdfBytes = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            textFields.forEach(async field => {
                const pages = pdfDoc.getPages();
                const page = pages[field.page - 1];
                
                page.drawText(field.text, {
                    x: field.x,
                    y: page.getHeight() - field.y,
                    size: field.fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            });
            
            const filledPdfBytes = await pdfDoc.save();
            const storage = getStorage();
            const filledPdfName = `filled_${pdfData.name}`;
            const storageRef = ref(storage, `filled/${filledPdfName}`);
            await uploadBytes(storageRef, filledPdfBytes, { contentType: 'application/pdf' });
            const filledPdfUrl = await getDownloadURL(storageRef);

            const filledFormId = uuidv4();
            await setDoc(doc(db, 'filledForms', filledFormId), {
                originalId: pdfData.id,
                filledPdfUrl,
                filledAt: new Date().toISOString(),
                textFields
            });

            const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filledPdfName;
            link.click();
            URL.revokeObjectURL(downloadUrl);

            onClose();
        } catch (error) {
            console.error('Error filling PDF:', error);
            setError('Error filling PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fill-form-modal">
            <div className="fill-form-content">
                <div className="editor-header">
                    <h2>Fill PDF: {pdfData.name}</h2>
                    <button 
                        onClick={addTextField}
                        className="add-text-button"
                        style={{
                            padding: '8px 16px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '10px'
                        }}
                    >
                        Add Text
                    </button>
                </div>

                <div className="editor-container" ref={containerRef}>
                    <div className="pdf-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage <= 1}
                        >
                            Previous Page
                        </button>
                        <span>Page {currentPage} of {numPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                            disabled={currentPage >= numPages}
                        >
                            Next Page
                        </button>
                        <button onClick={() => setScale(prev => prev + 0.2)}>
                            Zoom In
                        </button>
                        <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}>
                            Zoom Out
                        </button>
                    </div>

                    <Stage
                        width={stageSize.width}
                        height={stageSize.height}
                        ref={stageRef}
                        style={{ background: '#f0f0f0' }}
                    >
                        <Layer>
                            {pdfImage && (
                                <Image
                                    image={pdfImage}
                                    width={stageSize.width}
                                    height={stageSize.height}
                                />
                            )}
                            {textFields
                                .filter(field => field.page === currentPage)
                                .map(field => (
                                    <Text
                                        key={field.id}
                                        text={field.text}
                                        x={field.x * scale}
                                        y={field.y * scale}
                                        fontSize={field.fontSize * scale}
                                        draggable={true}
                                        onDragEnd={(e) => handleDragEnd(e, field.id)}
                                        onDblClick={(e) => handleTextDblClick(e, field.id)}
                                        fill="#000000"
                                        perfectDrawEnabled={false}
                                        listening={true}
                                    />
                                ))}
                        </Layer>
                    </Stage>
                </div>

                <div className="button-group">
                    <button
                        className="generate-button"
                        onClick={fillAndSavePDF}
                        disabled={loading}
                    >
                        {loading ? 'Saving PDF...' : 'Save PDF'}
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
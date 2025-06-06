import React, { useRef, useState, useEffect } from "react";
import "./SignaturePad.css";

export default function SignaturePad({ width = 400, height = 150, onChange }) {
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            context.lineCap = "round";
            context.strokeStyle = "black";
            context.lineWidth = 2;
            contextRef.current = context;
        }
        // Listen for mouseup on the window to stop drawing even if mouse is released outside the canvas
        window.addEventListener("mouseup", finishDrawing);
        return () => {
            window.removeEventListener("mouseup", finishDrawing);
        };
        // eslint-disable-next-line
    }, []);

    const emitChange = () => {
        if (onChange && canvasRef.current) {
            onChange(canvasRef.current.toDataURL());
        }
    };

    const startDrawing = (e) => {
        if (!contextRef.current) return;
        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        document.body.style.userSelect = 'none'; // Prevent text selection globally
    };

    const draw = (e) => {
        if (!isDrawing || !contextRef.current) return;
        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        emitChange();
    };

    function finishDrawing() {
        if (!contextRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);
        document.body.style.userSelect = ''; // Restore default
        emitChange();
    }

    function clearSignature() {
        if (!contextRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        emitChange();
    }

    return (
        <div className="signature-container" style={{ maxWidth: width }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={() => { }}
                onDragStart={e => e.preventDefault()}
                className="signature-pad"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            />
            <button className="clear-signature-btn no-select" onClick={clearSignature}>
                Clear Signature
            </button>
        </div>
    );
} 
import React, { useState, useEffect } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


import "../../pages/assets/styles/UploadPDF.css";//TODO: Update this to my own css script

import { db } from "../../config.js";

function AddPDF({ closeModal, pdfID, refreshUploadPDF }) {
    const [selectedPDFFile, setSelectedPDFFile] = useState(null); // Store file object
    const storage = getStorage();

    const handleUpload = async () => {
        try {
            const storageRef = ref(storage, `pdfs/${selectedPDFFile.name}`);
            const snapshot = await uploadBytes(storageRef, selectedPDFFile); // Upload file
            const downloadURL = await getDownloadURL(snapshot.ref); // Get file URL
            console.log("File available at:", downloadURL);

            // Refresh the list and close modal
            refreshUploadPDF && refreshUploadPDF();
            closeModal();
        } catch (error) {
            console.error("Error uploading PDF File: ", error);
        }
    };
    const browseFile = async () => {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/pdf"; // Restrict to PDF files (optional)

            // Handle file selection
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    setSelectedPDFFile(file)
                }
            };

            // Trigger the file selection dialog
            input.click();

        } catch (error) {
            console.error("Error Browsing PDF File: ", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload PDF File</h2>
                <p>
                    Upload your pdf file which you want to convert to a form format!
                </p>

                <p>Selected File: {selectedPDFFile?.name || "No file selected"}</p>
                <div className="button-group">
                    <button className="modal-button" onClick={browseFile}>
                        Browse File
                    </button>
                    <button className="modal-button" onClick={handleUpload}>
                        Upload PDF File
                    </button>
                    <button className="cancel-button" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );


}

export default AddPDF;

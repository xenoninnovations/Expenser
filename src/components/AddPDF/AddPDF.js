import React from "react";
import { doc, deleteDoc } from "firebase/firestore";

import "../../pages/assets/styles/UploadPDF.css";//TODO: Update this to my own css script

import { db } from "../../config.js";

function AddPDF({ closeModal, pdfID, refreshUploadPDF }) {
    const handleUpload = async () => {
        try {
            // const expenseRef = doc(db, "expenses", expenseId); // Reference the specific document
            // await deleteDoc(expenseRef); // Delete the document
            // console.log("Expense deleted successfully");

            // Refresh the list and close modal
            refreshUploadPDF && refreshUploadPDF();
            closeModal();
        } catch (error) {
            console.error("Error uploading PDF File: ", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload PDF File</h2>
                <p>
                    Upload your pdf file which you want to convert to a form format!
                </p>
                <div className="button-group">
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

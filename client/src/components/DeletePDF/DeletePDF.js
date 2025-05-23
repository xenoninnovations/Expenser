import React from 'react';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config.js";
import { deleteObject } from "firebase/storage";
import { getStorage, ref } from "firebase/storage";

function DeletePDF({ closeModal, pdf, refreshAllPdfs, onDeleteStart }) {
    const handleDelete = async () => {
        try {
            // Optimistically update the UI
            if (onDeleteStart) {
                onDeleteStart(pdf.id);
            }

            // Close modal immediately
            closeModal();

            // Start the deletion process in the background
            (async () => {
                try {
                    // Start both deletions in parallel
                    await Promise.all([
                        // Delete the PDF file from storage
                        (async () => {
                            const storage = getStorage();
                            const fileRef = ref(storage, `pdfs/${pdf.name}`);
                            await deleteObject(fileRef);
                        })(),

                        // Delete metadata from Firestore
                        (async () => {
                            await deleteDoc(doc(db, 'pdfs', pdf.id));
                        })()
                    ]);

                    // Only refresh if the optimistic update wasn't provided
                    if (!onDeleteStart && refreshAllPdfs) {
                        refreshAllPdfs();
                    }
                } catch (error) {
                    console.error("Error deleting PDF:", error);
                    // Show error in the main UI
                    alert(`Failed to delete ${pdf.name}. Please try again.`);
                    // If we have the refresh function, use it to restore the list
                    if (refreshAllPdfs) {
                        refreshAllPdfs();
                    }
                }
            })();
        } catch (error) {
            console.error("Error in delete operation:", error);
            alert("Failed to start delete operation. Please try again.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Delete PDF</h2>
                <p>
                    Are you sure you want to delete {pdf.name}? This action cannot be
                    undone.
                </p>

                <div className="button-group">
                    <button
                        className="modal-button del"
                        onClick={handleDelete}
                    >
                        Confirm Delete
                    </button>
                    <button
                        className="cancel-button"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletePDF;

import React from "react";
import { doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../config.js";
import { deleteObject } from "firebase/storage";
import { getStorage, ref } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";


function DeletePDF({ closeModal, pdf, refreshAllPdfs }) {
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${pdf.name}"?`)) return;

        try {
          //Delete the pdf file
          const storage = getStorage();
          const fileRef = ref(storage, `pdfs/${pdf.name}`);
          await deleteObject(fileRef);

          // Delete metadata
          const pdfsRef = collection(db, 'pdfs');
          const q = query(pdfsRef, where("name", "==", pdf.name));
          const snapshot = await getDocs(q);

          for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, 'pdfs', docSnap.id));
            }
            
            // Refresh the list and close modal

            if (refreshAllPdfs) {
                await refreshAllPdfs();
            }
            closeModal();



        } catch (error) {
          console.error("Error deleting PDF:", error);
          alert("Failed to delete the PDF. Please try again.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Delete PDF</h2>
                <p>
                    Are you sure you want to delete this PDF file? This action cannot be
                    undone.
                </p>
                <div className="button-group">
                    <button className="modal-button del" onClick={handleDelete}>
                        Confirm Delete
                    </button>
                    <button className="cancel-button" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletePDF;

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

import { db } from "../../../config";
import Navbar from "../../../components/NavBar/NavBar";
import "../../assets/styles/global.css";
import "../../assets/styles/UploadPDF.css"; //TODO: Update this to my own css script
import dots from "../../../images/dots.svg";
import { FaPen, FaTrash, FaPlus, FaFileExport, FaEdit } from "react-icons/fa";

// Pop-up dialog. useful for upload pdf section of my page (All good examples for me to use)
import AddPDF from "../../../components/AddPDF/AddPDF";
import GlobalButton from "../../../components/GlobalButton/GlobalButton"; // used to represent a button
import FillForm from "../../../components/FillForm/FillForm";

function formatBytes(bytes) {
  const units = ["bytes", "KB", "MB", "GB", "TB"];
  let index = 0;

  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }

  return `${bytes.toFixed(2)} ${units[index]}`;
}

function UploadPDF() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFillFormOpen, setIsFillFormOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfCollectionData, setPdfCollectionData] = useState([]);

  const loadAllPdfs = async () => {
    try {
      const storage = getStorage();
      const pdfsRef = ref(storage, 'pdfs');

      // Get PDF documents from Firestore
      const pdfsCollection = collection(db, 'pdfs');
      const pdfsSnapshot = await getDocs(pdfsCollection);
      
      // Get PDF files from Storage
      const result = await listAll(pdfsRef);

      // Create a map of storage URLs to metadata
      const storageMap = new Map();
      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        storageMap.set(itemRef.name, { url, metadata });
      }

      // Combine Firestore data with Storage data
      const pdfCollectionList = pdfsSnapshot.docs.map(doc => {
        const data = doc.data();
        const storageData = storageMap.get(data.name) || { url: null, metadata: null };
        
        return {
          id: doc.id,
          name: data.name,
          url: storageData.url,
          size: storageData.metadata?.size,
          contentType: storageData.metadata?.contentType,
          updated: storageData.metadata?.updated,
          formFields: data.formFields || [],
          originalPdfUrl: data.originalPdfUrl
        };
      });

      setPdfCollectionData(pdfCollectionList);

    } catch (error) {
      console.error("Error fetching pdf files: ", error);
    }
  };

  useEffect(() => {
    loadAllPdfs();
  }, []);

  const handleFillForm = (pdf) => {
    if (!pdf.formFields || pdf.formFields.length === 0) {
      alert("This PDF has no form fields to fill out.");
      return;
    }
    setSelectedPdf(pdf);
    setIsFillFormOpen(true);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="header">
          <h3>Dynamic PDF Field Retrieval</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className="table-container">
          <div className="table-header exp">
            <div className="exp-spaced">
              <span className="yellow-bar exp"></span>
              <h2 className="table-title">My PDF Documents</h2>
            </div>

            <GlobalButton
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Upload PDF File"}
              onClick={() => setIsAddModalOpen(true)}
            />

          </div>


          <table className="global-table">

            <thead>
              <tr>
                {[
                  "Name",
                  "Size",
                  "Type",
                  "Last Updated Date",
                  "Preview",
                  "Actions"
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pdfCollectionData.length > 0 ? (
                pdfCollectionData.map((pdf_data) => (
                  <tr key={pdf_data.id || pdf_data.name} className="table-row">
                    <td>{pdf_data.name || "N/A"}</td>
                    <td>{formatBytes(pdf_data.size) || "N/A"}</td>
                    <td>{pdf_data.contentType.split('/')[1] || "N/A"}</td>
                    <td>{pdf_data.updated || "N/A"}</td>
                    <td>
                      {pdf_data.url ? (
                        <a href={pdf_data.url} target="_blank" rel="noopener noreferrer">
                          Preview
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => handleFillForm(pdf_data)}
                      >
                        <FaEdit /> Fill Form
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No PDF Documents Available...</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
      {/* -------------- Refreshing Sections -------------- */}
      {isAddModalOpen && (
        <AddPDF
          closeModal={() => {
            setIsAddModalOpen(false);
            loadAllPdfs(); // Refresh after adding
          }}
          refreshUploadPDF={loadAllPdfs}
        />
      )}

      {isFillFormOpen && selectedPdf && (
        <FillForm
          pdfData={selectedPdf}
          onClose={() => {
            setIsFillFormOpen(false);
            setSelectedPdf(null);
          }}
        />
      )}
    </div>
  );
}

export default UploadPDF;
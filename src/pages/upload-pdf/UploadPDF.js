import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import "../assets/styles/UploadPDF.css"; //TODO: Update this to my own css script
import dots from "../../images/dots.svg";
import { FaPen, FaTrash, FaPlus, FaFileExport } from "react-icons/fa";

// Pop-up dialog. useful for upload pdf section of my page (All good examples for me to use)
import AddPDF from "../../components/AddPDF/AddPDF";
import GlobalButton from "../../components/GlobalButton/GlobalButton"; // used to represent a button

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
  const [pdfCollectionData, setPdfCollectionData] = useState([]);

  const loadAllPdfs = async () => {
    try {
      const storage = getStorage();
      const pdfsRef = ref(storage, 'pdfs'); // Reference to the 'pdfs' directory

      // All PDF files from the 'pdfs' directory
      const result = await listAll(pdfsRef);

      // Iterate through all the pdf files
      const pdfCollectionList = await Promise.all(result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef); // Link to download the URL version of the PDF file
        const metadata = await getMetadata(itemRef); 

        return {
          name: itemRef.name,
          url: url,
          size: metadata.size, // File size in bytes
          contentType: metadata.contentType, //Type of the file
          updated: metadata.updated, // Last modified date
        };
      }));

      setPdfCollectionData(pdfCollectionList);

    } catch (error) {
      console.error("Error fetching pdf files: ", error);
    }
  };

  useEffect(() => {
    loadAllPdfs();
  }, []);

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
        />
      )}
    </div>
  );
}

export default UploadPDF;
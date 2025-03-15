import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config";
import Navbar from "../../components/NavBar/NavBar";
import "../assets/styles/global.css";
import "../assets/styles/UploadPDF.css"; //TODO: Update this to my own css script
import dots from "../../images/dots.svg";
import { FaPen, FaTrash, FaPlus, FaFileExport } from "react-icons/fa";

// Pop-up dialog. useful for upload pdf section of my page (All good examples for me to use)
import AddPDF from "../../components/AddPDF/AddPDF";

// import AddExpense from "../../components/AddExpense/AddExpense";
// import EditExpense from "../../components/EditExpense/EditExpense";
// import DeleteExpense from "../../components/DeleteExpense/DeleteExpense";

// import { CSVLink } from "react-csv"; //Used to generate and download CSV files in react
import GlobalButton from "../../components/GlobalButton/GlobalButton"; // used to represent a button

function UploadPDF() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedpdfId, setSelectedPdfId] = useState(null);

  const [pdfCollectionData, setPdfCollectionData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // Function to load all expenses
  const loadAllPdfs = async () => {
    try {
      const pdfCollectionRef = collection(db, "pdf_collection");//gets the list of pdf files from firebase. TODO: make pdf_collection to access
      const querySnapshot = await getDocs(pdfCollectionRef);

      const pdfCollectionList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, //unique ID made by firebase
          ...data,
          amount: parseFloat(data.amount || 0), // Ensure amount is a float or number. if null, makes it 0
          date: data.date ? new Date(data.date).toLocaleDateString() : "N/A", // Format date
        };
      });

      setPdfCollectionData(pdfCollectionList);


    } catch (error) {
      console.error("Error fetching pdf files: ", error);
    }
  };

  useEffect(() => {
    loadAllPdfs();
  }, []); // Run on component mount

  const handleEditClick = (pdfId) => {
    setSelectedPdfId(pdfId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (pdfId) => {
    setSelectedPdfId(pdfId);
    setIsDeleteModalOpen(true);
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
              onClick={() => setIsAddModalOpen(true)} //TODO: create a Modal to upload pdf file to the database
            />

          </div>


          <table className="global-table">

            <thead>
              <tr>
                {[
                  "Name",
                  "Upload Date",

                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pdfCollectionData.length > 0 ?
                (
                  pdfCollectionData.map((pdf_data) => (
                    <tr key={pdf_data.id} className="table-row">
                      <td>{pdf_data.name || "N/A"}</td>
                      <td>{pdf_data.date}</td>

                      {/* <td>
                      <FaPen
                        className="icon edit-icon"
                        onClick={() => handleEditClick(pdf_data.id)}
                      />
                      <FaTrash
                        className="icon delete-icon"
                        onClick={() => handleDeleteClick(pdf_data.id)}
                      />
                    </td> */}
                    </tr>
                  ))
                )
                : // If nothing is available
                (
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
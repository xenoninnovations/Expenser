import React from 'react'
import dots from "../../images/dots.svg";
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import {
  FaPen,
  FaTrash,
  FaPlus,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

export default function ClientCasesTable({client, setIsAddModalOpen, handleEditClick, handleDeleteClick}) {
  return (
    <div className="table-container">
    <div className="table-header exp">
      <div className="exp-spaced">
        <span className="yellow-bar exp"></span>
        <h2 className="table-title">{client.clientName}'s Cases</h2>
      </div>
      <GlobalButton
        bg={"white"}
        textColor={"#222222"}
        icon={FaPlus}
        text={"Add a case"}
        onClick={() => setIsAddModalOpen(true)}
      />
    </div>
    <table className="global-table">
      <thead>
        <tr>
          {[
            "Case number",
            "Case name",
            "Case Attorney",
            "Case Type",
            "Case Description",
            "Case Status",
            "Actions",
          ].map((head) => (
            <th key={head}>{head} ⬍</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {client.cases && client.cases.length > 0 ? (
          client.cases.map((caseItem) => {
            console.log("Rendering case item:", caseItem);
            return (
              <tr key={caseItem.id} className="table-row">
                <td>{caseItem.id}</td>
                <td>{caseItem.name || caseItem.caseName}</td>
                <td>{caseItem.lead_attorney || caseItem.leadAttorney}</td>
                <td>{caseItem.type || caseItem.caseType}</td>
                <td>{caseItem.case_desc || caseItem.caseDesc || "N/A"}</td>
                <td>{caseItem.status || "N/A"}</td>
                <td>
                  <FaPen
                    className="icon edit-icon"
                    onClick={() => handleEditClick(caseItem.id)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDeleteClick(caseItem.id)}
                  />
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="7">No case data available...</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  )
}

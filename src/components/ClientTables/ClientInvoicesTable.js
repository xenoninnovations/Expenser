import React from 'react'
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import {
  FaPen,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

export default function ClientInvoicesTable({invoices, setIsAddModalOpen, handleEditClick, handleDeleteClick}) {
  return (
    <div className="table-container">
    <div className="table-header exp">
      <div className="exp-spaced">
        <span className="yellow-bar exp"></span>
        <h2 className="table-title">Outstanding Fees</h2>
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
            "Invoice ID",
            "Date",
            "Status",
            "Amount",
            "Actions",
          ].map((head) => (
            <th key={head}>{head} ⬍</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => {
            return (
              <tr key={invoice.id} className="table-row">
                <td>{invoice.invoiceId}</td>
                <td>{invoice.date}</td>
                <td>{invoice.status}</td>
                <td>${invoice.total}</td>
                <td>
                  <FaPen
                    className="icon edit-icon"
                    onClick={() => handleEditClick(invoice.id)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDeleteClick(invoice.id)}
                  />
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="5">No invoices...</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  )
}

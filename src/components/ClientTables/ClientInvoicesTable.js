import React from 'react'
import {
  FaPen,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

export default function ClientInvoicesTable({invoices, handleEditClick, handleDeleteClick}) {
  return (
    <div className="table-container">
    <div className="table-header exp">
      <div className="exp-spaced">
        <span className="yellow-bar exp"></span>
        <h2 className="table-title">Invoices</h2>
      </div>
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
                <td>${parseFloat(invoice.total || 0).toFixed(2)}</td>
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

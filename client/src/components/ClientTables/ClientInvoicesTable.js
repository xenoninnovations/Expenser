import React from 'react'
import {
  FaPen,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export default function ClientInvoicesTable({invoices}) {

    const handleViewClick = async (invoiceId) => {
      const storage = getStorage();
      const pathRef = ref(storage, `pdfs/invoices/invoice_${invoiceId}.pdf`)
     const url = await getDownloadURL(pathRef);
     window.open(url, "_blank");
    };

    const handleSendClick = (invoiceId) => {
      return;
    };

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
            "Date Issued",
            "Date Due",
            "Status",
            "Amount Due",
            "Amount Paid",
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
                <td>{invoice.number}</td>
                <td>{new Date(invoice.created * 1000).toLocaleDateString()}</td>
                <td>{new Date(invoice.due_date * 1000).toLocaleDateString()}</td>
                <td className={invoice.status}>{invoice.status}</td>
                <td>${parseFloat(invoice.total/100 || 0).toFixed(2)}</td>
                <td>${parseFloat(invoice.amount_paid/100 || 0).toFixed(2)}</td>
                <td>
                  <FaFilePdf 
                    className='icon edit-icon'
                    onClick={() => handleViewClick(invoice.invoiceId)}
                  />
                  <IoSend
                    className='icon send-icon'
                    onClick={() => handleSendClick(invoice.invoiceId)}
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

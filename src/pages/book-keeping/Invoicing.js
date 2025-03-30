import React, { useEffect, useState } from 'react'
import { db } from "../../config";
import "../assets/styles/global.css";
import "../assets/styles/Invoices.css";
import dots from "../../images/dots.svg";
import { collection, getDocs } from 'firebase/firestore';
import NavBar from '../../components/NavBar/NavBar';
import GlobalButton from '../../components/GlobalButton/GlobalButton';
import { FaPlus } from 'react-icons/fa';
import { FaFilePdf } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import CreateInvoice from '../../components/CreateInvoice/CreateInvoice';

export default function Invoicing() {

  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false)
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(false);

  const loadAllInvoices = async () => {
    try{
      const invoicesRef = collection(db, "invoices");
      const querySnapshot = await getDocs(invoicesRef);
      const invoicesList = querySnapshot.docs.map((doc) =>{
        const data = doc.data();
        console.log(data);
        return{
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount || 0),
          date: data.date ? new Date(data.date).toLocaleDateString(): "N/A"
        }
      });
      
      setInvoiceData(invoicesList);

    } catch(error){
      console.error("Error fetching expenses: ", error);
    }
  }

  useEffect(() => {
    loadAllInvoices();
  }, []);

  const handleViewClick = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsViewInvoiceModalOpen(true);
  };

  const handleSendClick = (invoiceId) => {
    return;
  };

  return (
    <div className="page">
      <NavBar />
      <div className='page-content'>
      <div className="header">
          <h3>Invoices</h3>
          <img src={dots} alt="dots" className="dots" />
        </div>

        <div className='table-container'>
          <div className='table-header exp'>
            <div className='invoices-spaced'>
              <span className='yellow-bar'></span>
              <h2 className='table-title'>Invoices</h2>
            </div>
            <GlobalButton 
              bg={"white"}
              textColor={"#222222"}
              icon={FaPlus}
              text={"Create Invoice"}
              onClick={() => setIsCreateInvoiceModalOpen(true)}
            />
          </div>

          <table className='global-table'>
            <thead>
              <tr>
                {[
                  "Client",
                  "Date",
                  "Amount",
                  "Status",
                  "Action",
                ].map((head) => (
                  <th key={head}>{head} ⬍</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceData.length > 0 ? (
                invoiceData.map((invoice) => (
                  <tr key={invoice.id} className='table-row'>
                    <td>{invoice.client || "N/A"}</td>
                    <td>{invoice.date}</td>
                    <td>${invoice.total.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}</td>
                    <td className={invoice.status.toLowerCase()}>{invoice.status}</td>
                    <td>
                      <FaFilePdf 
                        className='icon edit-icon'
                        onClick={() => handleViewClick(invoice.id)}
                      />
                      <IoSend
                        className='icon send-icon'
                        onClick={() => handleSendClick(invoice.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No invoice data available...</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
      
    {isCreateInvoiceModalOpen && (
      <CreateInvoice 
        closeModal={() => {
          setIsCreateInvoiceModalOpen(false);
          loadAllInvoices();
        }}
      />
    )}
    </div>
  )
}

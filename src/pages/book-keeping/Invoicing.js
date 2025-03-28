import React, { useEffect, useState } from 'react'
import { db } from "../../config";
import "../assets/styles/global.css";
import "../assets/styles/Invoices.css";
import dots from "../../images/dots.svg";
import { collection, getDocs } from 'firebase/firestore';
import NavBar from '../../components/NavBar/NavBar';
import GlobalButton from '../../components/GlobalButton/GlobalButton';
import { FaPlus } from 'react-icons/fa';

export default function Invoicing() {

  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState(false);

  const loadAllInvoices = async () => {
    try{
      const invoicesRef = collection(db, "invoices");
      const querySnapshot = await getDocs(invoicesRef);
      const invoicesList = querySnapshot.docs.map((doc) =>{
        const data = doc.data();
        return{
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount || 0),
          date: data.date ? new Date(data.date).toLocaleDateString(): "N/A"
        }
      });

      console.log(invoicesList)
      setInvoiceData(invoicesList);

    } catch(error){
      console.error("Error fetching expenses: ", error);
    }
  }

  useEffect(() => {
    loadAllInvoices();
  }, []);

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
              {/*=========================================================================================================*/}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  )
}

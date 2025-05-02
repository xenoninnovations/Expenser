import React, { useEffect, useState } from 'react'
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import AddTask from '../AddTask/AddTask';
import InvoiceSelected from '../InvoiceSelected/InvoiceSelected'

export default function ClientOutstandingFeesTable({ tasks, fetchOutstandingTasks }) {

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isInvoiceSelectedModalOpen, setIsInvoiceSelectedModalOpen] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const handleCheckboxChange = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)  ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // Calculate total amount
  const totalAmount = tasks?.reduce((sum, task) => {
    const amount = parseFloat(task.fee);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toFixed(2);

  return (
    <div className="table-container">
      <div className="table-header exp">
        <div className="exp-spaced">
          <span className="yellow-bar exp"></span>
          <h2 className="table-title">Outstanding Fees</h2>
        </div>
        <div className='right-align'>
          <GlobalButton
            bg={"white"}
            textColor={"#222222"}
            text={"Invoice Selected"}
            onClick={() => setIsInvoiceSelectedModalOpen(true)}
          />
          <GlobalButton
            bg={"white"}
            textColor={"#222222"}
            icon={FaPlus}
            text={"Add Fee"}
            onClick={() => setIsAddTaskModalOpen(true)}
          />
        </div>
      </div>
      <table className="global-table">
        <thead>
          <tr>
            {[
              "Task",
              "Date",
              "Period",
              "Fee",
              "Invoice",
              "Actions",
            ].map((head) => (
              <th key={head}>{head} ⬍</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id} className="table-row">
                <td>{task.taskName}</td>
                <td>{task.date}</td>
                <td>{task.duration}</td>
                <td>${parseFloat(task.fee || 0).toFixed(2)}</td>
                <td>
                  <div className='centerMe'>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => handleCheckboxChange(task.id)}
                    />
                    <span className="checkmark" />
                  </div>
                </td>
                <td>
                  <FaPen
                    className="icon edit-icon"
                    //onClick={() => handleEditClick(task.id)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    //onClick={() => handleDeleteClick(task.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No outstanding fees...</td>
            </tr>
          )}

          {/* Total Row */}
          <tr className="table-row">
            <td><strong>Total Due:</strong></td>
            <td colSpan="3"></td>
            <td><strong>${totalAmount}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    
      {isInvoiceSelectedModalOpen && (<InvoiceSelected closeModal={() => { setIsInvoiceSelectedModalOpen(false)}}  selectedTaskIds = {selectedTaskIds} fetchOutstandingTasks={ fetchOutstandingTasks }/>)}
      {isAddTaskModalOpen && (<AddTask closeModal={() => { setIsAddTaskModalOpen(false)}}  fetchOutstandingTasks={ fetchOutstandingTasks }/>)}
    </div>
  );
}

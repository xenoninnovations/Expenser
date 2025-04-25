import React from 'react'
import GlobalButton from "../../components/GlobalButton/GlobalButton";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

export default function ClientOutstandingFeesTable({ tasks, setIsAddModalOpen, handleEditClick, handleDeleteClick }) {
  // Calculate total amount
  const totalAmount = tasks?.reduce((sum, task) => {
    const amount = parseFloat(task.Amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toFixed(2);

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
              "Project Name",
              "Task Name",
              "Date",
              "Period",
              "Amount",
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
                <td>{task.ProjectName}</td>
                <td>{task.TaskName}</td>
                <td>{task.Date}</td>
                <td>{task.Duration}</td>
                <td>${parseFloat(task.Amount || 0).toFixed(2)}</td>
                <td>
                  <FaPen
                    className="icon edit-icon"
                    onClick={() => handleEditClick(task.id)}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDeleteClick(task.id)}
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
            <td><strong>Total:</strong></td>
            <td colSpan="3"></td>
            <td><strong>${totalAmount}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

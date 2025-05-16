import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, getDocs, where, query, runTransaction, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../../config.js";
import { FaTrash } from "react-icons/fa";

export default function AddTask( { closeModal, fetchOutstandingTasks }) {

  const { id } = useParams();
  const [formData, setFormData] = useState([{
    client: id,
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: 0,
    currency: "CAD",
    outstanding: true
  }]);

  const handleChange = (index, e) => {
    const updatedTasks = [...formData];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [e.target.name]: e.target.value,
    };
    setFormData(updatedTasks);
  };

  const addTask = () => {
    setFormData([
      ...formData,
      {
        client: id,
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: 0,
        currency: "CAD",
        outstanding: true,
      },
    ]);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const collectionRef = collection(db, "Tasks");
    formData.forEach(async (task) => {
      try {
        await addDoc(collectionRef, task);
        fetchOutstandingTasks()
        closeModal()
      } catch (e) {
        console.error("Failed to add Task(s): ", e)
      }
    })
  };

  const deleteTask = (index) => {
    const updatedTasks = [
      ...formData.slice(0, index),
      ...formData.slice(index+1)
    ];
    setFormData(updatedTasks);
  }
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Fees</h2>
        <form onSubmit={handleSubmit}>
          <h4>Services:</h4>
          {formData.map((task, index) => (
            <div key={index} className="field-group">
              <h5>{index+1}.</h5>
              <input 
                className="field"
                type="text"
                name="description"
                placeholder="Service"
                value={task.taskName}
                onChange={(e) => handleChange(index, e)}
                required
              />
              <input 
                className="field"
                type="date"
                name="date"
                value={task.date}
                onChange={(e) => handleChange(index, e)}
                required
              />
              <input 
                className="field"
                type="number"
                name="amount"
                placeholder="Fee"
                value={task.amount}
                onChange={(e) => handleChange(index, e)}
                required
              />
              <button type="button" onClick={() => deleteTask(index)} className="modal-button del">
                <FaTrash />
              </button>
            </div>
            ))}
            <button type="button" onClick={addTask} className="modal-button add">+ Add Additional Service</button>
            <button type="submit" className="modal-button save">Save Services</button>
        </form>

        <button className="cancel-button" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  )
}
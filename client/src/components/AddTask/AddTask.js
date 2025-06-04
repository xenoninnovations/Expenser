import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, functions } from "../../config.js";
import { FaTrash } from "react-icons/fa";


export default function AddTask( { closeModal, fetchOutstandingTasks, products, coupons }) {

  const { id } = useParams();
  const [formData, setFormData] = useState([{
    client: id,
    product_id: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    price: 0,
    price_id: "",
    amount: 0,
    status: "outstanding"
  }]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTasks = [...formData];

    if (name === "description") {
      const selectedProduct = products.find(product => product.name === value);
      updatedTasks[index] = {
        ...updatedTasks[index],
        description: value,
        product_id: selectedProduct?.id || "",
      };
    } 
    
    else if (name === "price") {
      const selectedProduct = products.find(product => product.name === formData[index].description);
      const selectedPrice = selectedProduct?.prices?.find(
        (product) => (product.unit_amount / 100).toFixed(2) === value
      );
      updatedTasks[index] = {
        ...updatedTasks[index],
        price: value,
        price_id: selectedPrice?.id || "",
      };
    } else {
      updatedTasks[index] = {
        ...updatedTasks[index],
        [name]: value,
      };
    }

    setFormData(updatedTasks);
  };



  const addTask = () => {
    setFormData([
      ...formData,
      {
        client: id,
        product_id: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        status: "outstanding"
      },
    ]);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const collectionRef = collection(db, "Tasks");
    formData.forEach(async (task) => {
      try {
        await addDoc(collectionRef, task);
        //fetchOutstandingTasks()
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
          {formData.map((task, index) => {
            const selectedProduct = products.find((product) => product.name === task.description);
            return (
              <div key={index} className="field-group">
                <h5>{index + 1}.</h5>

                <select
                  className="field"
                  name="description"
                  value={task.description}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="">Select a service</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <select
                  className="field"
                  name="price"
                  value={task.price}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="">Select price</option>
                  {selectedProduct?.prices?.map((price) => (
                    <option key={price.id} value={(price.unit_amount / 100).toFixed(2)}>
                      {(price.unit_amount / 100).toFixed(2)} {price.currency?.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  type="number"
                  name="amount"
                  placeholder="amount"
                  value={task.amount}
                  onChange={(e) => handleChange(index, e)}
                />

                <button
                  type="button"
                  onClick={() => deleteTask(index)}
                  className="modal-button del"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
            <button type="button" onClick={addTask} className="modal-button add">+ Add Additional Service</button>
            <button type="submit" className="modal-button save">Save Services</button>
        </form>

        <button className="cancel-button" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  )
}
import React from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, title, text, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
};

export default Modal;

import React from "react";
import "./GlobalButton.css";

function GlobalButton({ bg, textColor, icon: Icon, text, onClick, link }) {
  return link ? (
    <a
      href={link}
      className="buttons"
      style={{
        backgroundColor: bg,
        color: textColor,
        textDecoration: "none", // Ensures the link doesn't have underline styling
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Icon && <Icon style={{ color: textColor, marginRight: "8px" }} />}
      <span style={{ color: textColor }}>{text}</span>
    </a>
  ) : (
    <button
      className="buttons"
      style={{
        backgroundColor: bg,
        color: textColor,
      }}
      onClick={onClick}
    >
      {Icon && <Icon style={{ color: textColor, marginRight: "8px" }} />}
      <span style={{ color: textColor }}>{text}</span>
    </button>
  );
}

export default GlobalButton;

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "500px" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div 
        className="anim-fadeup"
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: maxWidth,
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--text-muted)", 
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

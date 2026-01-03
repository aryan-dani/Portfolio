import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type: options.type || "info",
      title: options.title || "Notification",
      icon: options.icon || "info",
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    info: "💡",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={`toast toast--${toast.type}`} role="alert">
      <span className="toast-icon">{icons[toast.type]}</span>
      <div className="toast-content">
        <div className="toast-header">
          <strong className="toast-title">{toast.title}</strong>
          <button className="toast-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="toast-body">{toast.message}</div>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

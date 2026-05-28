import { useState, useEffect } from 'react';

let addToast;

export function useToast() {
  return { showToast: addToast };
}

// Global showToast function yang bisa dipanggil dari mana saja
export function showToast(message, type = 'success', duration = 3000) {
  if (addToast) addToast(message, type, duration);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = (message, type = 'success', duration = 3000) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };
    return () => { addToast = null; };
  }, []);

  const icons = {
    success: 'ti-circle-check',
    error: 'ti-circle-x',
    info: 'ti-info-circle',
    warning: 'ti-alert-triangle',
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`ti ${icons[t.type] || icons.success}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

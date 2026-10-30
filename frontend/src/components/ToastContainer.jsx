import React from 'react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div id="toasts">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === 'err' ? 'err' : ''}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

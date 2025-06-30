import React from 'react';
import { FiX } from 'react-icons/fi';

const DeleteConfirmModal = ({ itemName, itemType, onCancel, onConfirm, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Delete {itemType}</h2>
          <button onClick={onCancel} className="close-button"><FiX /></button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete "{itemName}"? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
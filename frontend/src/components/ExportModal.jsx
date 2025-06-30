import React from 'react';
import { FiX } from 'react-icons/fi';

const ExportModal = ({ onClose, onExport, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Export Design</h2>
          <button onClick={onClose} className="close-button"><FiX /></button>
        </div>
        <div className="modal-body">
          <p>Choose your desired format to export the design.</p>
          <div className="export-options">
            <button onClick={() => onExport('png')} disabled={loading} className="btn btn-primary">PNG</button>
            <button onClick={() => onExport('jpg')} disabled={loading} className="btn btn-primary">JPG</button>
            <button onClick={() => onExport('pdf')} disabled={loading} className="btn btn-primary">PDF</button>
            <button onClick={() => onExport('svg')} disabled={loading} className="btn btn-primary">SVG</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
import { useState, useRef } from 'react';

function FileUpload({ onSummarize, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFile = (selected) => {
    if (!selected) return;
    if (!allowedTypes.includes(selected.type)) {
      alert('Only PDF and Word (.docx) files are supported');
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      alert('File size must be under 20MB');
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleSubmit = () => {
    if (!file || loading) return;
    onSummarize(file);
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return '📄';
    return '📝';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${dragOver ? '#426656' : '#c8d3d9'}`,
          borderRadius: '1rem',
          padding: '1.5rem 1rem',
          backgroundColor: dragOver ? 'rgba(66,102,86,0.04)' : '#ffffff',
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(195,236,215,0.4)', borderRadius: '0.75rem' }}
        >
          <span className="text-xl">📂</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: '#2c3437' }}>
            Drop your file here
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#596064' }}>
            or click to browse — PDF or DOCX, max 20MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {/* Selected file pill */}
      {file && (
        <div
          className="flex items-center justify-between px-4 py-2.5 gap-3"
          style={{ backgroundColor: 'rgba(195,236,215,0.25)', borderRadius: '0.75rem' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">{getFileIcon(file.type)}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#2c3437' }}>
                {file.name}
              </p>
              <p className="text-[10px]" style={{ color: '#596064' }}>
                {formatSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: 'rgba(44,52,55,0.1)', color: '#596064' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Summarize button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full h-10 text-white text-xs font-bold transition-all duration-200"
        style={{
          backgroundColor: file && !loading ? '#426656' : '#c8d3d9',
          borderRadius: '9999px',
          cursor: file && !loading ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Analyzing...' : 'Summarize Document'}
      </button>

    </div>
  );
}

export default FileUpload;
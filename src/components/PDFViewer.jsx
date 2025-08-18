import React, { useEffect, useRef, useState } from 'react';
import { FileText, AlertCircle, Loader, ArrowLeft, Search, Lightbulb, Mic } from 'lucide-react';

const PDFViewer = ({ file, processingMode, onBack, currentPage = 1, onSearchText }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setError(null);

    // Simulate loading time for PDF
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [file]);

  // Navigate to specific page when currentPage changes
  useEffect(() => {
    if (currentPage > 0 && file?.id) {
      // Force iframe reload by changing the key
      setIframeKey(prev => prev + 1);
      setLoading(true);
      
      // Reset loading after a short delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPage, file?.id]);

  // Listen for text selection events from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'textSelection') {
        setSelectedText(event.data.text);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSearchSelectedText = () => {
    if (selectedText.trim() && onSearchText) {
      onSearchText(selectedText);
    }
  };

  // Also listen for text selection in the current window
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim();
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, []);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Select a document to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white relative">
      {/* Header with back button */}
      <div className="absolute top-9 left-4 z-50 bg-white px-3 py-2 rounded-lg shadow-sm border flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Back to Library"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <p className="text-sm font-medium text-gray-700">{file.name}</p>
        {currentPage > 1 && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Page {currentPage}
          </span>
        )}
      </div>

      {/* Search button for selected text */}
      {selectedText.trim() && (
        <div className="absolute top-9 right-4 z-50 px-3 py-2 rounded-lg shadow-sm">
          {/* <div className="flex flex-col gap-2"> */}
          <button
  onClick={handleSearchSelectedText}
  className="flex items-center gap-2 px-4 py-2 
             bg-purple-600/80
             text-white text-sm font-medium rounded-full shadow-lg
             hover:scale-105 hover:shadow-xl hover:brightness-110 
             transition-all duration-300 ease-out"
  title="Search for selected text"
>
  <Search size={16} className="animate-pulse" />
  <span className="truncate max-w-[160px]">
    Search "{selectedText.substring(0, 20)}..."
  </span>
</button>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-40">
          <div className="text-center p-8">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-gray-700 mb-4">PDF Viewer Error</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-30">
          <div className="text-center">
            <Loader size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}
      
      {/* Native PDF Viewer with vertical scrolling */}
      <div className="h-full w-full pdf-viewer-container">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={`/pdfjs/viewer.html?file=/api/pdf/${file.id}#page=${currentPage}`}
          className="w-full h-full border-0"
          title={file.name}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load PDF');
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;

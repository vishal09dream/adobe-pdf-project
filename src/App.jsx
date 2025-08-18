import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FileText } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PDFViewer from './components/PDFViewer';
import Library from './components/Library';
import ProcessingPanel from './components/ProcessingPanel';
import UploadModal from './components/UploadModal';
import './App.css';
import ClickSpark from './ClickSpark';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentView, setCurrentView] = useState('library');
  const [processingMode, setProcessingMode] = useState('1a');
  const [showUpload, setShowUpload] = useState(false);
  const [library, setLibrary] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const response = await fetch('/api/library');
      if (response.ok) {
        const data = await response.json();
        setLibrary(data.files || []);
      } else {
        console.error('Failed to load library:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading library:', error);
      setLibrary([]);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
  };

  const navigateToPage = (pageNumber, targetFileId = null) => {
    if (selectedFiles.length > 0) {
      setCurrentPage(pageNumber);

      if (targetFileId) {
        const targetFile = selectedFiles.find(f => f.id === targetFileId);
        if (targetFile) {
          setSelectedFiles(prev => [
            targetFile,
            ...prev.filter(f => f.id !== targetFileId)
          ]);
        }
      }

      setCurrentView('viewer');
    }
  };

  return (

      
    <ClickSpark 
      sparkColor="#3b82f6"   // blue sparks
      sparkSize={12} 
      sparkRadius={20} 
      sparkCount={10} 
      duration={500}
    >
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentView={currentView}
          setCurrentView={handleViewChange}
          setShowUpload={setShowUpload}
        />
        
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {currentView === 'library' && (
              <Library 
                library={library}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                onRefresh={loadLibrary}
                onViewFile={handleViewChange}
              />
            )}
            
            {currentView === 'viewer' && selectedFiles.length > 0 && (
              <PDFViewer 
                file={selectedFiles[0]}
                processingMode={processingMode}
                onBack={handleBackToLibrary}
                currentPage={currentPage}
                onSearchText={(text) => setSearchQuery(text)}
              />
            )}

            {currentView === 'viewer' && selectedFiles.length === 0 && (
              <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No document selected</p>
                  <button
                    onClick={() => setCurrentView('library')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Library
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ProcessingPanel 
            selectedFiles={selectedFiles}
            processingMode={processingMode}
            setProcessingMode={setProcessingMode}
            onNavigateToPage={navigateToPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        {showUpload && (
          <UploadModal 
            onClose={() => setShowUpload(false)}
            onUploadComplete={loadLibrary}
          />
        )}
        
        <Toaster position="top-right" />
      </div>
    </ClickSpark>
  );
}

export default App;

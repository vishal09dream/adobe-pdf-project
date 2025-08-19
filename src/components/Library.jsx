import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  CheckSquare,
  Trash2,
} from "lucide-react";

const Library = ({
  library,
  selectedFiles,
  setSelectedFiles,
  onRefresh,
  onViewFile,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  // Toggle Select All / Deselect All
  const handleSelectAll = () => {
    if (selectedFiles.length === library.length) {
      setSelectedFiles([]); // Deselect all if already selected
    } else {
      setSelectedFiles(library); // Select all
    }
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles((prev) =>
      prev.find((f) => f.id === file.id)
        ? prev.filter((f) => f.id !== file.id)
        : [...prev, file]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedFiles.length} document(s)?`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const deletePromises = selectedFiles.map((file) =>
        fetch(`/api/delete/${file.id}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);
      setSelectedFiles([]);
      await onRefresh();
      alert(`Successfully deleted ${selectedFiles.length} document(s)`);
    } catch (error) {
      console.error("Error deleting files:", error);
      alert("Failed to delete some documents");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewFile = (e, file) => {
    e.stopPropagation();
    if (!selectedFiles.find((f) => f.id === file.id)) {
      setSelectedFiles((prev) => [...prev, file]);
    }
    setSelectedFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
    if (onViewFile) {
      onViewFile("viewer");
    }
  };

  const isSelected = (file) => selectedFiles.find((f) => f.id === file.id);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
          Document Library
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Delete */}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedFiles.length === 0 || deleting}
            className="p-2 bg-red-100/60 text-red-600 rounded-lg hover:bg-red-200/80 transition-colors disabled:opacity-50 shadow-sm"
            title={
              selectedFiles.length === 0
                ? "Select files to delete"
                : "Delete selected PDFs"
            }
          >
            <Trash2 size={16} className={deleting ? "animate-spin" : ""} />
          </button>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            disabled={library.length === 0}
            className="px-4 py-2 bg-gray-100/60 text-gray-700 rounded-lg hover:bg-gray-200/80 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            title={
              library.length === 0
                ? "No files to select"
                : selectedFiles.length === library.length
                ? "Deselect All PDFs"
                : "Select All PDFs"
            }
          >
            <CheckSquare size={16} />
            {selectedFiles.length === library.length
              ? "Deselect All"
              : "Select All"}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-100/60 text-gray-700 rounded-lg hover:bg-gray-200/80 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            title="Refresh library"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* No docs */}
      {library.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-500">Upload some PDFs to get started</p>
        </div>
      ) : (
        /* Grid of Docs */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((file) => (
            <div
              key={file.id}
              onClick={() => toggleFileSelection(file)}
              className={`relative p-5 rounded-2xl border 
                bg-white/10 backdrop-blur-md 
                transition-all duration-300 
                hover:-translate-y-2 hover:shadow-xl cursor-pointer 
                ${
                  isSelected(file)
                    ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    : "border-gray-200/40 hover:border-blue-300/50"
                }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <FileText
                  size={26}
                  className="text-blue-600 drop-shadow-md"
                />
                <div className="flex items-center gap-2">
                  {isSelected(file) && (
                    <CheckCircle size={20} className="text-blue-600" />
                  )}
                  <button
                    onClick={(e) => handleViewFile(e, file)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-transform hover:scale-110"
                    title="View PDF"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              {/* File Name */}
              <h3
                className="font-semibold text-gray-800 mb-2 truncate text-lg"
                title={file.name}
              >
                {file.name}
              </h3>

              {/* Upload Date */}
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                {new Date(file.upload_time).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Selection Status */}
      {selectedFiles.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-4 border z-10">
          <p className="text-sm text-gray-700 mb-2">
            {selectedFiles.length} document
            {selectedFiles.length > 1 ? "s" : ""} selected
          </p>
          <button
            onClick={() => setSelectedFiles([])}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;


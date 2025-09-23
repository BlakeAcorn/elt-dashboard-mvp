import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle, 
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DataUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getFiles();
      setFiles(response.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load uploaded files');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadFiles();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadFile(file);
      toast.success(`File uploaded successfully! Processed ${response.processedRows} rows.`);
      await loadFiles(); // Reload files list
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    disabled: uploading,
  });

  const downloadTemplate = async (format) => {
    try {
      await uploadService.downloadTemplate(format);
      toast.success(`Template downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await uploadService.deleteFile(fileId);
      toast.success('File deleted successfully');
      await loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Data Upload
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload your quarterly data files in CSV or Excel format
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Data File</h3>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-lg font-medium text-gray-900">Uploading and processing file...</p>
              <p className="text-sm text-gray-500">Please wait while we validate and store your data</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop the file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
              <p className="text-xs text-gray-400">
                Supports CSV, XLS, and XLSX files up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Template Downloads */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Download Template</h4>
          <div className="flex space-x-3">
            <button
              onClick={() => downloadTemplate('csv')}
              className="btn-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV Template
            </button>
            <button
              onClick={() => downloadTemplate('xlsx')}
              className="btn-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel Template
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Use these templates to ensure your data is formatted correctly
          </p>
        </div>
      </div>

      {/* File Requirements */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Requirements</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Required Columns</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• quarter (Q1, Q2, Q3, Q4)</li>
              <li>• year (2020-2030)</li>
              <li>• metric_name (e.g., "ARR", "Churn Rate")</li>
              <li>• metric_value (numeric value)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Optional Columns</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• metric_unit (e.g., "USD", "%")</li>
              <li>• category (e.g., "Financial", "Customer")</li>
              <li>• description (additional context)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <button
            onClick={loadFiles}
            className="btn-secondary"
            disabled={loading}
          >
            <Database className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your first data file to get started
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {file.original_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.file_type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.upload_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;

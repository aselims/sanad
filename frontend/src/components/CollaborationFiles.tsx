import React, { useState, useEffect } from 'react';
import { CollaborationFile } from '../types';
import { getCollaborationFiles, uploadFile, deleteFile, getFileDownloadUrl } from '../services/api';
import { FileUp, Trash2, Download, FileText, Image, File, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface CollaborationFilesProps {
  collaborationId: string;
  isOwnerOrParticipant: boolean;
}

const CollaborationFiles: React.FC<CollaborationFilesProps> = ({ 
  collaborationId,
  isOwnerOrParticipant 
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<CollaborationFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const loadFiles = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getCollaborationFiles(collaborationId);
      setFiles(response.data);
    } catch (error: any) {
      console.error('Error loading files:', error);
      setLoadError(error.response?.data?.error || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadFiles();
  }, [collaborationId]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (files.length >= 5) {
      setUploadError('Maximum of 5 files allowed per collaboration');
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Only PDFs and images are allowed');
      return;
    }
    
    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      await uploadFile(collaborationId, selectedFile);
      await loadFiles();
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Upload failed';
      setUploadError(errorMessage);

      // Add more details for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        await loadFiles();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Display upload permissions for debugging
  const permissionsDebug = (
    <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
      <p>Debug info:</p>
      <p>User ID: {user?.id || 'Not logged in'}</p>
      <p>Owner/Participant: {isOwnerOrParticipant ? 'Yes' : 'No'}</p>
      <p>Collaboration ID: {collaborationId}</p>
    </div>
  );
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileUp className="w-5 h-5" />
        Files
      </h3>
      
      {/* File upload section (only for owner/participant) */}
      {isOwnerOrParticipant && (
        <div className="mb-4">
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              id="file-upload"
              className="block w-full text-xs text-slate-500
                file:mr-2 file:py-1.5 file:px-3
                file:rounded-md file:border-0
                file:text-xs file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            />
            <button
              className={`px-3 py-1.5 rounded-md text-xs font-medium w-full ${
                selectedFile && !isUploading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {uploadError && (
            <div className="flex items-center text-red-600 text-xs mt-2">
              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            5MB limit • PDF/images only
          </p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-pulse flex justify-center mb-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-sm">Loading files...</p>
        </div>
      )}
      
      {/* Error state */}
      {loadError && !isLoading && (
        <div className="text-center py-4 text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Error loading files</p>
        </div>
      )}
      
      {/* Files list */}
      {!isLoading && !loadError && (
        files.length > 0 ? (
          <div className="border rounded-md overflow-hidden text-sm">
            <div className="divide-y">
              {files.map(file => (
                <div key={file.id} className="p-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2 text-gray-500">
                      {getFileIcon(file.mimeType)}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-medium truncate">{file.name}</h4>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                    </span>
                    
                    <div className="flex gap-1 text-xs">
                      <a
                        href={getFileDownloadUrl(file.id)}
                        download={file.name}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </a>
                      
                      {isOwnerOrParticipant && (
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-500 hover:text-red-700 ml-2 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
            <p className="text-sm text-gray-500">No files uploaded yet</p>
            {isOwnerOrParticipant && (
              <p className="text-xs text-gray-400 mt-1">
                Upload files to share with collaborators
              </p>
            )}
          </div>
        )
      )}
      
      {/* Debug info in development */}
      {permissionsDebug}
    </div>
  );
};

export default CollaborationFiles; 
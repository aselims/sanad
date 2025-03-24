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
      console.log(`Uploading file to collaboration ${collaborationId} as user ${user?.id}`);
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
    <div className="bg-white rounded-lg shadow-sm p-5 mt-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileUp className="w-5 h-5" />
        Collaboration Files
      </h3>
      
      {/* File upload section (only for owner/participant) */}
      {isOwnerOrParticipant && (
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="file"
              id="file-upload"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            />
            <button
              className={`ml-4 px-4 py-2 rounded-md text-sm font-medium ${
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
            <div className="flex items-center text-red-600 text-sm mt-2">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            Max 5 files • PDF or images only • 5MB limit per file
          </p>

          {/* Uncomment for debugging */}
          {/* {permissionsDebug} */}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse flex justify-center mb-3">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
          <p>Loading files...</p>
        </div>
      )}
      
      {/* Error state */}
      {loadError && !isLoading && (
        <div className="text-center py-8 text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <p>Error loading files</p>
          <p className="text-sm mt-1">{loadError}</p>
        </div>
      )}
      
      {/* Files list */}
      {!isLoading && !loadError && (
        files.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <div className="divide-y">
              {files.map(file => (
                <div key={file.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                  <div className="flex-shrink-0 mr-3 text-gray-500">
                    {getFileIcon(file.mimeType)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <h4 className="text-sm font-medium truncate">{file.name}</h4>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">
                          Uploaded by {typeof file.uploadedBy === 'string' ? file.uploadedBy : 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400 mx-2">•</span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      
                      <div className="mt-2 sm:mt-0 flex gap-2">
                        <a
                          href={getFileDownloadUrl(file.id)}
                          download={file.name}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                        
                        {isOwnerOrParticipant && (
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No files uploaded yet</p>
            {isOwnerOrParticipant && (
              <p className="text-sm mt-1">Upload files using the form above</p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default CollaborationFiles; 
import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middlewares/auth';
import * as fileService from '../services/fileService';
import { routeHandler } from '../utils/express-types';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Get all files for a collaboration
router.get('/collaborations/:collaborationId/files', authenticateJWT, routeHandler(async (req: Request, res: Response) => {
  try {
    const { collaborationId } = req.params;
    const files = await fileService.getCollaborationFiles(collaborationId);
    
    // Map files to return proper format
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      path: file.path,
      mimeType: file.mimeType,
      size: file.size,
      uploadedBy: file.uploadedBy ? 
        `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}` : 
        'Unknown User',
      uploadedById: file.uploadedById,
      uploadedAt: file.uploadedAt
    }));
    
    return res.json(formattedFiles);
  } catch (error: any) {
    console.error('Error getting files:', error);
    return res.status(500).json({ error: error.message || 'Failed to get files' });
  }
}));

// Upload a file to a collaboration
router.post(
  '/collaborations/:collaborationId/files', 
  authenticateJWT, 
  upload.single('file'), 
  routeHandler(async (req: Request, res: Response) => {
    try {
      const { collaborationId } = req.params;
      const userId = req.user?.id;
      
      console.log(`[FileRoutes] Upload request received for collaboration: ${collaborationId}`);
      
      if (!userId) {
        console.log(`[FileRoutes] Authentication error: No user ID in token`);
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.file) {
        console.log(`[FileRoutes] No file in request`);
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`[FileRoutes] File upload received: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`[FileRoutes] User ID: ${userId}`);
      
      const savedFile = await fileService.saveFile(req.file, collaborationId, userId);
      
      console.log(`[FileRoutes] File saved successfully with ID: ${savedFile.id}`);
      
      return res.status(201).json({
        id: savedFile.id,
        name: savedFile.name,
        path: savedFile.path,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
        uploadedBy: userId,
        uploadedAt: savedFile.uploadedAt
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      // Handle different error types with appropriate status codes
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({ error: error.message });
      } else if (error.message.includes('not found') || error.message.includes('Not found')) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes('File type not allowed') || error.message.includes('File size exceeds')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  })
);

// Download a file
router.get('/files/:fileId', authenticateJWT, routeHandler(async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    
    // Get file details
    const files = await fileService.getCollaborationFiles('', fileId);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // If user is logged in, check if they have permission to download
    if (userId) {
      const canDownload = await fileService.canDownloadFile(fileId, userId);
      if (!canDownload) {
        return res.status(403).json({ error: 'Not authorized to download this file' });
      }
    }
    
    const file = files[0];
    
    // Stream the file
    const fileStream = fileService.getFileStream(file.path);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    
    fileStream.pipe(res);
    return;
  } catch (error: any) {
    console.error('Error downloading file:', error);
    return res.status(500).json({ error: error.message || 'Failed to download file' });
  }
}));

// Delete a file
router.delete('/files/:fileId', authenticateJWT, routeHandler(async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await fileService.deleteFile(fileId, userId);
    
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return res.status(error.message.includes('Not authorized') ? 403 : 
              error.message.includes('not found') ? 404 : 500)
      .json({ error: error.message || 'Failed to delete file' });
  }
}));

export default router; 
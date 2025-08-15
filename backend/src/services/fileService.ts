import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as multerTypes from 'multer';
import { AppDataSource } from '../config/data-source';
import { CollaborationFile } from '../entities/CollaborationFile';
import { Collaboration } from '../entities/Collaboration';
import { User } from '../entities/User';
import { Equal } from 'typeorm';

// Define a type for file
type FileInfo = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

// Define allowed file types and max file size
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_COLLABORATION = 5;
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const validateFile = (file: FileInfo) => {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('File type not allowed. Only PDFs and images are accepted.');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
  }

  return true;
};

export const saveFile = async (
  file: FileInfo,
  collaborationId: string,
  userId: string
): Promise<CollaborationFile> => {
  try {
    console.log(
      `[FileService] saveFile called with collaborationId: ${collaborationId}, userId: ${userId}`
    );
    console.log(
      `[FileService] File details - name: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`
    );

    // Validate the file regardless of collaboration check
    validateFile(file);

    // Get collaboration repository
    const collaborationRepo = AppDataSource.getRepository(Collaboration);

    // Check if collaboration exists
    const collaboration = await collaborationRepo.findOne({
      where: { id: collaborationId },
    });

    console.log(
      `[FileService] Collaboration lookup result: ${collaboration ? 'Found' : 'Not found'}`
    );

    // For development purposes, create a temp collaboration if it doesn't exist
    // TEMP FIX: This is for development only, remove in production
    if (!collaboration) {
      console.log(
        `[FileService] Collaboration with ID ${collaborationId} not found. Creating temporary record.`
      );

      try {
        const newCollaboration = new Collaboration();
        newCollaboration.id = collaborationId;
        newCollaboration.title = 'Temporary Collaboration';
        newCollaboration.description = 'Automatically created for file upload';
        newCollaboration.type = 'challenge' as any; // TypeScript cast for enum value
        newCollaboration.status = 'draft' as any; // TypeScript cast for enum value
        newCollaboration.ownerId = userId;
        newCollaboration.visibility = 'public';

        await collaborationRepo.save(newCollaboration);
        console.log(`[FileService] Created temporary collaboration with ID: ${collaborationId}`);
      } catch (error) {
        console.error('[FileService] Error creating temporary collaboration:', error);
        throw new Error('Failed to create temporary collaboration');
      }
    }

    // Load full collaboration with relations for permission check
    const fullCollaboration = await collaborationRepo.findOne({
      where: { id: collaborationId },
      relations: ['files'],
    });

    if (!fullCollaboration) {
      throw new Error('Failed to load collaboration details');
    }

    // Check if user is authorized to upload (owner or team member)
    const isOwner = fullCollaboration.ownerId === userId;
    const isTeamMember = fullCollaboration.teamMembers?.includes(userId) ?? false;

    console.log(
      `[FileService] Authorization check - isOwner: ${isOwner}, isTeamMember: ${isTeamMember}`
    );
    console.log(`[FileService] Owner ID: ${fullCollaboration.ownerId}, User ID: ${userId}`);
    console.log(
      `[FileService] Team members: ${fullCollaboration.teamMembers?.join(', ') || 'none'}`
    );

    // Comment this for production use:
    const allowAnyUserForDevelopment = false; // Set to false to enforce permission checks

    if (!isOwner && !isTeamMember && !allowAnyUserForDevelopment) {
      console.log(
        `[FileService] User ${userId} not authorized to upload to collaboration ${collaborationId}`
      );
      throw new Error('Not authorized to upload files to this collaboration');
    }

    // Check if collaboration already has max files
    if (fullCollaboration.files && fullCollaboration.files.length >= MAX_FILES_PER_COLLABORATION) {
      throw new Error(`Maximum of ${MAX_FILES_PER_COLLABORATION} files allowed per collaboration`);
    }

    // Create a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    console.log(`[FileService] Saving file to disk at: ${filePath}`);

    // Write the file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Create file record in database
    const fileRepo = AppDataSource.getRepository(CollaborationFile);
    const newFile = new CollaborationFile();
    newFile.name = file.originalname;
    newFile.path = fileName;
    newFile.mimeType = file.mimetype;
    newFile.size = file.size;
    newFile.uploadedById = userId;
    newFile.collaborationId = collaborationId;

    console.log(`[FileService] Saving file record to database`);
    const savedFile = await fileRepo.save(newFile);
    console.log(`[FileService] File saved successfully with ID: ${savedFile.id}`);

    return savedFile;
  } catch (error) {
    console.error('[FileService] Error in saveFile:', error);
    throw error;
  }
};

export const getCollaborationFiles = async (
  collaborationId: string,
  fileId?: string
): Promise<CollaborationFile[]> => {
  try {
    const fileRepo = AppDataSource.getRepository(CollaborationFile);

    if (fileId) {
      const file = await fileRepo.find({
        where: { id: fileId },
        relations: ['uploadedBy'],
      });
      return file;
    }

    const files = await fileRepo.find({
      where: { collaborationId },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
    return files;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (fileId: string, userId: string): Promise<boolean> => {
  try {
    const fileRepo = AppDataSource.getRepository(CollaborationFile);
    const file = await fileRepo.findOne({
      where: { id: fileId },
      relations: ['collaboration', 'collaboration.owner'],
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Check if user is authorized to delete (owner, uploader, or team member)
    if (
      file.uploadedById !== userId &&
      file.collaboration.ownerId !== userId &&
      !file.collaboration.teamMembers?.includes(userId)
    ) {
      throw new Error('Not authorized to delete this file');
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await fileRepo.remove(file);
    return true;
  } catch (error) {
    throw error;
  }
};

export const canDownloadFile = async (fileId: string, userId: string): Promise<boolean> => {
  try {
    const fileRepo = AppDataSource.getRepository(CollaborationFile);
    const file = await fileRepo.findOne({
      where: { id: fileId },
      relations: ['collaboration'],
    });

    if (!file) {
      return false;
    }

    // If collaboration is public, anyone can download
    if (file.collaboration.visibility === 'public') {
      return true;
    }

    // If private, only owner, team members can download
    if (file.collaboration.visibility === 'private') {
      return (
        file.collaboration.ownerId === userId ||
        (file.collaboration.teamMembers?.includes(userId) ?? false)
      );
    }

    // For limited visibility, check if user is part of the allowed viewers
    // This would be implemented based on your access control system

    return false;
  } catch (error) {
    return false;
  }
};

export const getFileStream = (filePath: string): fs.ReadStream => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  return fs.createReadStream(fullPath);
};

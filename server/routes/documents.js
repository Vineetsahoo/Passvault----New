import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import SecureDocument from '../models/SecureDocument.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userUploadDir = path.join('uploads', 'secure-documents', req.user.userId);
    try {
      await fs.mkdir(userUploadDir, { recursive: true });
      cb(null, userUploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow most file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt|zip|mp4|mp3|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'));
  }
});

// Encryption helper functions
const algorithm = 'aes-256-cbc';

function encryptFile(buffer, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

function decryptFile(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]);
  return decrypted;
}

// @route   POST /api/documents/upload
// @desc    Upload and encrypt a document
// @access  Private
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { category, tags, description, expiresIn } = req.body;

    // Generate encryption key
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    // Read the uploaded file
    const fileBuffer = await fs.readFile(req.file.path);

    // Encrypt the file
    const { iv, encryptedData } = encryptFile(fileBuffer, encryptionKey);

    // Save encrypted file
    const encryptedFilePath = req.file.path + '.enc';
    await fs.writeFile(encryptedFilePath, encryptedData, 'hex');

    // Delete original file
    await fs.unlink(req.file.path);

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Calculate expiry date
    let expiresAt = null;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Create document record
    const document = new SecureDocument({
      userId: new mongoose.Types.ObjectId(req.user.userId), // Convert to ObjectId
      fileName: req.file.filename + '.enc',
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).slice(1),
      mimeType: req.file.mimetype,
      filePath: encryptedFilePath,
      encryptionKey: encryptionKey,
      encryptionType: 'AES-256',
      category: category || 'document',
      tags: tags ? JSON.parse(tags) : [],
      description: description || '',
      expiresAt,
      metadata: {
        checksum,
        iv
      }
    });

    await document.save();

    // Update user storage stats
    logger.info(`Document uploaded successfully by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and encrypted successfully',
      document: {
        id: document._id,
        fileName: document.originalName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        category: document.category,
        tags: document.tags,
        uploadedAt: document.createdAt,
        expiresAt: document.expiresAt
      }
    });

  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading document',
      error: error.message 
    });
  }
});

// @route   GET /api/documents
// @desc    Get all documents for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search, sortBy = '-createdAt', page = 1, limit = 20 } = req.query;

    // Convert userId to ObjectId for proper comparison
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    
    const query = { 
      userId: userObjectId, // Using ObjectId for comparison
      isArchived: false
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { originalName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const documents = await SecureDocument.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-encryptionKey -filePath -metadata.iv')
      .lean();

    const count = await SecureDocument.countDocuments(query);

    // Calculate storage stats
    const stats = await SecureDocument.aggregate([
      { $match: { userId: userObjectId, isArchived: false } }, // Using ObjectId
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$fileSize' },
          totalCount: { $sum: 1 },
          categories: { $push: '$category' }
        }
      }
    ]);

    res.json({
      success: true,
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count
      },
      stats: stats[0] || { totalSize: 0, totalCount: 0, categories: [] }
    });

  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching documents',
      error: error.message 
    });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download and decrypt a document
// @access  Private
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await SecureDocument.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.userId) // Convert to ObjectId
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check if expired
    if (document.isExpired()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Document has expired' 
      });
    }

    // Read encrypted file
    const encryptedData = await fs.readFile(document.filePath, 'utf-8');

    // Decrypt file
    const decryptedBuffer = decryptFile(
      encryptedData,
      document.encryptionKey,
      document.metadata.iv
    );

    // Update download count and last accessed
    document.downloadCount += 1;
    document.lastAccessedAt = new Date();
    await document.save();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', decryptedBuffer.length);

    res.send(decryptedBuffer);

  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading document',
      error: error.message 
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await SecureDocument.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.userId) // Convert to ObjectId
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Delete physical file
    try {
      await fs.unlink(document.filePath);
    } catch (err) {
      logger.warn('File already deleted:', err);
    }

    // Delete document record
    await document.deleteOne();

    logger.info(`Document deleted: ${document._id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting document',
      error: error.message 
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document metadata
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { category, tags, description, isFavorite } = req.body;

    const document = await SecureDocument.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.userId) // Convert to ObjectId
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    if (category) document.category = category;
    if (tags) document.tags = tags;
    if (description !== undefined) document.description = description;
    if (isFavorite !== undefined) document.isFavorite = isFavorite;

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      document
    });

  } catch (error) {
    logger.error('Error updating document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating document',
      error: error.message 
    });
  }
});

// @route   GET /api/documents/stats
// @desc    Get storage statistics
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await SecureDocument.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } }, // Convert to ObjectId
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalSize: { $sum: '$fileSize' },
                totalDocuments: { $sum: 1 },
                totalDownloads: { $sum: '$downloadCount' }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                size: { $sum: '$fileSize' }
              }
            }
          ],
          recentUploads: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                originalName: 1,
                fileSize: 1,
                category: 1,
                createdAt: 1
              }
            }
          ],
          expiringDocuments: [
            { $match: { expiresAt: { $ne: null, $gt: new Date() } } },
            { $sort: { expiresAt: 1 } },
            { $limit: 5 },
            {
              $project: {
                originalName: 1,
                expiresAt: 1
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    logger.error('Error fetching storage stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

export default router;

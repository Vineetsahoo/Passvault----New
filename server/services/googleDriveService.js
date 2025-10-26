import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import logger from '../utils/logger.js';

class GoogleDriveService {
  constructor() {
    this.oauth2Client = null;
    this.drive = null;
  }

  /**
   * Initialize OAuth2 client
   */
  initializeOAuth2Client(credentials) {
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
    
    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    return this.oauth2Client;
  }

  /**
   * Set credentials
   */
  setCredentials(tokens) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }
    this.oauth2Client.setCredentials(tokens);
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate auth URL
   */
  generateAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Get token from code
   */
  async getTokenFromCode(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(fileBuffer, fileName, mimeType = 'application/octet-stream', folderId = null) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const media = {
        mimeType,
        body: Readable.from(fileBuffer)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime, webViewLink'
      });

      logger.info(`File uploaded to Google Drive: ${response.data.id}`);
      return response.data;

    } catch (error) {
      logger.error('Google Drive upload error:', error);
      throw error;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data);

    } catch (error) {
      logger.error('Google Drive download error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      await this.drive.files.delete({ fileId });
      logger.info(`File deleted from Google Drive: ${fileId}`);
      return true;

    } catch (error) {
      logger.error('Google Drive delete error:', error);
      throw error;
    }
  }

  /**
   * List files in Google Drive
   */
  async listFiles(query = '', pageSize = 10) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const response = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'files(id, name, size, createdTime, modifiedTime, mimeType)',
        orderBy: 'modifiedTime desc'
      });

      return response.data.files;

    } catch (error) {
      logger.error('Google Drive list files error:', error);
      throw error;
    }
  }

  /**
   * Create or get PassVault folder
   */
  async getOrCreatePassVaultFolder() {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      // Check if folder exists
      const response = await this.drive.files.list({
        q: "name='PassVault_Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder
      const folderMetadata = {
        name: 'PassVault_Backups',
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      logger.info(`PassVault folder created in Google Drive: ${folder.data.id}`);
      return folder.data.id;

    } catch (error) {
      logger.error('Error creating PassVault folder:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, size, createdTime, modifiedTime, mimeType, webViewLink'
      });

      return response.data;

    } catch (error) {
      logger.error('Error getting file metadata:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService();

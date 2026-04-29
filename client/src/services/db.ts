import Dexie, { Table } from 'dexie';

export interface LocalPassword {
  id: string; // matches backend _id
  title: string;
  username?: string;
  website?: string;
  encryptedPassword?: string;
  category: string;
  strength?: string;
  lastModified: number;
  syncStatus: 'synced' | 'pending_push' | 'pending_pull';
}

export interface LocalDocument {
  id: string;
  title: string;
  mimeType?: string;
  encryptedData?: string;
  lastModified: number;
  syncStatus: 'synced' | 'pending_push';
}

export interface LocalSettings {
  id: string;
  key: string;
  value: any;
  lastModified: number;
  syncStatus: 'synced' | 'pending_push';
}

export class PassvaultOfflineDB extends Dexie {
  passwords!: Table<LocalPassword, string>;
  documents!: Table<LocalDocument, string>;
  settings!: Table<LocalSettings, string>;

  constructor() {
    super('PassvaultOfflineDB');
    this.version(1).stores({
      passwords: 'id, title, category, syncStatus, lastModified',
      documents: 'id, title, syncStatus, lastModified',
      settings: 'id, key, syncStatus'
    });
  }
}

export const db = new PassvaultOfflineDB();

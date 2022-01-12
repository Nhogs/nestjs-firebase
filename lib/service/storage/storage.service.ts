import { Inject, Injectable } from "@nestjs/common";
import { FirebaseApp } from "firebase/app";
import {
  connectStorageEmulator,
  deleteObject,
  getBytes,
  getDownloadURL,
  getMetadata,
  getStorage,
  getStream,
  list,
  listAll,
  ListOptions,
  ref,
  SettableMetadata,
  StorageReference,
  StringFormat,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  UploadMetadata,
  UploadResult,
  uploadString,
} from "firebase/storage";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../../firebase.constants";
import { FirebaseConfig } from "../../interface";

@Injectable()
export class StorageService {
  private readonly _storage;

  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
    @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: FirebaseConfig
  ) {
    this._storage = getStorage(this.firebaseApp);
    if (this.firebaseConfig.emulator?.storage) {
      connectStorageEmulator(
        this._storage,
        this.firebaseConfig.emulator.storage.host || "localhost",
        this.firebaseConfig.emulator.storage.port || 9199
      );
    }
  }

  // Create a Reference (https://firebase.google.com/docs/storage/web/create-reference)

  /**
   * Create a Reference
   * @param url
   */
  ref(url?: string): StorageReference {
    return ref(this._storage, url);
  }

  // Upload Files (https://firebase.google.com/docs/storage/web/upload-files)

  /**
   * Upload from a Blob, File or Byte Array
   *
   * @param path
   * @param data
   * @param metadata
   */
  async uploadBytes(
    path: string,
    data: Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    return uploadBytes(this.ref(path), data, metadata);
  }

  /**
   * Upload from a String
   *
   * @param path
   * @param value
   * @param format (raw, base64, base64url, or data_url)
   * @param metadata
   */
  async uploadString(
    path: string,
    value: string,
    format?: StringFormat,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    return uploadString(this.ref(path), value, format, metadata);
  }

  /**
   * Manage Uploads
   *
   * @param path
   * @param data
   * @param metadata
   */
  uploadBytesResumable(
    path: string,
    data: Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata
  ) {
    return uploadBytesResumable(this.ref(path), data, metadata);
  }

  // Download Files (https://firebase.google.com/docs/storage/web/download-files)

  async getDownloadURL(path: string) {
    return getDownloadURL(this.ref(path));
  }

  async getBytes(path: string, maxDownloadSizeBytes?: number) {
    return getBytes(this.ref(path), maxDownloadSizeBytes);
  }

  async getStream(path: string, maxDownloadSizeBytes?: number) {
    return getStream(this.ref(path), maxDownloadSizeBytes);
  }

  // File Metadata (https://firebase.google.com/docs/storage/web/file-metadata)

  async getMetadata(path: string) {
    return getMetadata(this.ref(path));
  }

  async updateMetadata(path: string, metadata?: SettableMetadata) {
    return updateMetadata(this.ref(path), metadata);
  }

  // Delete Files (https://firebase.google.com/docs/storage/web/delete-files)

  async deleteObject(path: string) {
    return deleteObject(this.ref(path));
  }

  // List Files

  listAll(path: string) {
    return listAll(this.ref(path));
  }

  list(path: string, options?: ListOptions) {
    return list(this.ref(path), options);
  }
}

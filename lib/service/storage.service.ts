import { Inject, Injectable, Logger } from "@nestjs/common";
import { FirebaseApp } from "firebase/app";
import {
  connectStorageEmulator,
  getDownloadURL,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
  uploadString,
  UploadResult,
  StringFormat,
  UploadMetadata,
} from "firebase/storage";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../firebase.constants";
import { FirebaseConfig } from "../interface";

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(StorageService.name);
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

  protected _ref(url?: string): StorageReference {
    return ref(this._storage, url);
  }

  async getDownloadURL(path: string): Promise<string> {
    return getDownloadURL(this._ref(path));
  }

  async uploadString(
    path: string,
    value: string,
    format?: StringFormat,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    return uploadString(this._ref(path), value, format, metadata);
  }

  async uploadBytes(
    path: string,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata
  ): Promise<UploadResult> {
    return uploadBytes(this._ref(path), data, metadata);
  }
}

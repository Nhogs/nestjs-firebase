import {Inject, Injectable, Logger} from "@nestjs/common";
import {FirebaseApp} from "@firebase/app";
import {connectStorageEmulator, getStorage,} from "@firebase/storage";
import {FIREBASE_APP, FIREBASE_CONFIG} from "../firebase.constants";
import {FirebaseConfig} from "../interface";

@Injectable()
export class StorageService {
  private readonly _logger = new Logger(StorageService.name);
  private readonly _storage;

  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
    @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: FirebaseConfig
  ) {
    this._storage = getStorage(this.firebaseApp);
    if (this.firebaseConfig.emulator) {
      connectStorageEmulator(this._storage, "localhost", 9199);
    }
  }
  //
  // async getDownloadURL(url: string): Promise<string> {
  //   this._logger.debug('getDownloadURL=>' + url);
  //   return getDownloadURL(ref(this.storage, url));
  // }
}

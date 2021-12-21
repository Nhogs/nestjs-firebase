import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirebaseApp } from '@firebase/app';
import { getDownloadURL, getStorage, ref } from '@firebase/storage';
import { FIREBASE_APP } from '../firebase.constants';

@Injectable()
export class StorageService {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
  ) {}
  private readonly _logger = new Logger(StorageService.name);
  private storage = getStorage(this.firebaseApp);

  async getDownloadURL(url: string): Promise<string> {
    this._logger.debug('getDownloadURL=>' + url);
    return getDownloadURL(ref(this.storage, url));
  }
}

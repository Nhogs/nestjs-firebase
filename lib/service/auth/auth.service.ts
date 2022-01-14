import { Inject, Injectable } from "@nestjs/common";
import { FirebaseApp } from "firebase/app";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../../firebase.constants";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { FirebaseConfig } from "../../interface";

@Injectable()
export class AuthService {
  private readonly _auth;
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
    @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: FirebaseConfig
  ) {
    this._auth = getAuth(this.firebaseApp);
    if (this.firebaseConfig.emulator?.authUrl) {
      connectAuthEmulator(this._auth, this.firebaseConfig.emulator?.authUrl);
    }
  }

  async createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this._auth, email, password);
  }

  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(this._auth, email, password);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { FirebaseApp } from "firebase/app";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../../firebase.constants";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
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

  currentUser() {
    return this._auth.currentUser;
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    return createUserWithEmailAndPassword(this._auth, email, password);
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this._auth, email, password);
  }

  async signInAnonymously() {
    return signInAnonymously(this._auth);
  }

  async signOut() {
    return signOut(this._auth);
  }
}

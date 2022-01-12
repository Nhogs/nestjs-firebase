import { FirebaseEmulatorConfig } from "./firebase-emulator-config";

export interface FirebaseConfig {
  projectId: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  emulator?: FirebaseEmulatorConfig;
}

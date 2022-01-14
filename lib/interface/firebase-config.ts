import { FirebaseEmulatorConfig } from "./firebase-emulator-config";

export interface FirebaseConfig {
  appName?: string;
  projectId: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  emulator?: FirebaseEmulatorConfig;
}

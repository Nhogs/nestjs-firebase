export interface FirebaseEmulatorConfig {
  authUrl?: string;
  firestore?: {
    host: string;
    port: number;
  };
  storage?: {
    host: string;
    port: number;
  };
}

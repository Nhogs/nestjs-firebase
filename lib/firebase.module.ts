import {
  DynamicModule,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import { FirestoreService } from './service';
import { ConfigModule } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import { StorageService } from './service';
import { FIREBASE_APP, FIREBASE_CONFIG } from './firebase.constants';
import {FirebaseConfig} from "./interface";

export const createApp = async (config: FirebaseConfig) => {
  return initializeApp(config);
};

@Module({})
export class FirebaseModule implements OnApplicationShutdown {
  async onApplicationShutdown() {

  }

  static forRoot(config: FirebaseConfig): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
      providers: [
        FirestoreService,
        StorageService,
        {
          provide: FIREBASE_CONFIG,
          useValue: config,
        },
        {
          provide: FIREBASE_APP,
          inject: [FIREBASE_CONFIG],
          useFactory: async (config: FirebaseConfig) => createApp(config),
        },
      ],
      exports: [FirestoreService, StorageService],
    };
  }

  static forRootAsync(configProvider): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
      imports: [ConfigModule],

      providers: [
        FirestoreService,
        StorageService,
        {
          provide: FIREBASE_CONFIG,
          ...configProvider,
        } as Provider<FirebaseConfig>,
        {
          provide: FIREBASE_APP,
          inject: [FIREBASE_CONFIG],
          useFactory: async (config: FirebaseConfig) => createApp(config),
        },
      ],

      exports: [FirestoreService, StorageService],
    };
  }
}

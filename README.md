<a href="https://nhogs.com"><img src="https://nhogs.com/nhogs_64.png" align="right" alt="nhogs-logo" title="NHOGS Interactive"></a>

# @nhogs/nestjs-firebase

[![npm peer dependency version Firebase](https://img.shields.io/npm/dependency-version/@nhogs/nestjs-firebase/peer/firebase?label=Firebase&logo=firebase)](https://firebase.google.com/)
[![npm peer dependency version NestJS)](https://img.shields.io/npm/dependency-version/@nhogs/nestjs-firebase/peer/@nestjs/core?label=Nestjs&logo=nestjs&logoColor=e0234e)](https://github.com/nestjs/nest)

## [Firebase](https://firebase.google.com/) module for [NestJS](https://github.com/nestjs/nest).

[![CI](https://github.com/Nhogs/nestjs-firebase/actions/workflows/ci.yml/badge.svg)](https://github.com/Nhogs/nestjs-firebase/actions/workflows/ci.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/356bd937ca8b2e7b8d96/maintainability)](https://codeclimate.com/github/Nhogs/nestjs-firebase/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/356bd937ca8b2e7b8d96/test_coverage)](https://codeclimate.com/github/Nhogs/nestjs-firebase/test_coverage)

<font size="1">Continuous Integration tests with [Github Action](https://github.com/Nhogs/nestjs-firebase/actions/workflows/ci.yml) on [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) </font>

## Installation

[![npm](https://img.shields.io/npm/v/@nhogs/nestjs-firebase?label=%40nhogs%2Fnestjs-firebase&logo=npm)](https://www.npmjs.com/package/@nhogs/nestjs-firebase)

```bash
$ npm i --save @nhogs/nestjs-firebase
```

First you need to have a running firebase project.
See [Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup)

:warning: This module only uses Firebase client API

- [x] Use [Firebase client API](https://firebase.google.com/docs/web/setup)
- [ ] Use [Firebase admin SDK](https://firebase.google.com/docs/admin/setup)

### Module

Add the module in app imports with project settings

```javascript
@Module({
  imports: [
    FirebaseModule.forRoot({
      apiKey: "API_KEY",
      authDomain: "PROJECT_ID.firebaseapp.com",
      projectId: "PROJECT_ID",
      storageBucket: "PROJECT_ID.appspot.com",
      // Optional name of the app to initialize. Custom name for the Firebase App. The default value is "[DEFAULT]"
      // appName: "APP_NAME",
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

[Check here for an e2e test with real example on Cat module](e2e/src)

This module is a simple wrapper on Firebase API and export 3 services.

- Cloud Firestore
- Storage
- Authentication

### Cloud Firestore

Exposes most of [Firebase firestore web api](https://firebase.google.com/docs/firestore) in the service.

```javascript
// Add document example

it("should addDoc", async () => {
  const users =
    firestoreService.collection("users").withConverter < User > userConverter;

  const doc = (await firestoreService.addDoc) < User > (users, u1);

  const snapshot = await firestoreService.getDoc(doc);
  expect(snapshot.data()).toMatchInlineSnapshot(`
    User {
      "age": 1,
      "firstName": "fn1",
      "lastName": "ln1",
    }
  `);
});
```

See [firestore.service.spec.ts](lib/service/firestore/firestore.service.spec.ts) for detailed usage.

### Storage

Exposes most of [Firebase storage web api](https://firebase.google.com/docs/storage/web/start) in the service.

```javascript
// Upload string and get download url example
it(`should upload string`, async () => {
  const fileName = "file.txt";
  await storageService
    .uploadString(fileName, "text content", "raw", {
      contentType: "text/plain",
    })
    .then((snapshot) => {
      expect(snapshot.metadata.contentType).toMatchInlineSnapshot(
        `"text/plain"`
      );
    });

  const downloadUrl = await storageService.getDownloadURL(fileName);
  expect(downloadUrl).toMatchInlineSnapshot(
    `"http://localhost:9199/v0/b/default-bucket/o/file.txt?alt=media&token=86739ce5-a96e-41ad-b807-e05b12e36516"`
  );
});
```

See [storage.service.spec.ts](lib/service/storage/storage.service.spec.ts) for detailed usage.

### Authentication

See [auth.service.spec.ts](lib/service/auth/auth.service.spec.ts) for detailed usage.

## License

[![MIT license](https://img.shields.io/github/license/nhogs/nestjs-firebase)](LICENSE)

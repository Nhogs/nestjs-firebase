import { Injectable } from "@nestjs/common";
import { CreateCatDto } from "./dto/create-cat.dto";
import { FirestoreService, StorageService } from "../../../lib";
import { UpdateCatDto } from "./dto/update-cat.dto";
import { Cat } from "./entities/cat.entity";
import { catConverter } from "./models/cat.converter";
import { CreateCatsDto } from "./dto/create-cats.dto";

@Injectable()
export class CatsService {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly storageService: StorageService
  ) {}
  async create(createCatDto: CreateCatDto) {
    const cats = this.firestoreService
      .collection(Cat.name)
      .withConverter<Cat>(catConverter);

    return await this.firestoreService.addDoc<Cat>(cats, createCatDto);
  }

  async createAll(createCatsDto: CreateCatsDto) {
    const writeBatch = this.firestoreService.writeBatch();

    createCatsDto.cats.forEach((cat) => {
      writeBatch.set<Cat>(
        this.firestoreService
          .doc(Cat.name, cat.name.toLowerCase())
          .withConverter(catConverter),
        cat
      );
    });

    await writeBatch.commit();
  }

  async findAll() {
    const cats = this.firestoreService
      .collectionGroup(Cat.name)
      .withConverter<Cat>(catConverter);
    return (await this.firestoreService.getDocs(cats)).docs;
  }

  async findOne(id: string) {
    const doc = this.firestoreService
      .doc(Cat.name, id)
      .withConverter<Cat>(catConverter);

    return await this.firestoreService.getDoc(doc);
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const doc = this.firestoreService
      .doc(Cat.name, id)
      .withConverter<Cat>(catConverter);

    return await this.firestoreService.updateDoc<Cat>(doc, updateCatDto);
  }

  async remove(id: string) {
    const doc = this.firestoreService
      .doc(Cat.name, id)
      .withConverter<Cat>(catConverter);

    return await this.firestoreService.deleteDoc<Cat>(doc);
  }

  async getPictureDownloadUrl(name: string) {
    return this.storageService.getDownloadURL(
      "cats/" + name.toLowerCase() + ".jpg"
    );
  }

  async getPictureStream(name: string) {
    return this.storageService.getStream("cats/" + name.toLowerCase() + ".jpg");
  }
}

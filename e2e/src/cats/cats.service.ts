import { Injectable } from "@nestjs/common";
import { CreateCatDto } from "./dto/create-cat.dto";
import { Cat } from "./models/cat.model";
import { FirestoreService } from "../../../lib";
import CatConverter from "./models/cat.converter";
import { UpdateCatDto } from "./dto/update-cat.dto";

@Injectable()
export class CatsService {
  constructor(private readonly firestoreService: FirestoreService) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    return await this.firestoreService.addDoc<Cat>(
      "cats",
      createCatDto,
      CatConverter
    );
  }

  async update(updateCatDto: UpdateCatDto): Promise<Cat> {
    return await this.firestoreService.setDoc<Cat>(
      "cats",
      updateCatDto.id,
      updateCatDto,
      CatConverter
    );
  }

  async findAll(): Promise<Cat[]> {
    return await this.firestoreService.getDocs<Cat>("cats", CatConverter);
  }

  async findOneById(id: string): Promise<Cat> {
    return await this.firestoreService.getDoc<Cat>("cats", id, CatConverter);
  }
}

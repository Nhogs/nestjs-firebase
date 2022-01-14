import { Cat } from "../entities/cat.entity";

export class CatDto extends Cat {
  _id: string;
  url: string;
}

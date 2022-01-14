import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CatsService } from "./cats.service";
import { CreateCatDto } from "./dto/create-cat.dto";
import { UpdateCatDto } from "./dto/update-cat.dto";
import { CatDto } from "./dto/cat.dto";
import { CreateCatsDto } from "./dto/create-cats.dto";

@Controller("cats")
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto): Promise<string> {
    const doc = await this.catsService.create(createCatDto);
    return doc.id;
  }

  @Post("all")
  async createAll(@Body() createCatsDto: CreateCatsDto): Promise<void> {
    await this.catsService.createAll(createCatsDto);
  }

  @Get("all")
  async findAll(): Promise<CatDto[]> {
    return await Promise.all(
      (
        await this.catsService.findAll()
      ).map(async (d) => {
        const cat = d.data();

        return {
          _id: d.id,
          ...cat,
          url: await this.catsService.getPictureDownloadUrl(
            cat.name.toLowerCase()
          ),
        };
      })
    );
  }

  @Get("id/:id")
  async findOne(@Param("id") id: string) {
    const cat = (await this.catsService.findOne(id)).data();
    return {
      _id: id,
      ...cat,
      url: await this.catsService.getPictureDownloadUrl(cat.name.toLowerCase()),
    };
  }

  @Get("picture/:id")
  async getPicture(@Param("id") id: string) {
    (await this.catsService.findOne(id)).data();
  }

  @Patch("id/:id")
  update(@Param("id") id: string, @Body() updateCatDto: UpdateCatDto) {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete("id/:id")
  remove(@Param("id") id: string) {
    return this.catsService.remove(id);
  }
}

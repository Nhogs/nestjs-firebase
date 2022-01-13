import { Module } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";
import { FirebaseModule } from "../../../lib";

@Module({
  imports: [FirebaseModule], // TODO add forFeature helpers for cat entity
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

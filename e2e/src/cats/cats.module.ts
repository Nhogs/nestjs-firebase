import { Module } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";
import { FirebaseModule } from "../../../lib";

@Module({
  imports: [FirebaseModule],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

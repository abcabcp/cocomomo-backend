import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "../common/cloudinary/cloudinary.module";
import { AuthModule } from "../auth/auth.module";
import { UtilsService } from "./utils.service";
import { UtilsController } from "./utils.controller";

@Module({
  imports: [TypeOrmModule.forFeature([]), CloudinaryModule, AuthModule],
  providers: [UtilsService],
  controllers: [UtilsController],
  exports: [UtilsService],
})
export class UtilsModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { Post } from "./entities/post.entity";
import { CloudinaryModule } from "../common/cloudinary/cloudinary.module";

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CloudinaryModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}

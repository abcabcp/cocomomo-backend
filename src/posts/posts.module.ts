import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { PostDto } from "./entities/post.entity";
import { CloudinaryModule } from "../common/cloudinary/cloudinary.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([PostDto]), CloudinaryModule, AuthModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { User } from "./users/entities/user.entity";
import { PostDto, PostRemoveResponseDto } from "./posts/entities/post.entity";
import { Comment } from "./comments/entities/comment.entity";
import { CommentRemoveResponseDto, CommentResponseDto } from "./comments/dto/comment-response.dto";
import {
  PostsRequestDto,
  PostsResponseDto,
  PostsTagsResponseDto,
} from "./posts/dto/find-all-posts.dto";
import { UpdatePostDto } from "./posts/dto/update-post.dto";
import {
  UploadImageDto,
  UploadImageRequestDto,
  UploadImagesDto,
  UploadImagesRequestDto,
} from "./utils/dto/upload-image.dto";
import { DeleteImageDto } from "./utils/dto/delete-image.dto";
import { AuthResponseDto } from "./auth/dto/auth-request.dto";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService
        .get<string>("CORS_ALLOWED_ORIGINS", "")
        .split(",")
        .map((o) => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS 정책 위반: 허용되지 않은 도메인"));
      }
    },
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("COCOMOMO API")
    .setDescription("COCOMOMO 백엔드 API 문서")
    .setVersion("1.0")
    .addApiKey(
      {
        type: "apiKey",
        name: "access-token",
        in: "header",
        description: "인증을 위한 액세스 토큰을 입력하세요",
      },
      "access-token",
    )
    .addServer("http://localhost:4200", "Local Development")
    .addServer("https://api.cocomomo.com", "Production")
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${methodKey}${controllerKey.replace("Controller", "")}`,
    extraModels: [
      User,
      PostDto,
      Comment,
      CommentResponseDto,
      CommentRemoveResponseDto,
      PostRemoveResponseDto,
      PostsResponseDto,
      PostsRequestDto,
      PostsTagsResponseDto,
      UpdatePostDto,
      UploadImagesDto,
      UploadImageDto,
      UploadImageRequestDto,
      UploadImagesRequestDto,
      DeleteImageDto,
      AuthResponseDto,
    ],
  });

  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  app.use("/swagger-json", (req: Request, res: Response) => {
    res.json(document);
  });

  document["x-namespace"] = "api";
  document["x-schema-name"] = "Api";

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port, "0.0.0.0");
}
bootstrap();

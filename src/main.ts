import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { writeFileSync } from "fs";
import { join } from "path";
import { Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });
  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>("CORS_ORIGINS");
  const corsWhitelist: Array<string | RegExp> = [];

  const frontendUrl = configService.get<string>("FRONTEND_URL");
  if (frontendUrl) {
    corsWhitelist.push(frontendUrl);
  }

  if (corsOrigins) {
    const additionalOrigins = corsOrigins.split(",").map((origin) => origin.trim());
    corsWhitelist.push(...additionalOrigins);
  }

  if (process.env.NODE_ENV === "development") {
    corsWhitelist.push(/^https?:\/\/localhost(:[0-9]+)?$/);
    corsWhitelist.push(/^https?:\/\/.*-localhost(:[0-9]+)?$/);
  }

  app.enableCors({
    origin: (origin: string, callback: (error: Error | null, result?: boolean) => void) => {
      if (
        !origin ||
        corsWhitelist.some((allowedOrigin) => {
          return typeof allowedOrigin === "string"
            ? allowedOrigin === origin
            : allowedOrigin.test(origin);
        })
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS 정책 위반: 허용되지 않은 도메인입니다"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("COCOMOMO API")
    .setDescription("COCOMOMO 백엔드 API 문서")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("swagger", app, document);
  app.use("/swagger-json", (req: Request, res: Response) => {
    res.json(document);
  });

  if (process.env.NODE_ENV === "development") {
    writeFileSync(join(process.cwd(), "swagger-spec.json"), JSON.stringify(document, null, 2));
  }

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port, "0.0.0.0");
}

bootstrap();

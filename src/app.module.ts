import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { CommentsModule } from "./comments/comments.module";
import { PostsModule } from "./posts/posts.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        ssl: {
          rejectUnauthorized: configService.get("NODE_ENV") === "production",
        },
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: configService.get("NODE_ENV") !== "production",
        poolSize: 10,
        connectTimeoutMS: 10000,
        extra: {
          max: 10,
          connectionTimeoutMillis: 10000,
        },
        logging: configService.get("NODE_ENV") !== "production",
        schema: "public",
      }),
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommentsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const secret = config.get("JWT_SECRET");
        return {
          secret: secret,
          signOptions: { expiresIn: "30d" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
})
export class AppModule {}

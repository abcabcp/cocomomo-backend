import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class User {
  @ApiProperty({ description: "사용자 ID (자동생성)", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "GitHub ID", example: 12345678 })
  @Column({ unique: true })
  githubId: number;

  @ApiProperty({ description: "사용자 이름", example: "username" })
  @Column()
  username: string;

  @ApiProperty({ description: "사용자 이메일", example: "user@example.com", required: false })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({
    description: "프로필 이미지 URL",
    example: "https://avatars.githubusercontent.com/u/1234567",
    required: false,
  })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: "사용자 권한", enum: UserRole, example: UserRole.USER })
  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: "사용자 계정 생성 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ApiProperty({ description: "사용자 정보 수정 시간", example: "2025-06-09T13:30:51+09:00" })
  @Column({ default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}

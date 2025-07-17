import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "src/users/entities/user.entity";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers["access-token"];

    if (!token) {
      console.error("No token provided");
      throw new UnauthorizedException("Token required");
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        id: payload.userId,
        platformId: payload.userId,
        name: "",
        email: "",
        role: payload.role || UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      return true;
    } catch (error) {
      console.error("Token Verification Error:", error);
      throw new UnauthorizedException("Invalid token");
    }
  }
}

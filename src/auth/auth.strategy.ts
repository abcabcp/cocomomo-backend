import { User } from "../users/entities/user.entity";

export interface AuthStrategy {
  getProfile(accessToken: string): Promise<User>;
  validate(profile: User): Promise<User>;
}

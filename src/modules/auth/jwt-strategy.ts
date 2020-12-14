import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '../user/user.service';

export const JWT_STRATEGY_JWT = 'jwt';
export const JWT_STRATEGY_REFRESH = 'jwt-refresh';

export interface IJwtPayload {
  email: string;
  id: number;
}

const getStrategyConstructorArgs = () => ({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_JWT_SECRET,
  ignoreExpiration: false,
});

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_JWT) {
  constructor(private readonly userService: UserService) {
    super(getStrategyConstructorArgs());
  }

  async validate(payload: IJwtPayload): Promise<any> {
    const { email, id } = payload;
    const user = await this.userService.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { email, id };
  }
}

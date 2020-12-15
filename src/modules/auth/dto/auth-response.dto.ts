export class AuthResponseDto {
  accessToken: string;
  user: any;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}

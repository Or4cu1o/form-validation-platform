import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string; // matricula ou e-mail

  @IsString()
  @IsNotEmpty()
  password!: string;
}

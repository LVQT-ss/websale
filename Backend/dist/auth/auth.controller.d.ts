import express from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService, type UserInfo } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserPayload } from './interfaces/jwt-payload.interface.js';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    register(dto: RegisterDto, res: express.Response): Promise<{
        accessToken: string;
    }>;
    login(dto: LoginDto, res: express.Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: express.Request, res: express.Response): Promise<{
        accessToken: string;
    }>;
    logout(user: UserPayload, res: express.Response): Promise<{
        message: string;
    }>;
    getMe(user: UserPayload): Promise<UserInfo>;
    private setRefreshTokenCookie;
}

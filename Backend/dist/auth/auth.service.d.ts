import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, emailService: EmailService);
    register(dto: RegisterDto): Promise<TokenPair>;
    login(dto: LoginDto): Promise<TokenPair>;
    refreshToken(token: string): Promise<TokenPair>;
    logout(userId: string): Promise<void>;
    getMe(userId: string): Promise<UserInfo>;
    generateTokens(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<TokenPair>;
    validateUser(payload: JwtPayload): Promise<UserInfo | null>;
}

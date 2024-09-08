import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokes.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async localSignup(authDto: AuthDto): Promise<Tokens> {
        const hash = await this.hashData(authDto.password);

        const newUser = await this.prisma.user.create({
            data: {
                email: authDto.email,
                hash,
            },
        });

        const tokens = await this.getTokens(newUser.id, newUser.email);
        await this.updateRtHash(newUser.id, tokens.refreshToken);
        return tokens;
    }

    async localSignin(authDto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: authDto.email,
            }
        })

        if (!user) throw new ForbiddenException('Access denied');

        const passwordMatch = await bcrypt.compare(authDto.password, user.hash);
        if (!passwordMatch) throw new ForbiddenException('Access denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: number) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: {
                    not: null,
                },
            },
            data: {
                hashedRt: null,
            },
        });
    }

    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })

        if (!user || !user.hashedRt) throw new ForbiddenException('Access denied');

        const rtMatch = await bcrypt.compare(rt, user.hashedRt);
        if (!rtMatch) throw new ForbiddenException('Access denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refreshToken);
        return tokens;
    }


    async updateRtHash(userId: number, rt: string) {
        const hash = await this.hashData(rt);

        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRt: hash,
            },
        });
    }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: number, email: string) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { 
                    sub: userId, 
                    email,
                },{
                    secret: 'at-secret',
                    expiresIn: 60 * 15,
                }
            ),
            this.jwtService.signAsync(
                { 
                    sub: userId, 
                    email,
                },{
                    secret: 'rt-secret',
                    expiresIn: 60 * 60 * 24 * 7,
                }
            )
        ])

        return {
            accessToken: at,
            refreshToken: rt,
        }
    }
}
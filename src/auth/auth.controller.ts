import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types/tokes.type';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('local/signup')
    @HttpCode(HttpStatus.CREATED)
    localSignup(@Body(ValidationPipe) authDto: AuthDto): Promise<Tokens> {
        return this.authService.localSignup(authDto);
    }

    @Post('local/signin')
    @HttpCode(HttpStatus.CREATED)
    localSignin(@Body(ValidationPipe) authDto: AuthDto): Promise<Tokens> {
        return this.authService.localSignin(authDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Req() req: Request) {
        const user = req.user;
        return this.authService.logout(user['sub']);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Req() req: Request) {
        const user = req.user;
        return this.authService.refreshTokens(user['sub'], user['refreshToken']);
    }
}
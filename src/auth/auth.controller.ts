import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types/tokes.type';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('local/signup')
    localSignup(@Body(ValidationPipe) authDto: AuthDto): Promise<Tokens> {
        return this.authService.localSignup(authDto);
    }

    @Post('local/signin')
    localSignin(@Body(ValidationPipe) authDto: AuthDto): Promise<Tokens> {
        return this.authService.localSignin(authDto);
    }

    @Post('logout')
    logout() {
        this.authService.logout();
    }

    @Post('refresh')
    refreshTokens() {
        this.authService.refreshTokens();
    }
}

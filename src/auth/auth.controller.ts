import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types/tokes.type';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { RtGuard } from './guards/rt.guard';
import { AtGuard } from './guards/at.guard';


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

    @UseGuards(AtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetCurrentUserId() userId: number) {
        return this.authService.logout(userId);
    }

    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @GetCurrentUserId() userId: number, 
        @GetCurrentUser('refreshToken') refreshTokens: string
    ) {
        return this.authService.refreshTokens(userId, refreshTokens);
    }
}
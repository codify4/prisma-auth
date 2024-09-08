import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types/tokes.type';
import { AtGuard } from './common/guards/at.guard';
import { RtGuard } from './common/guards/rt.guard';
import { GetCurrentUser } from './common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from './common/decorators/get-current-user-id.decorator';


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
    logout(@GetCurrentUserId() userID: number) {
        return this.authService.logout(userID);
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
import {
  Controller,
  Get,
  Inject,
  Query,
  Redirect,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LineService } from './line.service';
import * as randomstring from 'randomstring';

@Controller('line')
export class LineController {
  constructor(
    private readonly lineService: LineService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @Get('/get-url-login')
  async getLineLoginUrl(@Req() request: any) {
    const state = randomstring.generate();
    await this.cacheManager.set('state', state);
    const url = await this.lineService.getAuthorizationUrl(state);
    return { url };
  }

  @Get('callback')
  @Redirect()
  async getAccessToken(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() request: any,
  ): Promise<any> {
    // const stateCache = await this.cacheManager.get('state');
    // if (stateCache !== state) {
    //   throw new UnauthorizedException('Invalid state');
    // }
    await this.cacheManager.del('state');

    const response = await this.lineService.getAccessToken(code);
    const accessToken = response.access_token;

    const userProfile = await this.lineService.getUserProfile(
      accessToken,
      response.id_token,
    );
    return {
      url: `http://127.0.0.1:5500/webapp/index.html?userId=${userProfile.userId}`,
    };
  }

  @Get('send-message')
  async sendMessage(
    @Query('to') to: string,
    @Query('message') message: string,
  ): Promise<any> {
    return await this.lineService.sendMessage(to, message);
  }

  @Get('/get-noti-url-login')
  async getNotiLoginUrl(@Req() request: any) {
    const state = randomstring.generate();
    await this.cacheManager.set('state', state);
    const url = await this.lineService.getNotifyAuthorizationUrl(state);
    return { url };
  }

  @Get('/noti-callback')
  @Redirect()
  async notifyCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    // const state = randomstring.generate();
    // await this.cacheManager.set('state', state);
    const res = await this.lineService.notifyAuthorizationCallback(code);
    return {
      url: `http://127.0.0.1:5500/webapp/index.html?access_token=${res.access_token}`,
    };
  }

  @Get('/push-noti')
  @Redirect()
  async pushNoti(
    @Query('access_token') accessToken: string,
    @Query('message_notify') messageNotify: string,
  ) {
    return await this.lineService.pushNotify(accessToken, messageNotify);
  }

  @Get('/revoke-noti')
  async revokeNoti(@Query('access_token') accessToken: string) {
    return await this.lineService.revokeNotify(accessToken);
  }
}

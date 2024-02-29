import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as qs from 'qs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notifySDK = require('line-notify-sdk');

@Injectable()
export class LineService {
  private readonly channelId: string;
  private readonly channelSecret: string;
  private readonly httpService: HttpService;
  private readonly notifyClientId: string;
  private readonly notifyClientSecret: string;

  constructor(httpService: HttpService) {
    this.channelId = '2003772566';
    this.channelSecret = '22a0c20e1cd3263b7e725e5dfcb445c2';
    this.notifyClientId = '8rLWJlAhdX2A8GjjBTis9A';
    this.notifyClientSecret = 't53CIUQpdKEl3VpT8riaiOVVwh7brAk1aiWYd7usbkw';
    this.httpService = httpService;
  }

  async getAuthorizationUrl(state: string): Promise<string> {
    const params = {
      response_type: 'code',
      client_id: this.channelId,
      redirect_uri: 'http://localhost:3001/line/callback',
      state,
      // scope: 'profile openid',
      bot_prompt: 'aggressive',
      // nonce: 'test',
    };

    const url = `https://access.line.me/oauth2/v2.1/authorize?${qs.stringify(
      params,
    )}&scope=openid%20profile%20real_name%20gender%20birthdate%20phone%20address`;
    return url;
  }

  async getAccessToken(code: string): Promise<any> {
    try {
      const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:3001/line/callback',
        client_id: this.channelId,
        client_secret: this.channelSecret,
      };

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const observable = this.httpService.post(
        'https://api.line.me/oauth2/v2.1/token',
        qs.stringify(params),
        { headers },
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserProfile(accessToken: string, id_token: string): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const observable = this.httpService.get(
        'https://api.line.me/v2/profile',
        {
          headers,
        },
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async sendMessage(to: string, message: string) {
    try {
      const headers = {
        Authorization: `Bearer S85aJ/hHy4L/31Svu2V5TNAvC8AOEJOpDs18IZlvL57StX6dN2MojX43Id2mV11bWDi2U4FxAExMk7gY1YPPGmcp0zDUPNLV/ia2CH0Duir2Ya3qZgDMPs/OHTYcPq0EgvVvjJ4B8cyY88vMGVaOcQdB04t89/1O/w1cDnyilFU=`,
        'Content-Type': 'application/json',
      };

      const flexMessage = {
        type: 'flex',
        altText: '本メールは、CAREKARTE Passのアカウントに関するお知らせです。',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '本メールは、CAREKARTE Passのアカウントに関するお知らせです。',
                weight: 'bold',
                size: 'md',
              },
            ],
          },
        },
      };

      const body = {
        to,
        messages: [flexMessage],
      };

      const observable = this.httpService.post(
        'https://api.line.me/v2/bot/message/push',
        body,
        { headers },
      );

      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNotifyAuthorizationUrl(state: string): Promise<string> {
    const notifyClient = new notifySDK(
      this.notifyClientId,
      this.notifyClientSecret,
      'http://localhost:3001/line/noti-callback',
    );
    const url = notifyClient.generateOauthURL(state);
    return url;
  }

  async notifyAuthorizationCallback(code: string) {
    try {
      const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:3001/line/noti-callback',
        client_id: this.notifyClientId,
        client_secret: this.notifyClientSecret,
      };

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const observable = this.httpService.post(
        'https://notify-bot.line.me/oauth/token',
        qs.stringify(params),
        { headers },
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async pushNotify(accessToken: string, messageNotify: string) {
    try {
      const params = {
        message: messageNotify,
      };

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      };

      const observable = this.httpService.post(
        'https://notify-api.line.me/api/notify',
        qs.stringify(params),
        { headers },
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async revokeNotify(accessToken: string) {
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      };

      const observable = this.httpService.post(
        'https://notify-api.line.me/api/revoke',
        undefined,
        { headers },
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

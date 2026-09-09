import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): { name: string; status: string; time: string } {
    return {
      name: 'Harmony Restaurant API',
      status: 'ok',
      time: new Date().toISOString(),
    };
  }
}

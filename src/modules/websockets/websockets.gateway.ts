import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bid } from 'src/db/models';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class WebsocketsGateway {
  private logger: Logger = new Logger(WebsocketsGateway.name);

  @WebSocketServer()
  server: Server;

  public afterInit(server: Server): void {
    this.logger.log('Websockets initialized');
  }

  async handleConnection(client: Socket) {
    client.on('join', (room: string) => this.joinRooom(client, room));
  }

  @SubscribeMessage('events')
  findAll(): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('newBid')
  async newData(@MessageBody() data: Bid): Promise<any> {
    return data;
  }

  async joinRooom(client: Socket, room: string): Promise<void> {
    client.join(room);
  }

  async leaveRooom(client: Socket, room: string): Promise<void> {
    client.leave(room);
  }

  async publishEventToRoom(
    room: string,
    event: string,
    data: any,
  ): Promise<void> {
    this.server.to(room).emit(event, data);
  }
}

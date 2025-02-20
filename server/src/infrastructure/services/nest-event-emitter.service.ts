import { ICustomEventEmitterService } from '@domain/services/custom-event-emitter.service.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NestEventEmitterService implements ICustomEventEmitterService {
    constructor(private eventEmitter: EventEmitter2) {}

    emit(event: string, payload: any): void {
        this.eventEmitter.emit(event, payload)
    }
}
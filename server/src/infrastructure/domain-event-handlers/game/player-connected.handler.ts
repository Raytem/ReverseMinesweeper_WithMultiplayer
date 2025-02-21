import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PlayerConnectedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(PlayerConnectedEvent)
export class PlayerConnectedHandler implements IEventHandler<PlayerConnectedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: PlayerConnectedEvent) {
		this.eventEmitter.emit(PlayerConnectedEvent.name, event);
	}
}

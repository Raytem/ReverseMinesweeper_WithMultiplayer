import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PlayerDisconnectedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(PlayerDisconnectedEvent)
export class PlayerDisconnectedHandler implements IEventHandler<PlayerDisconnectedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: PlayerDisconnectedEvent) {
		this.eventEmitter.emit(PlayerDisconnectedEvent.name, event);
	}
}

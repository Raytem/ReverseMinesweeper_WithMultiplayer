import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PlayerScoreUpdatedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(PlayerScoreUpdatedEvent)
export class PlayerScoreUpdatedHandler implements IEventHandler<PlayerScoreUpdatedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: PlayerScoreUpdatedEvent) {
		this.eventEmitter.emit(PlayerScoreUpdatedEvent.name, event);
	}
}

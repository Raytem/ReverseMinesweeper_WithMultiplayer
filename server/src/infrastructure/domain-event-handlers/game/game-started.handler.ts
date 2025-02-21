import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameStartedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GameStartedEvent)
export class GameStartedHandler implements IEventHandler<GameStartedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: GameStartedEvent) {
		this.eventEmitter.emit(GameStartedEvent.name, event);
	}
}

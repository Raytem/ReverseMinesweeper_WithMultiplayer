import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameEndedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GameEndedEvent)
export class GameEndedHandler implements IEventHandler<GameEndedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: GameEndedEvent) {
		this.eventEmitter.emit(GameEndedEvent.name, event);
	}
}

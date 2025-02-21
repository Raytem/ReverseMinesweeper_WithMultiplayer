import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GameAbortedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(GameAbortedEvent)
export class GameAbortedHandler implements IEventHandler<GameAbortedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: GameAbortedEvent) {
		this.eventEmitter.emit(GameAbortedEvent.name, event);
	}
}

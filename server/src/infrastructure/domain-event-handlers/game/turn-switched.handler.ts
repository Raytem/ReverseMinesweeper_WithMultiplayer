import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TurnSwitchedEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(TurnSwitchedEvent)
export class TurnSwitchedHandler implements IEventHandler<TurnSwitchedEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: TurnSwitchedEvent) {
		this.eventEmitter.emit(TurnSwitchedEvent.name, event);
	}
}

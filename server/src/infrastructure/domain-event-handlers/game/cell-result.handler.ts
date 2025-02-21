import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CellResultEvent } from '@domain/event-emitter-events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventsHandler(CellResultEvent)
export class CellResultHandler implements IEventHandler<CellResultEvent> {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	handle(event: CellResultEvent) {
		this.eventEmitter.emit(CellResultEvent.name, event);
	}
}

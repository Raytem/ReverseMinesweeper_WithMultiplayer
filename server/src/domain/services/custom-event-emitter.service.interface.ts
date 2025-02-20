export interface ICustomEventEmitterService {
	emit(name: string, payload: any): void
}
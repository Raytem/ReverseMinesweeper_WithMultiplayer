export interface ICustomEventEmitterService {
	emit(name: string, payload: any): void;
}

export namespace ICustomEventEmitterService {
	export const $ = Symbol('ICustomEventEmitterService');
}

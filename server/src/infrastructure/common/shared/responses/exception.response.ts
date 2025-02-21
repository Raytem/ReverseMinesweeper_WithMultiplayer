export class ExceptionResponseDto {
	constructor(
		public statusCode: number,
		public message: string,
		public errors?: string[]
	) {}
}

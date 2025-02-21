import { IsNumber } from 'class-validator';

export class CreateGameDto {
	@IsNumber()
	fieldSize: number;

	@IsNumber()
	totalDiamonds: number;
}

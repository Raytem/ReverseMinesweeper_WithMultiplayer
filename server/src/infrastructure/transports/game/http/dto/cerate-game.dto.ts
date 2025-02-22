import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
	@ApiProperty({ type: Number })
	@IsInt()
	fieldSize: number;

	@ApiProperty({ type: Number })
	@IsInt()
	totalDiamonds: number;
}

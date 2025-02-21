import { IsInt, IsString } from 'class-validator';

export class OpenCellDto {
	@IsString()
	gameId: string;

	@IsInt()
	x: number;

	@IsInt()
	y: number;
}

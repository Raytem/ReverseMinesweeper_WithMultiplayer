import { IsString } from 'class-validator';

export class LeaveGameDto {
	@IsString()
	gameId: string;
}
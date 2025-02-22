import { Expose, Type } from 'class-transformer';
import { GameStatus } from '@domain/entities/game/enums/game-status.enum';
import { PlayerResponse } from '@infrastructure/transports/game/http/responses/player.response';
import { ApiProperty } from '@nestjs/swagger';

export class ShortGameResponse {
	@ApiProperty({ type: String })
	@Expose()
	id: string;

	@ApiProperty({ enum: GameStatus })
	@Expose()
	status: GameStatus;

	@ApiProperty({ type: Date, nullable: true })
	@Expose()
	startTime: Date | null;

	@ApiProperty({ type: String, nullable: true })
	@Expose()
	winnerPlayerId: string | null;

	@ApiProperty({ type: String, nullable: true })
	@Expose()
	nextTurnPlayerId: string | null;

	@ApiProperty({ type: PlayerResponse, isArray: true })
	@Type(() => PlayerResponse)
	@Expose()
	players: PlayerResponse[];
}

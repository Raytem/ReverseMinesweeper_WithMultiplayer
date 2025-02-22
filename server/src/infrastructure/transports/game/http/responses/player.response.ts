import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PlayerResponse {
	@ApiProperty({ type: String })
	@Expose()
	id: string;

	@ApiProperty({ type: Number })
	@Expose()
	diamondsCollected: number;
}

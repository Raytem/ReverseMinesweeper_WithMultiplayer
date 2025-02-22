import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CellResponse {
	@ApiProperty({ type: Number })
	@Expose()
	x: number;

	@ApiProperty({ type: Number })
	@Expose()
	y: number;

	@ApiProperty({ type: Number })
	@Expose()
	adjacentDiamonds: number;

	@ApiProperty({ type: Boolean })
	@Expose()
	hasDiamond: boolean;

	@ApiProperty({ type: Boolean })
	@Expose()
	isOpened: boolean;
}

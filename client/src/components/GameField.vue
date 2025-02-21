<template>
	<v-row class="game-field" justify="center">
		<v-col
			v-for="(row, rowIndex) in field"
			:key="rowIndex"
			:cols="12"
		>
			<v-row>
				<v-col
					v-for="(cell, colIndex) in row"
					:key="colIndex"
					:cols="12 / fieldSize"
					class="cell"
					@click="handleCellClick(cell)"
				>
					<v-card
						class="cell-card"
						:color="cell._isOpened ? 'lightgreen' : 'grey'"
					>
						<v-card-text class="cell-text">
							<template v-if="cell._isOpened">
								<span v-if="cell._hasDiamond">💎</span>
								<span v-else-if="cell._adjacentDiamonds > 0">{{ cell._adjacentDiamonds }}</span>
								<span v-else>🔲</span>
							</template>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script>
import WebSocketService from '@/services/WebSocketService';

export default {
	props: {
		field: {
			type: Array,
			required: true
		},
		fieldSize: {
			type: Number,
			required: true
		},
		gameId: {
			type: String,
			required: true
		}
	},
	methods: {
		handleCellClick(cell) {
			if (!cell._isOpened) {
				WebSocketService.openCell(this.gameId, cell._x, cell._y)
				console.log(`Cell click (x:${cell._x}, y:${cell._y})`)
			}
		}
	},
};
</script>

<style scoped>
.game-field {
	margin-top: 20px;
	display: block;
}

.cell {
	display: flex;
	justify-content: center;
	align-items: center;
}

.cell-card {
	width: 60px;
	height: 60px;
	text-align: center;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
}

.cell-text {
	font-size: 18px;
	font-weight: bold;
	color: white;
}
</style>
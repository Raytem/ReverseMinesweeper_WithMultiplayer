<template>
	<div class="game-field" :style="gridStyle">
		<div
			v-for="(cell, index) in flattenedField"
			:key="index"
			class="cell"
			@click="handleCellClick(cell)"
			:class="{ opened: cell.isOpened }"
		>
			<template v-if="cell && cell.isOpened">
				<span v-if="cell.hasDiamond">💎</span>
				<span v-else-if="cell.adjacentDiamonds > 0">{{ cell.adjacentDiamonds }}</span>
			</template>
		</div>
	</div>
</template>

<script>
import WebSocketService from '@/services/websocket/WebSocketService';

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
	computed: {
		flattenedField() {
			return this.field.flat();
		},
		gridStyle() {
			return {
				display: 'grid',
				gridTemplateColumns: `repeat(${this.fieldSize}, 80px)`,
				gridTemplateRows: `repeat(${this.fieldSize}, 80px)`,
				gap: '2px',
				justifyContent: 'center'
			};
		}
	},
	methods: {
		handleCellClick(cell) {
			if (!cell.isOpened) {
				WebSocketService.openCell(this.gameId, cell.x, cell.y)
				console.debug(`Cell click (x:${cell.x}, y:${cell.y})`)
			}
		}
	},
};
</script>

<style scoped>
.game-field {
	display: grid;
	grid-template-columns: repeat(auto-fill, 80px);
	gap: 2px;
	justify-content: center;
	margin-top: 20px;
}
.cell {
	width: 80px;
	height: 80px;
	background-color: grey;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	color: #595959;
	font-size: 18px;
	font-weight: bold;
	border-radius: 4px;
	user-select: none;
}

.cell.opened {
	background-color: #cfcfcf;
}
</style>
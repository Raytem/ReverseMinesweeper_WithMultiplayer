export class ArrayUtil {
	static shuffle<T>(array: T[]) {
		for (let i = array.length - 1; i > 0; i--) {
			const random = Math.floor(Math.random() * (i + 1));
			[array[i], array[random]] = [array[random]!, array[i]!];
		}
		return array;
	}
}

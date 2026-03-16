export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 300,
): (...args: Parameters<T>) => void {
	let lastCallTime = 0;
	let timer: ReturnType<typeof setTimeout> | null = null;

	return function (this: any, ...args: Parameters<T>): void {
		const now = Date.now();
		const remaining = delay - (now - lastCallTime);

		if (remaining <= 0) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			lastCallTime = now;
			fn.apply(this, args);
		} else if (!timer) {
			timer = setTimeout(() => {
				lastCallTime = Date.now();
				timer = null;
				fn.apply(this, args);
			}, remaining);
		}
	};
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number = 300,
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;

	return function (this: any, ...args: Parameters<T>): void {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			fn.apply(this, args);
			timer = null;
		}, delay);
	};
}

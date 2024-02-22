import ICache from "interfaces/ICache";
import { IClass } from "interfaces/IClass";

class CacheHandler<T> implements ICache<T> {
	private cache: Map<unknown, T>;

	constructor() {
		this.cache = new Map<unknown, T>();
	}
	delete(key: unknown): void {
		this.cache.delete(key);
	}
	has(key: unknown): boolean {
		return this.cache.has(key);
	}
	Start(): void {}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	entries(): typeof this.cache {
		return this.cache;
	}

	set(key: unknown, value: T): void {
		this.cache.set(key, value);
	}

	get(key: unknown): unknown | undefined {
		return this.cache.get(key);
	}

	remove(key: unknown): void {
		this.cache.delete(key);
	}
}

export = CacheHandler;

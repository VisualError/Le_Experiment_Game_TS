import ICache from "interfaces/ICache";
import Class from "shared/AbstractClasses/ClassAbstract";

class CacheHandler extends Class implements ICache {
	private cache: Map<unknown, unknown>;

	constructor() {
		super();
		this.cache = new Map<unknown, unknown>();
		this.size = 0;
	}

	setCache<T1, T2>(cache: Map<T1, T2>): void {
		this.cache = cache;
	}
	size: number;
	delete(key: unknown): void {
		if (this.cache?.has(key)) this.size--;
		this.cache?.delete(key);
	}
	has(key: unknown): boolean | undefined {
		return this.cache?.has(key);
	}
	entries(): typeof this.cache {
		return this.cache;
	}

	set(key: unknown, value: unknown): void {
		if (!this.cache?.has(key)) this.size++;
		this.cache?.set(key, value);
	}

	get(key: unknown): unknown | undefined {
		return this.cache?.get(key);
	}
}

export = CacheHandler;

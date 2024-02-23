import ICache from "interfaces/ICache";
import Class from "shared/AbstractClasses/ClassAbstract";

class CacheHandler<T> extends Class implements ICache<T> {
	private cache: Map<unknown, T>;

	constructor() {
		super();
		this.cache = new Map<unknown, T>();
		this.size = 0;
	}
	size: number;
	delete(key: unknown): void {
		if (this.cache.has(key)) this.size--;
		this.cache.delete(key);
	}
	has(key: unknown): boolean {
		return this.cache.has(key);
	}
	entries(): typeof this.cache {
		return this.cache;
	}

	set(key: unknown, value: T): void {
		if (!this.cache.has(key)) this.size++;
		this.cache.set(key, value);
	}

	get(key: unknown): unknown | undefined {
		return this.cache.get(key);
	}
}

export = CacheHandler;

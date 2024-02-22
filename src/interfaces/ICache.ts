import { IClass } from "./IClass";

// I can't stop laughing at this.
interface ICache<T> extends IClass {
	set(key: unknown, value: T): void;
	get(key: unknown): unknown | undefined;
	has(key: unknown): boolean;
	remove(key: unknown): void;
	delete(key: unknown): void;
	entries(): void;
}

export default ICache;

import { IClass } from "./IClass";

// I can't stop laughing at this.
/**
 * A generic cache interface.
 * @template T - the type of data stored in the cache
 */
export interface ICache extends IClass {
	/**
	 * Sets a value in the cache.
	 * @param key - the key to store the value under
	 * @param value - the value to store
	 */
	set(key: unknown, value: unknown): void;

	/**
	 * Gets a value from the cache.
	 * @param key - the key of the value to retrieve
	 * @returns the value stored under the specified key, or undefined if no value is found
	 */
	get(key: unknown): unknown;

	/**
	 * Checks if a value is present in the cache.
	 * @param key - the key of the value to check
	 * @returns true if a value is present for the specified key, false otherwise
	 */
	has(key: unknown): boolean | undefined;

	/**
	 * Deletes a value from the cache.
	 * @param key - the key of the value to delete
	 */
	delete(key: unknown): void;

	/**
	 * Returns an iterator over the entries in the cache.
	 * @returns an iterator over the entries in the cache, where each entry is an array of [key, value]
	 */
	entries(): void;

	size: number;
}

export default ICache;

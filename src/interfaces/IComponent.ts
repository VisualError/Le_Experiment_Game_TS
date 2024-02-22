import { IClass } from "./IClass";

/**
 * An interface that represents a component in the game engine.
 * @interface
 */
export interface IComponent extends IClass {
	/**
	 * Starts a coroutine on the component.
	 * @param {Callback} method - The method to be invoked on each frame of the coroutine.
	 * @param {string} identifier - A unique identifier for the coroutine.
	 */
	StartCoroutine(method: Callback, identifier: string): void;

	/**
	 * Stops the currently running coroutine on the component.
	 */
	StopCoroutine(): void;

	/**
	 * Destroys the component.
	 */
	Destroy(): void;
}

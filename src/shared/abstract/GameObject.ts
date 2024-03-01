import { BaseComponent } from "@flamework/components";
import Maid from "@rbxts/maid";
export abstract class GameObject<A = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
	maid?: Maid;

	/**
	 * Starts a new coroutine on the object.
	 * @param callback The function that defines the coroutine.
	 */
	StartCoroutine(callback: Callback): void {
		if (!this.Threads) this.Threads = new Map();
		const newCoroutine = coroutine.create(callback);
		this.Threads?.set(callback, newCoroutine);
		coroutine.resume(newCoroutine);
	}
	/**
	 * Stops a coroutine on the object.
	 * @param callback The function that was used to start the coroutine.
	 */
	StopCoroutine(callback: Callback): void {
		if (!this.Threads?.has(callback)) return;
		this.Threads?.delete(callback);
		coroutine.close(this.Threads!.get(callback)!);
	}

	/**
	 * Stops all coroutines on the object.
	 */
	public StopCoroutines(): void {
		if (this.Threads === undefined) {
			return;
		}

		for (const [_, value] of this.Threads!) {
			coroutine.close(value);
		}

		this.Threads = undefined;
	}

	// Clarification: this method happens when a tag is removed from the object or when the object is destroyed.
	override destroy(): void {
		super.destroy(); // UNSURE which order to go by. I'll run the initial method first.
		this.Clean();
	}

	/**
	 * Cleans up the object by removing the Maid and stopping any coroutines.
	 *
	 * @remarks
	 * This method is called when the object is destroyed or its tags are removed.
	 */
	private Clean(): void {
		try {
			//this.maid?.Destroy();
			this.StopCoroutines();
		} catch (err) {
			warn(`Failed to call onRemove on ${this.instance.Name}`, err);
		}
	}

	private Threads?: Map<Callback, thread>;
}

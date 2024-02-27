import { BaseComponent } from "@flamework/components";
import { OnDestroy } from "interfaces/CustomInterfaces";
export class GameObject<A, I extends Instance> extends BaseComponent<A, I> {
	constructor() {
		super();
		if (!GameObject.onDestroyCheck(this)) return;
		this.DestroyingRBXScriptConnection = this.instance.Destroying.Connect(() => this.DestroyingEvent!());
	}
	static onDestroyCheck<T extends OnDestroy>(component: unknown) {
		// Check if the object has the onDestroy method, which is unique to the OnDestroy interface
		return typeIs((component as T).onDestroy, "function");
	}
	private DestroyingEvent(): void {
		try {
			(this as unknown as OnDestroy).onDestroy(); // Scuffed.
		} catch (err) {
			warn(`Failed to call onDestroy on ${this.instance.Name}`, err);
		}
		this.DestroyingRBXScriptConnection?.Disconnect();
		this.DestroyingRBXScriptConnection = undefined;
	}
	protected onRemove(): void {}

	StartCoroutine(callback: Callback): void {
		if (!this.Threads) this.Threads = new Map();
		const newCoroutine = coroutine.create(callback);
		this.Threads?.set(callback, newCoroutine);
		coroutine.resume(newCoroutine);
	}

	StopCoroutine(callback: Callback): void {
		if (!this.Threads?.has(callback)) return;
		this.Threads?.delete(callback);
		coroutine.close(this.Threads!.get(callback)!);
	}

	StopCoroutines() {
		if (this.Threads === undefined) return;
		for (const [_, value] of this.Threads!) {
			coroutine.close(value);
		}
		this.Threads = undefined;
	}

	// Clarification: this method happens when a tag is removed from the object or when the object is destroyed.
	override destroy(): void {
		super.destroy(); // UNSURE which order to go by. I'll run the initial method first.
		this.CleanCustom();
		this.DestroyingRBXScriptConnection?.Disconnect();
		this.DestroyingRBXScriptConnection = undefined;
	}

	private CleanCustom(): void {
		try {
			this.onRemove();
			this.StopCoroutines();
		} catch (err) {
			warn(`Failed to call onRemove on ${this.instance.Name}`, err);
		}
	}

	private Threads?: Map<Callback, thread>;
	private DestroyingRBXScriptConnection?: RBXScriptConnection;
}

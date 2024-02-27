import { BaseComponent } from "@flamework/components";
import Maid from "@rbxts/maid";
import { OnDestroy, OnRemove } from "interfaces/CustomInterfaces";
import { hasMethod } from "shared/Utils";
export abstract class GameObject<A, I extends Instance> extends BaseComponent<A, I> {
	private maid?: Maid;
	constructor() {
		super();
		if (hasMethod(this, "onDestroy") || hasMethod(this, "onRemove")) {
			if (!this.maid) this.maid = new Maid();
		} else {
			return;
		}

		if (hasMethod(this, "onRemove")) this.maid.GiveTask(() => (this as unknown as OnRemove)!.onRemove());
		if (hasMethod(this, "onDestroy"))
			this.maid.GiveTask(this.instance.Destroying.Connect(() => this.DestroyingEvent!()));
	}
	private DestroyingEvent(): void {
		try {
			(this as unknown as OnDestroy).onDestroy(); // Scuffed.
		} catch (err) {
			warn(`Failed to call onDestroy on ${this.instance.Name}`, err);
		}
	}

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
		this.Clean();
	}

	private Clean(): void {
		try {
			this.maid?.Destroy();
			this.StopCoroutines();
		} catch (err) {
			warn(`Failed to call onRemove on ${this.instance.Name}`, err);
		}
	}

	private Threads?: Map<Callback, thread>;
}

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
		(this as unknown as OnDestroy).onDestroy(); // Scuffed.
		this.DestroyingRBXScriptConnection?.Disconnect();
		this.DestroyingRBXScriptConnection = undefined;
	}
	protected OnRemoved(): void {}
	// Clarification: this method happens when a tag is removed from the object or when the object is destroyed.
	override destroy(): void {
		super.destroy(); // UNSURE which order to go by. I'll run the initial method first.
		this.OnRemoved?.();
		this.DestroyingRBXScriptConnection?.Disconnect();
		this.DestroyingRBXScriptConnection = undefined;
	}
	private DestroyingRBXScriptConnection?: RBXScriptConnection;
}

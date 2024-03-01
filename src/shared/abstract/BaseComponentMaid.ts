import { BaseComponent } from "@flamework/components";
import Maid from "@rbxts/maid";
export abstract class BaseComponentMaid<A = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
	public maid?: Maid = new Maid();

	// Clarification: this method happens when a tag is removed from the object or when the object is destroyed.
	override destroy(): void {
		super.destroy(); // UNSURE which order to go by. I'll run the initial method first.
		this.maid?.Destroy();
		this.maid = undefined;
	}
}

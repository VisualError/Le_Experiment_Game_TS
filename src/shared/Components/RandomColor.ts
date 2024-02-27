import { BaseComponent, Component } from "@flamework/components";
import { OnStart, OnTick } from "@flamework/core";
@Component({
	tag: "random.color",
})
export class RandomColor extends BaseComponent<{}, Part> implements OnTick, OnStart {
	constructor() {
		super();
		this.InitialColor = this.instance.BrickColor;
	}
	InitialColor: BrickColor;
	onStart(): void {
		print("start!!!!");
	}
	private lastFrame = 0;
	onTick(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 2) return;
		this.instance.BrickColor = BrickColor.random();
		this.lastFrame = 0;
	}
	destroy(): void {
		print("Destroy called!");
		super.destroy();
	}
}

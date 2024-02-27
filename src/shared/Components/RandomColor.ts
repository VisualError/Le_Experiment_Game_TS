import { Component } from "@flamework/components";
import { OnTick } from "@flamework/core";
import { OnDestroy } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
@Component({
	tag: "random.color",
})
export class RandomColor extends GameObject<{}, Part> implements OnTick, OnDestroy {
	constructor() {
		super();
		this.InitialColor = this.instance.BrickColor;
	}
	onDestroy(): void {
		const explosion = new Instance("Explosion");
		explosion.Position = this.instance.Position;
		explosion.Parent = game.Workspace;
	}
	protected onRemove(): void {
		this.instance.BrickColor = this.InitialColor;
	}
	private lastFrame = 0;
	onTick(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 2) return;
		this.instance.BrickColor = BrickColor.random();
		this.lastFrame = 0;
	}

	InitialColor: BrickColor;
}

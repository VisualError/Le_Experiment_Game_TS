import { Component } from "@flamework/components";
import { OnTick } from "@flamework/core";
import { OnDestroy, OnRemove } from "interfaces/CustomInterfaces";
import { Assign, CreateInstance } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
@Component({
	tag: "random.color",
})
export class RandomColor extends GameObject<{}, Part> implements OnTick, OnDestroy, OnRemove {
	constructor() {
		super();
		this.InitialColor = this.instance.BrickColor;
	}
	onDestroy(): void {
		CreateInstance("Explosion", {
			Position: this.instance.Position,
			Parent: game.Workspace,
		});
		print("component destroyed");
	}
	onRemove(): void {
		this.instance.BrickColor = this.InitialColor;
		print("component removed");
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

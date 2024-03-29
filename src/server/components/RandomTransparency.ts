import { Component } from "@flamework/components";
import { OnStart, OnTick } from "@flamework/core";
import { OnDestroy, OnRemove, OnTickSingle } from "interfaces/CustomInterfaces";
import { Assign } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
@Component({
	tag: "random.transparency",
})
export class RandomTransparency extends GameObject<{}, Part> implements OnTickSingle, OnStart, OnDestroy, OnRemove {
	constructor() {
		super();
		this.InitialTransparency = this.instance.Transparency;
	}
	onStart(): void {
		print("start!!!!");
	}
	onDestroy(): void {
		Assign(this.instance.Clone(), {
			Size: this.instance.Size.add(this.instance.Size),
			Parent: game.Workspace,
		});
	}
	onRemove(): void {
		this.instance.Transparency = this.InitialTransparency;
	}
	private lastFrame = 0;
	onTickSingle(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 2) return;
		this.instance.Transparency = math.random();
		this.lastFrame = 0;
	}

	InitialTransparency: number;
}

import { Component } from "@flamework/components";
import { OnStart, OnTick } from "@flamework/core";
import { OnDestroy } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
@Component({
	tag: "random.transparency",
})
export class RandomTransparency extends GameObject<{}, Part> implements OnTick, OnStart {
	constructor() {
		super();
		this.InitialTransparency = this.instance.Transparency;
	}
	InitialTransparency: number;
	onStart(): void {
		print("start!!!!");
	}
	protected OnRemoved(): void {
		this.instance.Transparency = this.InitialTransparency;
	}
	private lastFrame = 0;
	onTick(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 2) return;
		this.instance.Transparency = math.random();
		this.lastFrame = 0;
	}
}

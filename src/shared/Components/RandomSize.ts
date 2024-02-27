import { Component } from "@flamework/components";
import { OnPhysics, OnStart } from "@flamework/core";
import { GameObject } from "shared/abstract/GameObject";
const TweenService = game.GetService("TweenService");

interface TestAttributes {
	maxSize: number;
	minSize: number;
}

@Component({
	tag: "random.size",
	defaults: {
		maxSize: 10,
		minSize: 1,
	},
})
export class RandomColor extends GameObject<TestAttributes, Part> implements OnPhysics, OnStart {
	constructor() {
		super();
		this.InitialSize = this.instance.Size;
	}
	onStart(): void {
		this.attributes.maxSize = math.random(1, 20);
	}
	protected onRemove(): void {
		this.CurrentTween?.Cancel();
		this.CurrentTween = TweenService.Create(this.instance, this.newTweenInfo!, {
			Size: this.InitialSize,
		});
		this.CurrentTween.Play();
		this.CurrentTween.Completed.Connect(() => {
			this.CurrentTween = undefined;
			this.newTweenInfo = undefined;
		});
	}
	onPhysics(dt: number): void {
		this.lastFrame += dt;
		if (this.lastFrame < 2) return;
		this.ChangeSize(math.random(this.attributes.minSize, this.attributes.maxSize));
		this.lastFrame = 0;
	}
	private lastFrame = 0;

	ChangeSize(number: number): void {
		this.CurrentTween?.Cancel();
		this.CurrentTween = TweenService.Create(this.instance, this.newTweenInfo!, {
			Size: new Vector3(number, number, number),
		});
		this.CurrentTween.Play();
	}

	InitialSize: Vector3;
	CurrentTween?: Tween;
	newTweenInfo? = new TweenInfo(
		1, // Duration of the tween
		Enum.EasingStyle.Linear, // Easing style
		Enum.EasingDirection.InOut, // Easing direction
		0, // Number of times to repeat
		false, // Should the tween repeat?
		0, // Delay time
	);
}

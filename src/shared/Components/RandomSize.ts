import { Component } from "@flamework/components";
import { OnPhysics, OnStart } from "@flamework/core";
import { OnDestroy, OnRemove } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
const TweenService = game.GetService("TweenService");

interface TestAttributes {
	maxSize: number;
	minSize: number;
	initialSize: Vector3;
}

@Component({
	tag: "random.size",
	defaults: {
		maxSize: 10,
		minSize: 1,
		initialSize: new Vector3(),
	},
})
export class RandomColor extends GameObject<TestAttributes, Part> implements OnPhysics, OnStart, OnRemove {
	onStart(): void {
		this.attributes.maxSize = math.random(1, 20);
		this.attributes.initialSize = this.instance.Size;
	}
	onRemove(): void {
		this.CurrentTween?.Cancel();
		this.CurrentTween = TweenService.Create(this.instance, this.newTweenInfo!, {
			Size: this.attributes.initialSize,
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

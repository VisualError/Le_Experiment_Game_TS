import Component from "shared/AbstractClasses/ComponentAbstract";
import { Types, getFiltered } from "shared/Shapes";
const TweenService = game.GetService("TweenService");
class RandomSize extends Component {
	constructor(part: Part) {
		super(part as Instance);
		this.InitialSize = part.Size;
		this.Part = part;
		this.Start();
		this.TweenInfo = new TweenInfo();
	}
	InitialSize: Vector3;
	Part: Part;
	TweenInfo?: TweenInfo;
	Destroy(): void {
		this.CurrentTween?.Cancel();
		this.CurrentTween = TweenService.Create(
			this.Part,
			this.TweenInfo!,
			getFiltered(Types.getSphere(0, { Size: this.InitialSize, Anchored: false })),
		);
		this.CurrentTween.Play();
		this.CurrentTween.Completed.Connect(() => {
			this.CurrentTween = undefined;
			this.TweenInfo = undefined;
		});
		super.Destroy();
	}
	CurrentTween?: Tween;
	ChangeSize(number: number): void {
		print("changing size");
		this.CurrentTween?.Cancel();
		this.CurrentTween = TweenService.Create(
			this.Part,
			new TweenInfo(),
			getFiltered(Types.getSphere(number, { Anchored: false })),
		);
		this.CurrentTween.Play();
	}

	Start(): void {
		this.StartCoroutine(() => {
			while (!this.Dispose) {
				this.ChangeSize(math.random(100));
				task.wait(1);
			}
		}, "RandomSize");
	}
}
export = RandomSize;

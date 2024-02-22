import Component from "shared/AbstractClasses/ComponentAbstract";
/**
 * A component that changes the color of a part at random intervals.
 */
class RandomColor extends Component {
	/**
	 * Creates a new RandomColor component.
	 * @param part The part to change the color of.
	 */
	constructor(part: Part) {
		super(part as Instance);
		this.InitialColor = part.BrickColor;
		this.Part = part;
		this.Start();
	}
	InitialColor: BrickColor;
	Part: Part;
	Destroy(): void {
		this.Part.BrickColor = this.InitialColor;
		super.Destroy();
	}
	Start(): void {
		this.StartCoroutine(() => {
			while (!this.Dispose) {
				this.Part.BrickColor = BrickColor.random();
				task.wait(0.5);
			}
		}, "RandomColor");
	}
}

export = RandomColor;

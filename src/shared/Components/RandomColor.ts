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
		super(part);
		this.InitialColor = part.BrickColor;
		this.Part = part;
		this.Start();
	}
	InitialColor: BrickColor;
	Part: Part;
	Dispose(): void {
		print("dispos");
		this.Part.BrickColor = this.InitialColor;
		super.Dispose();
	}
	Start(): void {
		this.StartCoroutine(() => {
			while (!RandomColor.Disposed) {
				this.Part!.BrickColor = BrickColor.random();
				task.wait(0.5);
			}
		});
	}
}

export = RandomColor;

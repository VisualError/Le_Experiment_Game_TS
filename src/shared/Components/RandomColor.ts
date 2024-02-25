import Component from "shared/AbstractClasses/ComponentAbstract";
import RunserviceHandler from "shared/Classes/RunserviceHandler";
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
		this.Part.BrickColor = this.InitialColor;
		super.Dispose();
	}

	Update(): void {
		this.Part!.BrickColor = BrickColor.random();
	}
}

export = RandomColor;

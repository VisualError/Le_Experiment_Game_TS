import Component from "shared/AbstractClasses/ComponentAbstract";

class RandomTransparency extends Component {
	constructor(part: Part) {
		super(part as Instance);
		this.InitialTransparency = part.Transparency;
		this.Part = part;
		this.Start();
	}
	InitialTransparency: number;
	Part: Part;
	Destroy(): void {
		this.Part.Transparency = this.InitialTransparency;
		super.Dispose();
	}
	Start(): void {
		this.StartCoroutine(() => {
			while (!this.Dispose) {
				this.Part.Transparency = math.random();
				task.wait(0.5);
			}
		}, "RandomTransparency");
	}
}

export = RandomTransparency;

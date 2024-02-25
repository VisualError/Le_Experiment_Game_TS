import Component from "shared/AbstractClasses/ComponentAbstract";

class RandomTransparency extends Component {
	constructor(part: Part) {
		super(part);
		this.InitialTransparency = part.Transparency;
		this.Part = part;
		this.Start();
	}
	InitialTransparency: number;
	Part: Part;
	Dispose(): void {
		this.Part.Transparency = this.InitialTransparency;
		//super.Dispose();
	}
	Start(): void {
		this.StartCoroutine(() => {
			while (!RandomTransparency.Disposed) {
				this.Part.Transparency = math.random();
				task.wait(0.5);
			}
		});
	}
}

export = RandomTransparency;

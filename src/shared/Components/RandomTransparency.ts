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
		super.Dispose();
	}
	lastFrame = 0;
	Update(deltaTime: number): void {
		this.lastFrame += deltaTime;
		if (this.lastFrame >= 10) {
			this.Part.Transparency = math.random();
			this.lastFrame = 0;
		}
	}
}

export = RandomTransparency;

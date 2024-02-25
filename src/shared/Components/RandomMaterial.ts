import Component from "shared/AbstractClasses/ComponentAbstract";

class RandomMaterial extends Component {
	constructor(part: Part) {
		super(part);
		this.InitialMaterial = part.Material;
		this.Part = part;
		this.Start();
	}
	InitialMaterial: Enum.Material;
	Part: Part;
	Dispose(): void {
		this.Part.Material = this.InitialMaterial;
		super.Dispose();
	}
	static materials = Enum.Material.GetEnumItems();
	lastFrame = 0;
	Update(deltaTime: number): void {
		this.lastFrame += deltaTime;
		if (this.lastFrame >= 10) {
			const randomMat = RandomMaterial.materials[math.random(0, RandomMaterial.materials.size() - 1)];
			this.Part.Material = randomMat;
			this.lastFrame = 0;
		}
	}
}

export = RandomMaterial;

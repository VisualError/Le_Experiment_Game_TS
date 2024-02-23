import Component from "shared/AbstractClasses/ComponentAbstract";

class RandomMaterial extends Component {
	constructor(part: Part) {
		super(part as Instance);
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
	Start(): void {
		this.StartCoroutine(() => {
			while (!this.Disposed) {
				const materials = Enum.Material.GetEnumItems();
				const randomMat = materials[math.random(0, materials.size() - 1)];
				this.Part.Material = randomMat;
				task.wait(0.5);
			}
		}, "RandomMaterial");
	}
}

export = RandomMaterial;

import Component from "shared/AbstractClasses/ComponentAbstract";
import RandomColor from "./RandomColor";

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
	Start(): void {
		this.StartCoroutine(() => {
			while (!RandomColor.Disposed) {
				const materials = Enum.Material.GetEnumItems();
				const randomMat = materials[math.random(0, materials.size() - 1)];
				this.Part.Material = randomMat;
				task.wait(0.5);
			}
		});
	}
}

export = RandomMaterial;

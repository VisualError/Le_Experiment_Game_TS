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
	Update(): void {
		const materials = Enum.Material.GetEnumItems();
		const randomMat = materials[math.random(0, materials.size() - 1)];
		this.Part.Material = randomMat;
	}
}

export = RandomMaterial;

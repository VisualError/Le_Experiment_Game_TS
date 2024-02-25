import Class from "shared/AbstractClasses/ClassAbstract";
import { createSphere } from "shared/Shapes";
import { CreateInstance, InstanceProperties } from "shared/Utils";
class Sphere extends Class {
	constructor(radius: number = 1, additionalProps?: InstanceProperties["Part"]) {
		super();
		this.sphere = CreateInstance("Part", {
			Shape: Enum.PartType.Wedge,
			Size: new Vector3(math.random(1, 10), math.random(1, 10), math.random(1, 10)),
			Anchored: false,
			...additionalProps,
		}); //createSphere(radius, additionalProps);
	}
	Start(): void {
		for (let i = 0; i < 1000; i++) {
			const circle = new Sphere(5, {
				Parent: game.Workspace,
				Anchored: false,
				Position: new Vector3(0, 10 + i * 5 * 2, 0),
			});
			circle.sphere.AddTag("RandomMaterial");
			circle.sphere.AddTag("RandomColor");
			circle.sphere.AddTag("RandomSize");
			circle.sphere.AddTag("RandomTransparency");
		}
	}
	sphere: Part;
}

export = Sphere;

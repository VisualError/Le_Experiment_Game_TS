import Class from "shared/AbstractClasses/ClassAbstract";
import { createSphere } from "shared/Shapes";
import { InstanceProperties } from "shared/Utils";
class Sphere extends Class {
	constructor(radius: number = 1, additionalProps?: InstanceProperties["Part"]) {
		super();
		this.sphere = createSphere(radius, additionalProps);
	}
	Start(): void {
		for (let i = 0; i < 100; i++) {
			const circle = new Sphere(5, {
				Parent: game.Workspace,
				Anchored: false,
				Position: new Vector3(0, 10 + i * 5, 0),
			});
			circle.sphere.AddTag("RandomSize");
		}
	}
	sphere: Part;
}

export = Sphere;

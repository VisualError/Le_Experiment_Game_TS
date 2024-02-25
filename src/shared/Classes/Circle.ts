import Class from "shared/AbstractClasses/ClassAbstract";
import { createSphere } from "shared/Shapes";
import { InstanceProperties } from "shared/Utils";
class Circle extends Class {
	constructor(radius: number = 1, additionalProps?: InstanceProperties["Part"]) {
		super();
		this.circle = createSphere(radius, additionalProps);
	}
	Start(): void {
		for (let i = 0; i < 1000; i++) {
			const circle = new Circle(5, {
				Parent: game.Workspace,
				Anchored: false,
				Position: new Vector3(0, 10 + i, 0),
			});
			circle.circle.AddTag("RandomColor");
		}
	}
	circle: Part;
}

export = Circle;

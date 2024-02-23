import Class from "shared/AbstractClasses/ClassAbstract";
import { createSphere } from "shared/Shapes";
import { InstanceProperties } from "shared/Utils";
class Circle extends Class {
	constructor(radius: number = 1, additionalProps?: InstanceProperties["Part"]) {
		super();
		this.circle = createSphere(radius, additionalProps);
		print(this.circle);
	}
	Start(): void {
		const circle = new Circle(5, {
			Parent: game.Workspace,
			Anchored: false,
			Position: new Vector3(0, 10, 0),
		});
		circle.circle.AddTag("RandomSize");
	}
	circle: Part;
}

export = Circle;

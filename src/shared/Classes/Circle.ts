import Class from "shared/AbstractClasses/ClassAbstract";
import { createSphere, Types, getFiltered } from "shared/Shapes";
class Circle extends Class {
	constructor(radius: number = 1, additionalProps?: Partial<WritableInstanceProperties<CreatableInstances["Part"]>>) {
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

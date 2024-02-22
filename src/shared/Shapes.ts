import { CreateInstance } from "./Utils";

export function createSphere(
	radius: number = 1,
	additionalProps?: Partial<WritableInstanceProperties<CreatableInstances["Part"]>>,
) {
	// Merge default properties with additional properties
	const props = Types.getSphere(radius, additionalProps);

	return CreateInstance("Part", props);
}

export function getFiltered<T extends Partial<WritableInstanceProperties<CreatableInstances["Part"]>>>(
	props: T,
): ExcludeUnwantedProperties<T> {
	// Create a shallow copy of the props to avoid mutating the original object
	const filteredProps = { ...props };

	// Manually delete the unwanted properties
	delete filteredProps["Shape"];
	delete filteredProps["Name"];
	return filteredProps as ExcludeUnwantedProperties<T>; // Cast to the correct type
}
type ExcludeUnwantedProperties<T extends Partial<WritableInstanceProperties<CreatableInstances["Part"]>>> = Omit<
	T,
	"Shape" | "Name"
>;

export const Types = {
	getSphere: (
		radius: number,
		additionalProps?: Partial<WritableInstanceProperties<CreatableInstances["Part"]>>,
	): Partial<Part> => ({
		Shape: Enum.PartType.Ball,
		Size: new Vector3(radius, radius, radius),
		Anchored: true,
		CanCollide: true,
		...additionalProps,
	}),
	getCircle: (
		radius: number,
		additionalProps?: Partial<WritableInstanceProperties<CreatableInstances["Part"]>>,
	): Partial<Part> => ({
		Shape: Enum.PartType.Cylinder,
		Size: new Vector3(0.5, radius, radius),
		Anchored: true,
		CanCollide: true,
		...additionalProps,
	}),
};

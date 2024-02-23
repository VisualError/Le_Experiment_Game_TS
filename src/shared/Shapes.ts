import { CreateInstance, InstanceProperties } from "./Utils";

export function createSphere(radius: number = 1, additionalProps?: InstanceProperties["Part"]) {
	// Merge default properties with additional properties
	const props = Types.getSphere(radius, additionalProps);

	return CreateInstance("Part", props);
}

export function getFiltered<T extends InstanceProperties["Part"]>(props: T): ExcludeUnwantedProperties<T> {
	// Create a shallow copy of the props to avoid mutating the original object
	const filteredProps = { ...props };

	// Manually delete the unwanted properties
	delete filteredProps["Shape"];
	delete filteredProps["Name"];
	return filteredProps as ExcludeUnwantedProperties<T>; // Cast to the correct type
}
type ExcludeUnwantedProperties<T extends InstanceProperties["Part"]> = Omit<T, "Shape" | "Name">;

export const Types = {
	getSphere: (radius: number, additionalProps?: InstanceProperties["Part"]): InstanceProperties["Part"] => ({
		Shape: Enum.PartType.Ball,
		Size: new Vector3(radius, radius, radius),
		Anchored: true,
		CanCollide: true,
		...additionalProps,
	}),
	getCircle: (radius: number, additionalProps?: InstanceProperties["Part"]): InstanceProperties["Part"] => ({
		Shape: Enum.PartType.Cylinder,
		Size: new Vector3(0.5, radius, radius),
		Anchored: true,
		CanCollide: true,
		...additionalProps,
	}),
};

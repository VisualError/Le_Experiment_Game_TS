import Object from "@rbxts/object-utils";

export function CreateInstance<T extends keyof CreatableInstances>(
	className: T,
	props: InstanceProperties[T],
): CreatableInstances[T] {
	const newInstance = new Instance(className);
	// Here, you should pass the instance to Assign, not the class name
	Assign(newInstance, props);
	return newInstance as CreatableInstances[T];
}

// The Assign function should take an instance of a class that extends Instance,
// not a type parameter that extends keyof CreatableInstances.
export function Assign<T extends Instance>(instance: T, props: Partial<WritableInstanceProperties<T>>): T {
	for (const [k, v] of Object.entries(props)) {
		instance[k as never] = v as never;
	}
	return instance;
}

export type InstanceProperties = {
	[K in keyof CreatableInstances]: Partial<WritableInstanceProperties<CreatableInstances[K]>>;
};

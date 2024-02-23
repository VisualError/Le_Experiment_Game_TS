export function CreateInstance<T extends keyof CreatableInstances>(
	className: T,
	props: Partial<WritableInstanceProperties<CreatableInstances[T]>>,
): CreatableInstances[T] {
	const newInstance = new Instance(className);
	Assign(newInstance, props);
	return newInstance as CreatableInstances[T];
}
export function Assign<T extends Instance>(instance: T, props: Partial<T>): T {
	for (const [k, v] of pairs(props)) {
		instance[k as keyof T] = v as never;
	}
	return instance as T;
}
export type InstanceProperties = {
	[K in keyof CreatableInstances]: Partial<WritableInstanceProperties<CreatableInstances[K]>>;
};

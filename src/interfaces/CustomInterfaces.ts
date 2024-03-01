/**
 * An interface that defines a method for a component to be notified when its instance is destroyed.
 */
export interface OnDestroy {
	/**
	 * This function will be called when a components instance is destroyed.
	 *
	 * @hideinherited
	 */
	onDestroy(): void;
}
/**
 * An interface that defines a method for a component to be notified when it is removed from an instance.
 */
export interface OnRemove {
	/**
	 * This function will be called when a component is removed from an instance.
	 *
	 * @hideinherited
	 */
	onRemove(): void;
}

export interface OnTickSingle {
	onTickSingle(dt: number): void;
}

export interface OnPhysicsSingle {
	onPhysicsSingle(dt: number): void;
}

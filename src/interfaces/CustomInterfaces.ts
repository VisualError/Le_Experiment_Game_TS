export interface OnDestroy {
	/**
	 * This function will be called when a components instance is destroyed.
	 *
	 * @hideinherited
	 */
	onDestroy(): void;
}

export interface OnRemove {
	/**
	 * This function will be called when a component is removed from an instance.
	 *
	 * @hideinherited
	 */
	onRemove(): void;
}

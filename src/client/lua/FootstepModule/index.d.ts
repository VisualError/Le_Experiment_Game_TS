interface FootstepModule {}

interface FootstepModuleConstructor {
	new (): FootstepModule;
	CreateSoundGroup(
		parent?: Instance,
		name?: string,
		soundProperties?: Array<string>,
		isFolder?: boolean,
	): SoundGroup | Folder;
	GetTableFromMaterial(EnumItem: Enum.Material | string): Array<string>;
	GetRandomSound(SoundTable: Array<string>): string;
	PreloadFolder(Group: Folder | SoundGroup): void;
	buzbee(): void;
}

declare const FootstepModule: FootstepModuleConstructor;
export = FootstepModule;

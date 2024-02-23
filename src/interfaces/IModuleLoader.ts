import { IClass } from "./IClass";

/**
 * Interface for a class that can load modules.
 */
export interface IModuleLoader extends IClass {
	/**
	 * Loads the components from the given ModuleScripts.
	 * @param ModuleScripts the ModuleScripts to load from
	 */
	/**
	 * Initializes classes from a list of module scripts.
	 * @param scripts - The list of module scripts.
	 */
	Init(scripts: ModuleScript[]): void;

	LoadModule<T>(script: ModuleScript): T;

	LoadModules(scripts: ModuleScript[]): void;
}

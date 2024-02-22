import { IClass } from "interfaces/IClass";
import { IModuleLoader } from "interfaces/IModuleLoader";
import CacheHandler from "shared/Classes/CacheHandler";

abstract class ModuleLoaderAbstract implements IModuleLoader {
	constructor(public cacheHandler: CacheHandler<unknown>) {}
	LoadClass<T>(ModuleScript: ModuleScript): T {
		throw "Requires implementation";
	}
	LoadClasses(ModuleScripts: ModuleScript[]): void {
		for (const ModuleScript of ModuleScripts) {
			if (!ModuleScript.IsA("ModuleScript")) continue;
			try {
				const mod = this.LoadClass(ModuleScript);
				print(`${ModuleScript.Name} has been loaded!`);
			} catch (error) {
				warn(`Failed to load ${ModuleScript.Name}: ${error}`);
			}
		}
	}

	GetModule(name: string) {
		throw "NOT IMPLEMENTED";
	}
	Init(ModuleScripts: ModuleScript[]): void {
		this.LoadClasses(ModuleScripts);
	}
	Start(): void {
		for (const [_, value] of this.cacheHandler.entries()) {
			print(`Starting ${value}`);
			try {
				(value as IClass)?.Start();
			} catch (e) {
				warn(`Failed to start ${value}: ${e}`);
			}
		}
	}
}

// /**
//  * Get a class by name from the cache.
//  *
//  * @param name - The name of the class to retrieve.
//  * @returns The class with the specified name, or undefined if the class was not found.
//  */
// function GetClassByName(name: string): IClass | undefined {
//     const callerInfo = debug.info(3, "s");
//     if (!.Classes.has(name)) {
//       warn(`${callerInfo} tried to get nil module: ${name}`);
//     }
//     return Cached.Classes.get(name);
// }

export = ModuleLoaderAbstract;

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
				print(`${ModuleScript.Name} (${mod}) has been loaded!`);
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

export = ModuleLoaderAbstract;

import { IClass } from "interfaces/IClass";
import { IModuleLoader } from "interfaces/IModuleLoader";
import CacheHandler from "shared/Classes/CacheHandler";

abstract class ModuleLoaderAbstract implements IModuleLoader {
	constructor(public cacheHandler: CacheHandler) {}
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
		print(this.cacheHandler);
	}
	GetModule<T>(name: string): T | undefined {
		// Assuming CacheHandler has a method get(key: string) that retrieves a value by key
		return this.cacheHandler.get(name) as T | undefined;
	}
	Init(ModuleScripts: ModuleScript[]): void {
		this.LoadClasses(ModuleScripts);
	}
	Start(): void {
		for (const [_, value] of this.cacheHandler.entries()) {
			print(`Starting: ${value}`);
			try {
				(value as IClass)?.Start();
			} catch (e) {
				warn(`Failed to start ${value}: ${e}`);
			}
		}
	}
}

export = ModuleLoaderAbstract;

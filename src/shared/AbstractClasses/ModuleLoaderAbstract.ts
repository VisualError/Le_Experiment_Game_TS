import { IClass } from "interfaces/IClass";
import { IModuleLoader } from "interfaces/IModuleLoader";
import CacheHandler from "shared/Classes/CacheHandler";

abstract class ModuleLoaderAbstract implements IModuleLoader {
	constructor(public cacheHandler: CacheHandler) {}
	LoadModule<T>(ModuleScript: ModuleScript): T {
		throw "Requires implementation";
	}
	LoadModules<T>(ModuleScripts: ModuleScript[]): void {
		for (const ModuleScript of ModuleScripts) {
			if (!ModuleScript.IsA("ModuleScript")) continue;
			try {
				this.LoadModule<T>(ModuleScript);
			} catch (error) {
				warn(`Failed to load ${ModuleScript.Name}: ${error}`);
			}
		}
		print(this.cacheHandler);
	}
	GetModule<T>(name: string): { new (): T } | undefined {
		// Assuming CacheHandler has a method get(key: string) that retrieves a value by key
		return this.cacheHandler.get(name) as { new (): T } | undefined;
	}

	GetModuleAsType<T>(ModuleScript: ModuleScript): { new (...args: unknown[]): T } {
		return require(ModuleScript) as { new (...args: unknown[]): T };
	}

	Init<T>(ModuleScripts: ModuleScript[]): void {
		this.LoadModules<T>(ModuleScripts);
	}
	Start(): void {
		for (const [index, value] of this.cacheHandler.entries()) {
			print(`Starting: ${index} (${value})`);
			try {
				(value as IClass)?.Start();
			} catch (e) {
				warn(`Failed to start ${index} (${value}): ${e}`);
			}
		}
	}
}

export = ModuleLoaderAbstract;

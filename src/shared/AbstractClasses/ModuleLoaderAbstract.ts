import { IClass } from "interfaces/IClass";
import { IModuleLoader } from "interfaces/IModuleLoader";

abstract class ModuleLoaderAbstract implements IModuleLoader {
	cache = new Map<unknown, unknown>();
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
	}
	GetModule<T>(name: string): { new (): T } | undefined {
		// Assuming CacheHandler has a method get(key: string) that retrieves a value by key
		return this.cache.get(name) as { new (): T } | undefined;
	}

	GetModuleAsType<T>(ModuleScript: ModuleScript): { new (...args: unknown[]): T } {
		return require(ModuleScript) as { new (...args: unknown[]): T };
	}

	Init<T>(ModuleScripts: ModuleScript[]): void {
		this.LoadModules<T>(ModuleScripts);
	}
	Start(): void {
		for (const [index, value] of this.cache) {
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

import ModuleLoaderAbstract from "./AbstractClasses/ModuleLoaderAbstract";

class ModuleLoader extends ModuleLoaderAbstract {
	Init(scripts: ModuleScript[]): void {
		print(`[Main Module Loader]: Found ${scripts.size()} Files..`);
		super.Init(scripts);
	}
	LoadClass<T>(ModuleScript: ModuleScript): T {
		const mod = require(ModuleScript) as T;
		this.cacheHandler.set(ModuleScript.Name, mod);
		return mod;
	}
	Start(): void {
		print(`[Main Module Loader]: Starting ${this.cacheHandler.size} modules..`);
		super.Start();
	}
}

export = ModuleLoader;

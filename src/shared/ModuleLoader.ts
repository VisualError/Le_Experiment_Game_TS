import { IClass } from "interfaces/IClass";
import { IModuleLoader } from "interfaces/IModuleLoader";
import ModuleLoaderAbstract from "./AbstractClasses/ModuleLoaderAbstract";

class ModuleLoader extends ModuleLoaderAbstract {
	Init(scripts: ModuleScript[]): void {
		print(`[Main Module Loader]: Loading ${scripts.size()} Modules..`);
		super.Init(scripts);
	}
	LoadClass<T>(ModuleScript: ModuleScript): T {
		const mod = require(ModuleScript) as T;
		this.cacheHandler.set(ModuleScript.Name, mod);
		return mod;
	}
}

export = ModuleLoader;

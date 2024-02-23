import ModuleLoaderAbstract from "./AbstractClasses/ModuleLoaderAbstract";

class ClassLoader extends ModuleLoaderAbstract {
	Init(scripts: ModuleScript[]): void {
		print(`[Main Module Loader]: Found ${scripts.size()} Files..`);
		super.Init<ModuleScript>(scripts);
	}
	LoadModule<T>(ModuleScript: ModuleScript): T {
		const mod = require(ModuleScript) as { new (): T };
		const loaded = new mod();
		print(mod, loaded);
		this.cacheHandler.set(ModuleScript.Name, mod);
		return loaded;
	}
	Start(): void {
		print(`[Main Module Loader]: Starting ${this.cacheHandler.size} modules..`);
		super.Start();
	}
}

export = ClassLoader;

/* eslint-disable no-inner-declarations */
import ModuleLoaderAbstract from "shared/AbstractClasses/ModuleLoaderAbstract";
import Component from "shared/Classes/Component";
import CacheHandler from "./CacheHandler";
const CollectionService = game.GetService("CollectionService");

class ComponentHandler extends ModuleLoaderAbstract {
	Start(): void {
		this.cacheHandler = new CacheHandler();
		this.cacheHandler.setCache(new Map<string, Component>());
		super.Init<Component>(script.Parent?.Parent?.FindFirstChild("Components")?.GetChildren() as ModuleScript[]);
	}
	LoadModule<T>(ModuleScript: ModuleScript): T {
		print(`Loading ${ModuleScript.Name} Component`);
		const componentTag = getTag(ModuleScript);
		const ComponentModule = this.GetModuleAsType<Component>(ModuleScript);

		/**
		 * Adds a component to the given instance.
		 * @param instance the instance to add the component to
		 */
		const ComponentAdded = (instance: Instance): void => {
			const component = new ComponentModule(instance);
			const map = new Map<string, Component>();
			if (!this.cacheHandler.has(instance)) {
				this.cacheHandler.set(instance, map);
			}
			(this.cacheHandler.get(instance) as Map<string, Component>)?.set(componentTag, component);
			print(this.cacheHandler);
		};
		/**
		 * Removes a component from the given instance.
		 * @param instance the instance to remove the component from
		 */
		const ComponentRemoved = (instance: Instance): void => {
			const CachedInstance = this.cacheHandler.get(instance) as Map<string, Component>;
			if (CachedInstance) {
				CachedInstance.get(componentTag)?.Dispose();
				CachedInstance.delete(componentTag);
				if (CachedInstance.size() === 0) {
					this.cacheHandler.delete(instance);
				}
			}
		};
		for (const existing of CollectionService.GetTagged(componentTag)) {
			ComponentAdded(existing);
		}
		CollectionService.GetInstanceAddedSignal(componentTag).Connect(ComponentAdded);
		CollectionService.GetInstanceRemovedSignal(componentTag).Connect(ComponentRemoved);
		return ComponentModule as T;
	}
}

/**
 * Gets the tag for the given ModuleScript.
 * @param module the ModuleScript to get the tag for
 */
function getTag(module: ModuleScript) {
	return module.Name;
}

export = ComponentHandler;

/* eslint-disable no-inner-declarations */
import ModuleLoaderAbstract from "shared/AbstractClasses/ModuleLoaderAbstract";
import Component from "shared/Classes/Component";
const CollectionService = game.GetService("CollectionService");

class ComponentHandler extends ModuleLoaderAbstract {
	cache = new Map<Instance, Map<string, Component>>();
	Start(): void {
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
			if (!this.cache.has(instance)) {
				this.cache.set(instance, map);
			}
			this.cache.get(instance)?.set(componentTag, component);
			print(this.cache);
		};
		/**
		 * Removes a component from the given instance.
		 * @param instance the instance to remove the component from
		 */
		const ComponentRemoved = (instance: Instance): void => {
			const CachedInstance = this.cache.get(instance);
			if (CachedInstance) {
				CachedInstance.get(componentTag)?.Dispose();
				CachedInstance.delete(componentTag);
				if (CachedInstance.size() === 0) {
					this.cache.delete(instance);
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

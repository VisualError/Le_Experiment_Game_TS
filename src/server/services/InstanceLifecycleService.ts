import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { OnDestroy } from "interfaces/CustomInterfaces";
import { getComponentAs } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
@Service()
export class InstanceLifecycleService implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnDestroy>(SubscribeToInstanceRemoved); // No need for onListenerRemoved since the maid handles that already.
		Modding.onListenerRemoved<OnDestroy>(UnsubscribeFromInstanceRemoved);
	}
}

function SubscribeToInstanceRemoved(component: OnDestroy) {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid(); // In roblox lua, this maid will still be created even when the class doesn't have it.
	gameObject.maid.GiveTask(instance.Destroying.Connect(() => component.onDestroy()));
}

function UnsubscribeFromInstanceRemoved(component: OnDestroy) {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
	if (!instance || !gameObject || !gameObject.maid) return; // If maid doesn't exist. Then this component has already been disposed of.
	gameObject.maid.Destroy();
	gameObject.maid = undefined;
}

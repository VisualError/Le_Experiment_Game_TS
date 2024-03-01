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

function SubscribeToInstanceRemoved(listener: OnDestroy) {
	const gameObject = getComponentAs<GameObject>(listener);
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid(); // In roblox lua, this maid will still be created even when the class doesn't have it.
	gameObject.maid.GiveTask(instance.Destroying.Connect(() => listener.onDestroy()));
}

function UnsubscribeFromInstanceRemoved(listener: OnDestroy) {
	const gameObject = getComponentAs<GameObject>(listener);
	const instance = gameObject.instance;
	if (!instance || !gameObject || !gameObject.maid) return; // If maid doesn't exist. Then this component has already been disposed of.
	gameObject.maid.Destroy();
	gameObject.maid = undefined;
}

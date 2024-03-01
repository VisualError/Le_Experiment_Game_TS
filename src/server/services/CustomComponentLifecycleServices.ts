import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { OnPhysicsSingle, OnRemove, OnTickSingle } from "interfaces/CustomInterfaces";
import { getComponentAs } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
@Service()
export class CustomComponentLifecycleServices implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnRemove>(SubscribeRemove);
		Modding.onListenerRemoved<OnRemove>(UnsubscribeRemove);

		Modding.onListenerAdded<OnTickSingle>(SubscribeTickSingle);
		Modding.onListenerRemoved<OnTickSingle>(UnsubscribeTickSingle);

		Modding.onListenerAdded<OnPhysicsSingle>(SubscribePhysicsSingle);
		Modding.onListenerRemoved<OnPhysicsSingle>(UnsubscribePhysicsSingle);
	}
}

//#region OnPhysicsSingle
function SubscribePhysicsSingle(component: OnPhysicsSingle): void {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
}
function UnsubscribePhysicsSingle(component: OnPhysicsSingle): void {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
}
//#endregion

//#region OnTickSingle
function SubscribeTickSingle(component: OnTickSingle): void {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
}
function UnsubscribeTickSingle(component: OnTickSingle): void {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
}
//#endregion

//#region onRemove
function SubscribeRemove(component: OnRemove) {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid(); // In roblox lua, this maid will still be created even when the class doesn't have it.
	gameObject.maid.GiveTask(() => component.onRemove());
}
function UnsubscribeRemove(component: OnRemove) {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
	if (!instance || !gameObject || !gameObject.maid) return; // If maid doesn't exist. Then this component has already been disposed of.
	gameObject.maid.Destroy();
	gameObject.maid = undefined;
}
//#endregion

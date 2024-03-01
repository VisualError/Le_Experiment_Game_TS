import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { RunService } from "@rbxts/services";
import { OnPhysicsSingle, OnRemove, OnTickSingle } from "interfaces/CustomInterfaces";
import { getComponentAs } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
const TickSingle = new Set<OnTickSingle>();
const PhysicsSingle = new Set<OnPhysicsSingle>();
@Service()
export class CustomComponentLifecycleServices implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnRemove>(SubscribeRemove);
		Modding.onListenerRemoved<OnRemove>(UnsubscribeRemove);

		Modding.onListenerAdded<OnTickSingle>(SubscribeTickSingle);
		Modding.onListenerRemoved<OnTickSingle>(UnsubscribeTickSingle);

		Modding.onListenerAdded<OnPhysicsSingle>(SubscribePhysicsSingle);
		Modding.onListenerRemoved<OnPhysicsSingle>(UnsubscribePhysicsSingle);

		RunService.Heartbeat.Connect((dt) => {
			TickSingle.forEach((func) => func.onTickSingle(dt));
		});
		RunService.PreSimulation.Connect((dt) => {
			PhysicsSingle.forEach((func) => func.onPhysicsSingle(dt));
		});
	}
}

//#region OnPhysicsSingle
function SubscribePhysicsSingle(component: OnPhysicsSingle): void {
	PhysicsSingle.add(component);
}
function UnsubscribePhysicsSingle(component: OnPhysicsSingle): void {
	PhysicsSingle.delete(component);
}
//#endregion

//#region OnTickSingle
function SubscribeTickSingle(component: OnTickSingle): void {
	TickSingle.add(component);
}
function UnsubscribeTickSingle(component: OnTickSingle): void {
	TickSingle.delete(component);
}
//#endregion

//#region onRemove
function SubscribeRemove(component: OnRemove) {
	const gameObject = getComponentAs<GameObject>(component);
	const instance = gameObject.instance;
	if (!instance || !gameObject || !gameObject.maid) return;
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

import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { OnDestroy } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
@Service()
export class InstanceLifecycleService implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnDestroy>(SubscribeToInstanceRemoved); // No need for onListenerRemoved since the maid handles that already.
	}
}

function SubscribeToInstanceRemoved(listener: OnDestroy) {
	const gameObject = listener as unknown as GameObject; // TODO: Find a better way to do this. I don't like how unkown casting looks ;c.
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid();
	gameObject.maid.GiveTask(instance.Destroying.Connect(() => listener.onDestroy()));
}

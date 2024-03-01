import { BaseComponent } from "@flamework/components";
import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { OnRemove } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
@Service()
export class CustomComponentLifecycleServices implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnRemove>(Subscribe);
	}
}

function Subscribe(listener: OnRemove) {
	const gameObject = listener as unknown as GameObject; // TODO: Find a better way to do this. I don't like how unkown casting looks ;c.
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid();
	gameObject.maid.GiveTask(() => listener.onRemove());
}

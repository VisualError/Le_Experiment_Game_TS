import { BaseComponent } from "@flamework/components";
import { Service, OnStart, Modding } from "@flamework/core";
import Maid from "@rbxts/maid";
import { OnRemove } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";
@Service()
export class CustomComponentLifecycleServices implements OnStart {
	onStart() {
		Modding.onListenerAdded<OnRemove>(Subscribe);
		Modding.onListenerRemoved<OnRemove>(Unsubscribe);
	}
}

function Subscribe(listener: OnRemove) {
	const gameObject = listener as unknown as GameObject; // TODO: Find a better way to do this. I don't like how unkown casting looks ;c.
	const instance = gameObject.instance;
	if (!instance || !gameObject) return;
	if (!gameObject.maid) gameObject.maid = new Maid(); // In roblox lua, this maid will still be created even when the class doesn't have it.
	gameObject.maid.GiveTask(() => listener.onRemove());
}

function Unsubscribe(listener: OnRemove) {
	const gameObject = listener as unknown as GameObject; // TODO: Find a better way to do this. I don't like how unkown casting looks ;c.
	const instance = gameObject.instance;
	if (!instance || !gameObject || !gameObject.maid) return; // If maid doesn't exist. Then this component has already been disposed of.
	gameObject.maid.Destroy();
	gameObject.maid = undefined;
}

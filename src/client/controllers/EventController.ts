import { Controller, OnStart } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Players } from "@rbxts/services";

@Controller()
export class EventController implements OnStart {
	constructor() {}
	maid = new Maid();

	onStart(): void {
		// Maid will commit sudoku when player disconnects.
		this.maid.GiveTask(
			Players.PlayerRemoving.Connect((player: Player) => {
				if (player === Players.LocalPlayer) {
					this.maid.Destroy();
				}
			}),
		);
	}
}

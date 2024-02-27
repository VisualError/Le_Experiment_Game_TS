import { Service, OnStart, Modding } from "@flamework/core";
const Players = game.GetService("Players");

export interface OnPlayerJoined {
	onPlayerJoined(player: Player): void;
}

@Service()
export class MyService implements OnStart {
	onStart() {
		const listeners = new Set<OnPlayerJoined>();

		// Automatically updates the listeners set whenever a listener is added or removed.
		// You can do more than just keeping track of a set,
		// e.g fire the new listener's event for all existing players.
		Modding.onListenerAdded<OnPlayerJoined>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnPlayerJoined>((object) => listeners.delete(object));

		Players.PlayerAdded.Connect((player) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerJoined(player));
			}
		});

		for (const player of Players.GetPlayers()) {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerJoined(player));
			}
		}
	}
}

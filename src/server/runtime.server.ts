import { Flamework } from "@flamework/core";
import { Players } from "@rbxts/services";
import { CreateInstance } from "shared/Utils";

Flamework.addPaths("src/server/components");
Flamework.addPaths("src/shared/components");
Flamework.addPaths("src/server/services");
Flamework.ignite();

// Funny
task.wait(1);
for (let i = 0; i < 4; i++) {
	const sphere = CreateInstance("Part", {
		Shape: Enum.PartType.Wedge,
		Size: new Vector3(1, 1, 1),
		Anchored: false,
		Parent: game.Workspace,
		Position: new Vector3(0, i * math.pi, 0),
		CanTouch: false,
		CanQuery: false,
		CastShadow: false,
	});
	sphere.AddTag("random.size");
}

Players.PlayerAdded.Connect(function (Player: Player) {
	Player.CharacterAdded.Connect(CharacterAdded);
});

function CharacterAdded(Character: Model) {
	const Humanoid = Character.FindFirstChildOfClass("Humanoid");
	Humanoid?.Touched.Connect(function (Touched) {
		if (Touched.HasTag("death") && !(Humanoid.Health <= 0)) {
			Humanoid.Health = 0;
		}
	});
}

for (const Player of Players.GetPlayers()) {
	Player.CharacterAdded.Connect(CharacterAdded);
}

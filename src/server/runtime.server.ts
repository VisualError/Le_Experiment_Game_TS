import { Flamework } from "@flamework/core";
import { Players } from "@rbxts/services";
import { CreateInstance } from "shared/Utils";

Flamework.addPaths("src/shared/components");
Flamework.addPaths("src/server/services");
Flamework.ignite();

// Funny
task.wait(1);
for (let i = 0; i < 10; i++) {
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
	sphere.AddTag("random.color");
}

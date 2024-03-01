import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { assign } from "@rbxts/object-utils";
import { Workspace } from "@rbxts/services";
import { Assign, CreateInstance } from "shared/Utils";
import { GameObject } from "shared/abstract/GameObject";
@Component({
	tag: "grabbable.object",
})
// TODO: clean up code, and add a handler for inventory, ect ect.
export class GrabbableObjectServer extends GameObject<{}, Part> implements OnStart {
	onStart(): void {
		let clickDetector = this.instance.FindFirstChildWhichIsA("ClickDetector");
		if (!clickDetector) {
			clickDetector = CreateInstance("ClickDetector", {
				Parent: this.instance,
			});
		}
		print("successfuly started on server!");
		this.maid!.GiveTask(clickDetector.MouseClick.Connect((plr) => this.HandleClicks(plr)));
	}

	HandleClicks(player: Player): void {
		const Tool = CreateInstance("Tool", { Parent: Workspace });
		const corner = this.instance.CFrame.mul(new CFrame(this.instance.Size.mul(0.5)));
		const edge = corner.Position.div(new Vector3(2, 2, 1));
		const Handle = CreateInstance("Part", {
			Parent: Tool,
			Name: "Handle",
			Size: new Vector3(1, 1, 1),
			CFrame: new CFrame(edge),
		});
		const WeldConstraint = CreateInstance("WeldConstraint", {
			Parent: Handle,
			Part0: Handle,
			Part1: this.instance,
		});
		const PlayerBackpack = player.FindFirstChildOfClass("Backpack");
		if (!PlayerBackpack) return;
		this.instance.Parent = Tool;
		this.instance.Anchored = false;
		Tool.Parent = PlayerBackpack;
		this.maid?.GiveTask(
			Tool.Unequipped.Connect(() => {
				this.instance.CanCollide = true;
				this.instance.Massless = false;
			}),
		);
		this.maid?.GiveTask(
			Tool.Equipped.Connect(() => {
				this.instance.CanCollide = false;
				this.instance.Massless = true;
			}),
		);
	}
}

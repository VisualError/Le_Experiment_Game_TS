import { Controller, OnStart } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Players, RunService, Workspace } from "@rbxts/services";
import Spring from "@rbxts/spring";

@Controller()
export class CameraController implements OnStart {
	maid = new Maid();
	spring?: Spring<Vector3>;
	onStart(): void {
		this.maid.GiveTask(RunService.Heartbeat.Connect((dt) => this.Connection(dt)));
	}
	Connection(dt: number): void {
		const head = Players.LocalPlayer.Character?.FindFirstChild("Head") as Part;
		if (head) {
			const goal = head.Position;
			if (!this.spring) this.spring = new Spring(goal);
			this.spring.goal = goal.add(new Vector3(0, 0, 5));
			this.spring.update(dt);
			if (Workspace.CurrentCamera) {
				Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
				Workspace.CurrentCamera.CFrame = new CFrame(this.spring.position);
			}
		}
	}
}

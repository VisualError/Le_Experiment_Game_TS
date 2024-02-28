import { Controller, OnStart } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Players, RunService, Workspace, UserInputService } from "@rbxts/services";
import Spring from "@rbxts/spring";

@Controller()
export class CameraController implements OnStart {
	maid = new Maid();
	spring?: Spring<Vector3>;
	isRightMouseDown = false; // Track if the right mouse button is down
	oldMousePos?: Vector3; // Track the previous mouse position
	cameraOffset = new Vector3(0, 0, 5); // Initial camera offset
	private static target?: BasePart;
	private static dampening = 0.8;
	private accumulatedHorizontalAngle = 0;
	private accumulatedVerticalAngle = 0;
	private currentIndex = 0;

	onStart(): void {
		this.maid.GiveTask(RunService.RenderStepped.Connect((dt) => this.Connection(dt)));
		// Listen for right-click to start orbiting
		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				if (input.UserInputType === Enum.UserInputType.MouseButton2) {
					this.isRightMouseDown = true; // Right mouse button is down
					this.oldMousePos = input.Position;
				}
				if (input.UserInputType === Enum.UserInputType.Keyboard) {
					if (input.KeyCode === Enum.KeyCode.E) {
						const children = game.Workspace.GetDescendants();
						if (this.currentIndex >= children.size()) {
							// Reset the index to 0 if it exceeds the array length
							this.currentIndex = 0;
							CameraController.setTarget(Players.LocalPlayer.Character?.PrimaryPart);
							return;
						} else {
							this.currentIndex++;
						}
						let randomChild = children[this.currentIndex];
						while (!randomChild || !randomChild.IsA("Part")) {
							this.currentIndex++;
							if (this.currentIndex >= children.size()) {
								// Reset the index to 0 if it exceeds the array length
								this.currentIndex = 0;
								CameraController.setTarget(Players.LocalPlayer.Character?.PrimaryPart);
								return;
							}
							randomChild = children[this.currentIndex];
						}
						if (randomChild.IsA("BasePart")) CameraController.setTarget(randomChild as BasePart);
						print(CameraController.target);
					}
				}
			}),
		);

		this.maid.GiveTask(
			UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				if (input.UserInputType === Enum.UserInputType.MouseButton2) {
					this.isRightMouseDown = false; // Right mouse button is up
					this.oldMousePos = undefined;
				}
			}),
		);

		// Listen for mouse wheel scroll to change camera offset
		this.maid.GiveTask(
			UserInputService.InputChanged.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				switch (input.UserInputType) {
					case Enum.UserInputType.MouseWheel:
						this.cameraOffset = this.cameraOffset.add(new Vector3(0, 0, -input.Position.Z * 2));
						this.cameraOffset = new Vector3(
							this.cameraOffset.X,
							this.cameraOffset.Y,
							math.clamp(this.cameraOffset.Z, 0, 40),
						);
						break;
					case Enum.UserInputType.MouseMovement:
						const newMousePos = input.Position;
						if (this.oldMousePos) {
							const delta = newMousePos.sub(this.oldMousePos);
							this.oldMousePos = newMousePos; // Update oldMousePos for the next delta calculation
							if (CameraController.target) {
								// Accumulate the rotation angles
								const mouseSensitivity = UserSettings().GetService("UserGameSettings").MouseSensitivity;
								this.accumulatedHorizontalAngle += delta.X * mouseSensitivity;
								this.accumulatedVerticalAngle += delta.Y * mouseSensitivity;

								// Clamp the accumulated vertical angle to prevent the camera from turning upside down
								// This example clamps the vertical angle between -80 and 80 degrees
								this.accumulatedVerticalAngle = math.clamp(this.accumulatedVerticalAngle, -80, 80);
							}
						}
						break;
				}
			}),
		);

		this.maid.GiveTask(
			Players.LocalPlayer.CharacterAdded.Connect((character) => {
				CameraController.setTarget(character.PrimaryPart);
			}),
		);

		// Maid will commit sudoku when player disconnects.
		this.maid.GiveTask(
			Players.PlayerRemoving.Connect((player: Player) => {
				if (player === Players.LocalPlayer) {
					this.maid.Destroy();
				}
			}),
		);
	}

	static setTarget<T extends BasePart>(target?: T): void {
		if (!target) this.target = undefined;
		this.target = target;
	}

	static setDampening(number: number): void {
		this.dampening = number;
	}

	Connection(dt: number): void {
		if (!CameraController.target && Players.LocalPlayer.Character?.PrimaryPart)
			CameraController.setTarget(Players.LocalPlayer.Character.PrimaryPart);
		if (CameraController.target) {
			const goal = CameraController.target.Position.add(this.cameraOffset); // Apply the camera offset
			if (!this.spring) this.spring = new Spring(goal, undefined, goal, CameraController.dampening);
			this.spring.goal = goal;
			this.spring.update(dt);
			if (Workspace.CurrentCamera) {
				Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
				// Calculate the rotation CFrame based on the accumulated rotation angles
				const rotationCFrame = new CFrame()
					.mul(CFrame.Angles(0, math.rad(this.accumulatedHorizontalAngle), 0))
					.mul(CFrame.Angles(math.rad(this.accumulatedVerticalAngle), 0, 0));
				// Apply the rotation CFrame to the camera's position
				Workspace.CurrentCamera.CFrame = rotationCFrame
					.mul(new CFrame(this.spring.position).sub(CameraController.target.Position))
					.add(CameraController.target.Position);
			}
		}
	}
}

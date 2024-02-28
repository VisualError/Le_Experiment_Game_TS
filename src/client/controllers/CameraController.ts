import { Controller, OnStart } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Players, RunService, Workspace, UserInputService } from "@rbxts/services";
import Spring from "@rbxts/spring";

type PositionProvider = {
	getPosition(): Vector3;
	instance: Instance;
};

class BasePartPositionProvider implements PositionProvider {
	constructor(private basePart: BasePart) {
		this.instance = basePart;
	}
	getPosition(): Vector3 {
		return this.basePart.Position;
	}
	instance: Instance;
}

class PlayerPositionProvider implements PositionProvider {
	constructor(private player: Player) {
		this.instance = player;
	}
	instance: Instance;

	getPosition(): Vector3 {
		return this.player.Character?.PrimaryPart?.Position || new Vector3();
	}
}

class ModelPositionProvider implements PositionProvider {
	constructor(private model: Model) {
		this.instance = model;
	}
	instance: Instance;

	getPosition(): Vector3 {
		return this.model.PrimaryPart?.Position || new Vector3();
	}
}

@Controller()
export class CameraController implements OnStart {
	maid = new Maid();
	spring?: Spring<Vector3>;
	isRightMouseDown = false; // Track if the right mouse button is down
	oldMousePos?: Vector3; // Track the previous mouse position
	cameraOffset = new Vector3(0, 0, 5); // Initial camera offset
	private static target?: PositionProvider;
	private static dampening = 0.8;
	private static isFirstPerson = false;
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
							CameraController.setTarget(Players.LocalPlayer);
							return;
						} else {
							this.currentIndex++;
						}
						let randomChild = children[this.currentIndex];
						print(randomChild);
						while (!randomChild || !CameraController.setTarget(randomChild)) {
							this.currentIndex++;
							if (this.currentIndex >= children.size()) {
								// Reset the index to 0 if it exceeds the array length
								this.currentIndex = 0;
								CameraController.setTarget(Players.LocalPlayer);
								return;
							}
							randomChild = children[this.currentIndex];
						}
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
				CameraController.setTarget(character);
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

	static setTarget<T extends Instance>(target_?: T): boolean {
		print("called!");
		if (!target_) {
			this.target = new PlayerPositionProvider(Players.LocalPlayer);
			print("Player");
		} else {
			if (target_.IsA("BasePart")) {
				this.target = new BasePartPositionProvider(target_);
				print("BasePart");
				return true;
			} else if (target_.IsA("Player")) {
				this.target = new PlayerPositionProvider(target_);
				print("Player");
				return true;
			} else if (target_.IsA("Model")) {
				this.target = new ModelPositionProvider(target_);
				print("Model");
				return true;
			} else {
				this.target = new PlayerPositionProvider(Players.LocalPlayer);
				print("Player");
				return false;
			}
		}
		print("returning false");
		return false;
	}

	// Example method to get the position of the target
	static getTargetPosition(): Vector3 | undefined {
		return this.target?.getPosition();
	}

	static setDampening(number: number): void {
		this.dampening = number;
	}

	Connection(dt: number): void {
		if (!CameraController.target && Players.LocalPlayer) CameraController.setTarget(Players.LocalPlayer.Character);
		if (CameraController.target) {
			const goal = CameraController.target.getPosition().add(this.cameraOffset); // Apply the camera offset
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
				const finalCFrame = rotationCFrame
					.mul(new CFrame(this.spring.position).sub(CameraController.target.getPosition()))
					.add(CameraController.target.getPosition());
				Workspace.CurrentCamera.CFrame = finalCFrame;
			}
		}
	}
}

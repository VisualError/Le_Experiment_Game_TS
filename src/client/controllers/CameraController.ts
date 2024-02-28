import { Controller, OnStart } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Players, RunService, Workspace, UserInputService } from "@rbxts/services";
import Spring from "@rbxts/spring";

type PositionProvider = {
	getPosition(): Vector3;
	getCFrame(): CFrame;
	instance: Instance;
};

class BasePartPositionProvider implements PositionProvider {
	constructor(private basePart: BasePart) {
		this.instance = basePart;
	}
	getCFrame(): CFrame {
		return this.basePart.CFrame;
	}
	getPosition(): Vector3 {
		return this.basePart.Position;
	}
	instance: Instance;
}

class ModelPositionProvider implements PositionProvider {
	constructor(private model: Model) {
		this.instance = model;
	}
	instance: Instance;
	getCFrame(): CFrame {
		return this.model.PrimaryPart?.CFrame || new CFrame();
	}
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
	private static dampening = 3;
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
						const children = game.Workspace.GetChildren();
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
					switch (input.KeyCode) {
						case Enum.KeyCode.F:
							CameraController.dampening++;
							print(CameraController.dampening);
							break;
						case Enum.KeyCode.G:
							if (CameraController.dampening === 0) return;
							CameraController.dampening--;
							print(CameraController.dampening);
							break;
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
		// TODO: Disable spring when in first person.
		this.maid.GiveTask(
			UserInputService.InputChanged.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				switch (input.UserInputType) {
					case Enum.UserInputType.MouseWheel:
						this.cameraOffset = this.cameraOffset.add(new Vector3(0, 0, -input.Position.Z * 2));
						this.cameraOffset = new Vector3(
							this.cameraOffset.X,
							this.cameraOffset.Y,
							math.clamp(this.cameraOffset.Z, 2, 40),
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

	static setTarget<T extends Instance>(this: void, target_?: T): boolean {
		print("called!");
		if (!target_ && Players.LocalPlayer.Character) {
			CameraController.target = new ModelPositionProvider(Players.LocalPlayer.Character);
			print("Player");
		} else if (target_) {
			if (target_.IsA("BasePart")) {
				CameraController.target = new BasePartPositionProvider(target_);
				print("BasePart");
				return true;
			} else if (target_.IsA("Player")) {
				CameraController.target = new ModelPositionProvider(target_.Character!);
				print("Player");
				return true;
			} else if (target_.IsA("Model")) {
				CameraController.target = new ModelPositionProvider(target_);
				print("Model");
				return true;
			} else {
				CameraController.target = new ModelPositionProvider(Players.LocalPlayer.Character!);
				print("Player");
				return false;
			}
		}
		print("returning false");
		return false;
	}

	// Example method to get the position of the target
	static getTargetPosition(this: void): Vector3 | undefined {
		return CameraController.target?.getPosition();
	}

	static setDampening(this: void, number: number): void {
		CameraController.dampening = number;
	}

	// TODO: Separate springs for camera rotation/camera position.
	Connection(dt: number): void {
		if (CameraController.target) {
			const targetPosition = CameraController.target.getPosition();

			const rotationCFrame = new CFrame()
				.mul(CFrame.Angles(0, math.rad(this.accumulatedHorizontalAngle), 0))
				.mul(CFrame.Angles(math.rad(this.accumulatedVerticalAngle), 0, 0));

			let goal = targetPosition.add(rotationCFrame.mul(new CFrame(this.cameraOffset)).Position);
			if (Workspace.CurrentCamera) {
				const params = new RaycastParams();
				params.FilterType = Enum.RaycastFilterType.Exclude;
				params.AddToFilter(CameraController.target.instance);
				params.AddToFilter(Players.LocalPlayer.Character!);

				const result = game.Workspace.Raycast(targetPosition, goal.sub(targetPosition), params);

				// If a part is hit, adjust the goal position to stop before the part
				if (result && result.Instance) {
					const hitPosition = result.Position;
					const directionToGoal = goal.sub(targetPosition).Unit;
					const distanceToHit = hitPosition.sub(targetPosition).Magnitude;
					goal = targetPosition.add(directionToGoal.mul(distanceToHit * 0.8)); // The 0.8 is here coz it clips and idk why.
				}
			}
			if (!this.spring) this.spring = new Spring(goal, undefined, goal, CameraController.dampening);
			this.spring.goal = goal;
			this.spring.dampingRatio = CameraController.dampening;
			this.spring.update(dt);

			if (Workspace.CurrentCamera) {
				Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
				// Calculate the rotation CFrame based on the accumulated rotation angles
				// Apply the rotation CFrame to the camera's position
				const finalPosition = rotationCFrame.add(this.spring.position);
				// Apply the rotation CFrame to the new camera position
				Workspace.CurrentCamera.CFrame = finalPosition;
			}
		}
	}
}

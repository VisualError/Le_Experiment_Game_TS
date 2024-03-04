import { Controller, OnStart } from "@flamework/core";
import { Players, RunService, Workspace, UserInputService } from "@rbxts/services";
import Spring from "@rbxts/spring";
import { EventController } from "./EventController";
type PositionProvider = {
	getPosition(): Vector3;
	getCFrame(): CFrame;
	getVelocity(): Vector3;
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
	getVelocity(): Vector3 {
		return this.basePart?.AssemblyLinearVelocity || new Vector3();
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

	getVelocity(): Vector3 {
		return this.model.PrimaryPart?.AssemblyLinearVelocity || new Vector3();
	}
}
// TODO: Add support for first person mode.
// TODO: Add support for different input types.
@Controller()
export class CameraController implements OnStart {
	spring?: Spring<Vector3>;
	cameraOffset = new Vector3(0, 0, 5); // Initial camera offset
	private static target?: PositionProvider;
	private static dampening = 6;
	private accumulatedHorizontalAngle = 0;
	private static isLeftHeld = false;
	private static isRightHeld = false;
	private accumulatedVerticalAngle = 0;
	private currentIndex = 0;
	private static minDistance = 2;
	private static maxDistance = 100;

	constructor(private eventController: EventController) {}

	onStart(): void {
		print("Camera Controller has started!");
		//this.eventController.maid.GiveTask(RunService.RenderStepped.Connect((dt) => this.Connection(dt)));
		RunService.BindToRenderStep("CustomCameraController", Enum.RenderPriority.Camera.Value, (dt: number) =>
			this.Connection(dt),
		);
		// Listen for right-click to start orbiting
		this.eventController.maid.GiveTask(
			UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				if (
					input.UserInputType === Enum.UserInputType.MouseButton2 ||
					input.UserInputType === Enum.UserInputType.Touch
				) {
					UserInputService.MouseBehavior = Enum.MouseBehavior.LockCurrentPosition;
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
						case Enum.KeyCode.Left:
							CameraController.isLeftHeld = true;
							break;
						case Enum.KeyCode.Right:
							CameraController.isRightHeld = true;
							break;
					}
				}
			}),
		);

		this.eventController.maid.GiveTask(
			UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				if (input.UserInputType === Enum.UserInputType.MouseButton2) {
					UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
				}
				if (input.UserInputType === Enum.UserInputType.Keyboard) {
					switch (input.KeyCode) {
						case Enum.KeyCode.Left:
							CameraController.isLeftHeld = false;
							break;
						case Enum.KeyCode.Right:
							CameraController.isRightHeld = false;
							break;
					}
				}
			}),
		);

		// Listen for mouse wheel scroll to change camera offset
		// TODO: Disable spring when in first person.
		this.eventController.maid.GiveTask(
			UserInputService.InputChanged.Connect((input, gameProcessedEvent) => {
				if (gameProcessedEvent) return; // Ignore inputs already processed by the game

				switch (input.UserInputType) {
					case Enum.UserInputType.MouseWheel:
						this.cameraOffset = this.cameraOffset.add(new Vector3(0, 0, -input.Position.Z * 2));
						this.cameraOffset = new Vector3(
							this.cameraOffset.X,
							this.cameraOffset.Y,
							math.clamp(this.cameraOffset.Z, CameraController.minDistance, CameraController.maxDistance),
						);
						break;
					// case Enum.UserInputType.MouseMovement:
					// 	const newMousePos = input.Position;
					// 	if (this.oldMousePos) {
					// 		const delta = UserInputService.GetMouseDelta();
					// 		this.oldMousePos = newMousePos; // Update oldMousePos for the next delta calculation
					// 		if (CameraController.target) {
					// 			// Accumulate the rotation angles
					// 			//const mouseSensitivity = UserSettings().GetService("UserGameSettings").MouseSensitivity;
					// 			this.accumulatedHorizontalAngle += delta.X * 0.5;
					// 			this.accumulatedVerticalAngle += delta.Y * 0.5;

					// 			// Clamp the accumulated vertical angle to prevent the camera from turning upside down
					// 			// This example clamps the vertical angle between -80 and 80 degrees
					// 			this.accumulatedVerticalAngle = math.clamp(this.accumulatedVerticalAngle, -80, 80);
					// 		}
					// 	}
					// 	break;
				}
			}),
		);

		this.eventController.maid.GiveTask(
			Players.LocalPlayer.CharacterAdded.Connect((character) => {
				CameraController.setTarget(character);
			}),
		);
		CameraController.setTarget(Players.LocalPlayer.Character);
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
		if (!CameraController.target) {
			//CameraController.setTarget(Players.LocalPlayer.Character);
			return;
		}
		const targetPosition = CameraController.target.getCFrame().Position;
		const targetRotation = CameraController.target.getCFrame().Rotation; // Not using this yet..
		const mouseDelta = UserInputService.GetMouseDelta();
		this.accumulatedHorizontalAngle += mouseDelta.X * 0.5;
		this.accumulatedVerticalAngle += math.clamp(mouseDelta.Y * 0.5, -80, 80);

		// Handle the left/right arrow keys.
		if (CameraController.isLeftHeld) {
			this.accumulatedHorizontalAngle -= 200 * dt;
		}
		if (CameraController.isRightHeld) {
			this.accumulatedHorizontalAngle += 200 * dt;
		}
		// Calculate the camera's rotation based on the accumalated angles
		const rotationCFrame = new CFrame()
			.mul(CFrame.Angles(0, math.rad(this.accumulatedHorizontalAngle), 0))
			.mul(CFrame.Angles(math.rad(this.accumulatedVerticalAngle), 0, 0));
		let goal = targetPosition.add(rotationCFrame.mul(new CFrame(this.cameraOffset)).Position);
		if (Workspace.CurrentCamera) {
			const params = new RaycastParams();
			params.FilterType = Enum.RaycastFilterType.Exclude;
			params.AddToFilter(CameraController.target.instance);
			//params.AddToFilter(Players.LocalPlayer.Character!);

			const result = game.Workspace.Raycast(targetPosition, goal.sub(targetPosition), params);

			// If a part is hit, adjust the goal position to stop before the part
			if (result && result.Instance) {
				const hitPosition = result.Position;
				const directionToGoal = goal.sub(targetPosition).Unit;
				const distanceToHit = hitPosition.sub(targetPosition).Magnitude;
				goal = targetPosition.add(directionToGoal.mul(distanceToHit * 0.8)); // The 0.8 is here coz it clips and idk why.
			}
		}
		if (!this.spring) this.spring = new Spring(targetPosition, 50, goal, CameraController.dampening);
		this.spring.goal = goal;
		this.spring.dampingRatio = CameraController.dampening;
		if (this.spring.dampingRatio > 0) {
			this.spring.update(dt);
		} else {
			if (this.spring.position !== this.spring.goal) this.spring.resetToPosition(this.spring.goal);
		}

		if (Workspace.CurrentCamera) {
			Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
			// Calculate the rotation CFrame based on the accumulated rotation angles
			// Apply the rotation CFrame to the camera's position
			const springToggle = this.spring.dampingRatio > 0 ? this.spring.position : goal;
			const finalPosition = rotationCFrame.add(springToggle);
			// Apply the rotation CFrame to the new camera position

			Workspace.CurrentCamera.CFrame = finalPosition;
		}
	}
}

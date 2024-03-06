import { Controller, OnStart } from "@flamework/core";
import { Players, RunService, Workspace, UserInputService, ContextActionService } from "@rbxts/services";
import Spring from "@rbxts/spring";
import { EventController } from "../EventController";
import { CameraInput } from "./CameraInput";
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

interface MouseState {
	Movement: Vector2;
	Wheel: number;
	Pan: Vector2;
	Pinch: number;
}

interface keyStates {
	Left: number;
	Right: number;
	I: number;
	O: number;
}

interface touchState {
	Move: Vector2;
	Pinch: number;
}

interface gamePadState {
	Thumbstick2: Vector2;
}

const ROTATION_SPEED_KEYS = math.rad(120); // (rad/s)
const ROTATION_SPEED_MOUSE = new Vector2(1, 0.77).mul(math.rad(0.5)); // (rad/s)
const ROTATION_SPEED_POINTERACTION = new Vector2(1, 0.77).mul(math.rad(7)); // (rad/s)
const ROTATION_SPEED_TOUCH = new Vector2(1, 0.66).mul(math.rad(1)); // (rad/s)
const ROTATION_SPEED_GAMEPAD = new Vector2(1, 0.77).mul(math.rad(4)); // (rad/s)
const MIN_TOUCH_SENSITIVITY_FRACTION = 0.25; // 25% sensitivity at 90°
const MIN_Y = math.rad(-80);
const MAX_Y = math.rad(80);
const INITIAL_CAMERA_ANGLE = CFrame.fromOrientation(math.rad(-15), 0, 0);

const UNIT_Z = new Vector3(0, 0, 1);

// TODO: Add support for first person mode.
// TODO: Add support for different input types.
@Controller()
export class CameraController implements OnStart {
	spring?: Spring<Vector3>;
	cameraOffset = new Vector3(0, 0, 5); // Initial camera offset
	private static minDistance = Players.LocalPlayer.CameraMinZoomDistance;
	private static maxDistance = Players.LocalPlayer.CameraMaxZoomDistance;
	private static target?: PositionProvider;
	private static dampening = 6;
	static touches: Map<InputObject, boolean> = new Map<InputObject, boolean>();
	constructor(private eventController: EventController) {}

	getCameraLookVector(): Vector3 {
		return Workspace.CurrentCamera ? Workspace.CurrentCamera.CFrame.LookVector : UNIT_Z;
	}

	calculateNewLookCFrameFromArg(lookVector: Vector3 | undefined, rotateInput: Vector2): CFrame {
		const currLookVector: Vector3 = lookVector || this.getCameraLookVector();
		const currPitchAngle = math.asin(currLookVector.Y);
		const yTheta = math.clamp(rotateInput.Y, -MAX_Y + currPitchAngle, -MIN_Y + currPitchAngle);
		const constrainedRotateInput = new Vector2(rotateInput.X, yTheta);
		const startCFrame = new CFrame(Vector3.zero, currLookVector);
		const newLookCFrame = CFrame.Angles(0, -constrainedRotateInput.X, 0)
			.mul(startCFrame)
			.mul(CFrame.Angles(-constrainedRotateInput.Y, 0, 0));
		return newLookCFrame;
	}

	calculateNewLookVectorFromArg(lookVector: Vector3, rotateInput: Vector2): Vector3 {
		const newLookCFrame = this.calculateNewLookCFrameFromArg(lookVector, rotateInput);
		return newLookCFrame.LookVector;
	}

	onStart(): void {
		print("Camera Controller has started!");
		//this.eventController.maid.GiveTask(RunService.RenderStepped.Connect((dt) => this.Connection(dt)));
		if (Workspace.CurrentCamera) Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
		RunService.BindToRenderStep("CustomCameraController", Enum.RenderPriority.Camera.Value, (dt: number) =>
			this.Connection(dt),
		);
		// // Listen for right-click to start orbiting
		// this.eventController.maid.GiveTask(
		// 	UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
		// 		if (gameProcessedEvent) return; // Ignore inputs already processed by the game

		// 		const bool =
		// 			(input.UserInputType === Enum.UserInputType.MouseButton2 ||
		// 				(input.UserInputType === Enum.UserInputType.Touch &&
		// 					!this.isInDynamicThumbstickArea(input.Position))) &&
		// 			input.UserInputState === Enum.UserInputState.Begin;
		// 		if (bool) {
		// 			UserInputService.MouseBehavior = Enum.MouseBehavior.LockCurrentPosition;
		// 		}
		// 		if (input.UserInputType === Enum.UserInputType.Keyboard) {
		// 			if (input.KeyCode === Enum.KeyCode.E) {
		// 				const children = game.Workspace.GetChildren();
		// 				if (this.currentIndex >= children.size()) {
		// 					// Reset the index to 0 if it exceeds the array length
		// 					this.currentIndex = 0;
		// 					CameraController.setTarget(Players.LocalPlayer);
		// 					return;
		// 				} else {
		// 					this.currentIndex++;
		// 				}
		// 				let randomChild = children[this.currentIndex];
		// 				print(randomChild);
		// 				while (!randomChild || !CameraController.setTarget(randomChild)) {
		// 					this.currentIndex++;
		// 					if (this.currentIndex >= children.size()) {
		// 						// Reset the index to 0 if it exceeds the array length
		// 						this.currentIndex = 0;
		// 						CameraController.setTarget(Players.LocalPlayer);
		// 						return;
		// 					}
		// 					randomChild = children[this.currentIndex];
		// 				}
		// 				print(CameraController.target);
		// 			}
		// 			switch (input.KeyCode) {
		// 				case Enum.KeyCode.F:
		// 					CameraController.dampening++;
		// 					print(CameraController.dampening);
		// 					break;
		// 				case Enum.KeyCode.G:
		// 					if (CameraController.dampening === 0) return;
		// 					CameraController.dampening--;
		// 					print(CameraController.dampening);
		// 					break;
		// 				case Enum.KeyCode.Left:
		// 					CameraController.isLeftHeld = true;
		// 					break;
		// 				case Enum.KeyCode.Right:
		// 					CameraController.isRightHeld = true;
		// 					break;
		// 			}
		// 		}
		// 	}),
		// );

		// this.eventController.maid.GiveTask(
		// 	UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
		// 		if (gameProcessedEvent) return; // Ignore inputs already processed by the game

		// 		if (input.UserInputType === Enum.UserInputType.MouseButton2) {
		// 			UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
		// 		}
		// 		if (input.UserInputType === Enum.UserInputType.Keyboard) {
		// 			switch (input.KeyCode) {
		// 				case Enum.KeyCode.Left:
		// 					CameraController.isLeftHeld = false;
		// 					break;
		// 				case Enum.KeyCode.Right:
		// 					CameraController.isRightHeld = false;
		// 					break;
		// 			}
		// 		}
		// 	}),
		// );

		// // Listen for mouse wheel scroll to change camera offset
		// // TODO: Disable spring when in first person.
		// this.eventController.maid.GiveTask(
		// 	UserInputService.InputChanged.Connect((input, gameProcessedEvent) => {
		// 		if (gameProcessedEvent) return; // Ignore inputs already processed by the game

		// 		switch (input.UserInputType) {
		// 			case Enum.UserInputType.MouseWheel:
		// 				this.cameraOffset = this.cameraOffset.add(new Vector3(0, 0, -input.Position.Z * 2));
		// 				this.cameraOffset = new Vector3(
		// 					this.cameraOffset.X,
		// 					this.cameraOffset.Y,
		// 					math.clamp(this.cameraOffset.Z, CameraController.minDistance, CameraController.maxDistance),
		// 				);
		// 				break;
		// 		}
		// 	}),
		// );

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
			} else if (target_?.IsA("Humanoid")) {
				CameraController.target = new ModelPositionProvider(target_.Parent! as Model);
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
		CameraInput.worldDt = dt;
		if (!CameraController.target) {
			//CameraController.setTarget(Players.LocalPlayer.Character);
			return;
		}
		const rotationInput = CameraInput.getRotation();
		const targetCFrame = CameraController.target.getCFrame();
		const targetPosition = targetCFrame.Position;
		const targetRotation = targetCFrame.Rotation; // Not using this yet..
		//const mouseDelta = UserInputService.GetMouseDelta();

		const newLookCFrame: CFrame = this.calculateNewLookCFrameFromArg(undefined, rotationInput);

		//this.accumulatedVerticalAngle = math.clamp(this.accumulatedVerticalAngle, -80, 80);
		// Calculate the camera's rotation based on the accumalated angles
		const rotationCFrame = newLookCFrame.Rotation;
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

		CameraInput.resetInputForFrameEnd();
	}
}

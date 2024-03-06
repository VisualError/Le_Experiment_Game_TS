import { Controller, OnStart } from "@flamework/core";
import { Players, RunService, Workspace, UserInputService, ContextActionService } from "@rbxts/services";
import Spring from "@rbxts/spring";
import { EventController } from "../EventController";
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

// TODO: Add support for first person mode.
// TODO: Add support for different input types.
@Controller()
export class CameraInput implements OnStart {
	static worldDt = 1 / 60;
	private static mouseState: MouseState = {
		Movement: Vector2.zero,
		Wheel: 0, // PointerAction
		Pan: Vector2.zero, // PointerAction
		Pinch: 0, // PointerAction
	};
	private static panInputCount = 0;
	static touchState: touchState = {
		Move: Vector2.zero,
		Pinch: 0,
	};
	static gamePadState: gamePadState = {
		Thumbstick2: new Vector2(),
	};
	static keyStates: keyStates = {
		Left: 0,
		Right: 0,
		I: 0,
		O: 0,
	};
	static touches: Map<InputObject, boolean> = new Map<InputObject, boolean>();
	static dynamicThumbstickInput?: InputObject;
	static lastPinchDiameter?: number | undefined;
	constructor(private eventController: EventController) {}

	static isInDynamicThumbstickArea(pos: Vector3): boolean {
		const gui = Players.LocalPlayer.FindFirstChildOfClass("PlayerGui");
		const touch = gui?.FindFirstChild("TouchGui") as ScreenGui;
		const frame = touch?.FindFirstChild("TouchControlFrame") as Frame;
		const thumbstick = frame?.FindFirstChild("DynamicThumbstickFrame") as Frame;
		if (!thumbstick) return false;
		if (!touch) return false;
		const posTopLeft = thumbstick.AbsolutePosition;
		const posBottomRight = posTopLeft.add(thumbstick.AbsoluteSize);
		return pos.X >= posTopLeft.X && pos.Y >= posTopLeft.Y && pos.X <= posBottomRight.X && pos.Y <= posBottomRight.Y;
	}

	static CameraKeypress(this: void, action: unknown, state: Enum.UserInputState, input: InputObject) {
		CameraInput.keyStates[input.KeyCode.Name as never] = (state === Enum.UserInputState.Begin ? 1 : 0) as never;
	}

	static getRotation(this: void, disableKeyboardRotation?: boolean): Vector2 {
		const inversionVector = new Vector2(1, UserSettings().GetService("UserGameSettings").GetCameraYInvertValue());
		let kKeyboard = new Vector2(CameraInput.keyStates.Right - CameraInput.keyStates.Left, 0).mul(
			CameraInput.worldDt,
		);
		const kGamepad = CameraInput.gamePadState.Thumbstick2;
		const kMouse = CameraInput.mouseState.Movement;
		const kPointerAction = CameraInput.mouseState.Pan;
		const kTouch = adjustTouchPitchSensitivity(CameraInput.touchState.Move);
		if (disableKeyboardRotation) {
			kKeyboard = Vector2.zero;
		}
		const result = kKeyboard
			.mul(ROTATION_SPEED_KEYS)
			.add(kGamepad.mul(ROTATION_SPEED_GAMEPAD))
			.add(kMouse.mul(ROTATION_SPEED_MOUSE))
			.add(kPointerAction.mul(ROTATION_SPEED_POINTERACTION))
			.add(kTouch.mul(ROTATION_SPEED_TOUCH));
		return result.mul(inversionVector);
	}

	static thumbstickCurve(x: number): number {
		const fDeadzone = (math.abs(x) - 0.1) / (1 - 2);
		const fCurve = (math.exp(2 * fDeadzone) - 1) / (math.exp(2) - 1);
		return math.sign(x) * math.clamp(fCurve, 0, 1);
	}

	static ThumbstickUse(this: void, action: unknown, state: Enum.UserInputState, input: InputObject) {
		const position = input.Position;
		CameraInput.gamePadState[input.KeyCode.Name as never] = new Vector2(
			CameraInput.thumbstickCurve(position.X),
			-CameraInput.thumbstickCurve(position.Y),
		) as never;
		return Enum.ContextActionResult.Pass;
	}
	static mobilePanBegan(this: void, input: InputObject, sunk: boolean) {
		assert(input.UserInputType === Enum.UserInputType.Touch);
		assert(input.UserInputState === Enum.UserInputState.Begin);
		if (
			CameraInput.dynamicThumbstickInput === undefined &&
			CameraInput.isInDynamicThumbstickArea(input.Position) &&
			!sunk
		) {
			CameraInput.dynamicThumbstickInput = input;
			return;
		}
		if (!sunk) {
			CameraInput.desktopPanBegan();
		}

		CameraInput.touches.set(input, sunk);
	}
	static mobilePanEnded(this: void, input: InputObject, sunk: boolean) {
		assert(input.UserInputType === Enum.UserInputType.Touch);
		assert(input.UserInputState === Enum.UserInputState.End);
		print("mobile pan ended");
		if (input === CameraInput.dynamicThumbstickInput) {
			CameraInput.dynamicThumbstickInput = undefined;
		}
		if (CameraInput.touches.get(input) === false) {
			CameraInput.desktopPanEnded();
		}
		CameraInput.touches.delete(input);
	}
	static desktopPanBegan(this: void) {
		print("desktop pan began");
		CameraInput.panInputCount = math.max(0, CameraInput.panInputCount + 1);
	}
	static desktopPanEnded(this: void) {
		print("desktop pan ended");
		CameraInput.panInputCount = math.max(0, CameraInput.panInputCount - 1);
	}
	static getRotationActivated(): boolean {
		return CameraInput.panInputCount > 0 || CameraInput.gamePadState.Thumbstick2.Magnitude > 0;
	}
	static mobilePan(this: void, input: InputObject, sunk: boolean) {
		assert(input.UserInputType === Enum.UserInputType.Touch);
		assert(input.UserInputState === Enum.UserInputState.Change);
		//ignore movement from the DT finger
		if (input === CameraInput.dynamicThumbstickInput) return;
		//fixup unknown touches
		if (CameraInput.touches.get(input) === undefined) {
			CameraInput.touches.set(input, sunk);
		}
		const unsunkTouches = new Array<InputObject>();
		for (const [touch, sunk] of CameraInput.touches) {
			if (!sunk) {
				unsunkTouches.push(touch);
			}
		}

		// FINGER 1: PAN.
		if (unsunkTouches.size() === 1) {
			if (CameraInput.touches.get(input) === false) {
				const delta = input.Delta;
				CameraInput.touchState.Move = CameraInput.touchState.Move.add(new Vector2(delta.X, delta.Y));
			}
		}

		if (unsunkTouches.size() === 2) {
			const pinchDiameter = unsunkTouches[1].Position.sub(unsunkTouches[2].Position).Magnitude;
			if (CameraInput.lastPinchDiameter !== undefined) {
				CameraInput.touchState.Pinch =
					CameraInput.touchState.Pinch + pinchDiameter - CameraInput.lastPinchDiameter;
			}
			CameraInput.lastPinchDiameter = pinchDiameter;
		} else {
			CameraInput.lastPinchDiameter = undefined;
		}
	}
	static desktopPan(this: void, input: InputObject) {
		const delta = input.Delta;
		CameraInput.mouseState.Movement = new Vector2(delta.X, delta.Y);
	}

	static resetInputForFrameEnd(this: void) {
		CameraInput.mouseState.Movement = Vector2.zero;
		CameraInput.touchState.Move = Vector2.zero;
		CameraInput.touchState.Pinch = 0;

		CameraInput.mouseState.Wheel = 0;
		CameraInput.mouseState.Pan = Vector2.zero;
		CameraInput.mouseState.Pinch = 0;
	}

	onStart(): void {
		print("Camera Input has started!");
		ContextActionService.BindActionAtPriority(
			"CustomCameraThumbstick",
			CameraInput.ThumbstickUse,
			false,
			Enum.ContextActionPriority.Medium.Value,
			Enum.KeyCode.Thumbstick2,
		);
		ContextActionService.BindActionAtPriority(
			"CustomCameraKeypress",
			CameraInput.CameraKeypress,
			false,
			Enum.ContextActionPriority.Medium.Value,
			Enum.KeyCode.Left,
			Enum.KeyCode.Right,
			Enum.KeyCode.I,
			Enum.KeyCode.O,
		);
		this.eventController.maid.GiveTask(
			UserInputService.InputBegan.Connect(function (input, sunk) {
				switch (input.UserInputType) {
					case Enum.UserInputType.Touch:
						CameraInput.mobilePanBegan(input, sunk);
						break;
					case Enum.UserInputType.MouseButton2:
						CameraInput.desktopPanBegan();
						UserInputService.MouseBehavior = Enum.MouseBehavior.LockCurrentPosition;
						break;
				}
			}),
		);
		this.eventController.maid.GiveTask(
			UserInputService.InputChanged.Connect(function (input, sunk) {
				switch (input.UserInputType) {
					case Enum.UserInputType.Touch:
						CameraInput.mobilePan(input, sunk);
						break;
					case Enum.UserInputType.MouseMovement:
						CameraInput.desktopPan(input);
						break;
				}
			}),
		);
		this.eventController.maid.GiveTask(
			UserInputService.InputEnded.Connect(function (input, sunk) {
				switch (input.UserInputType) {
					case Enum.UserInputType.Touch:
						CameraInput.mobilePanEnded(input, sunk);
						break;
					case Enum.UserInputType.MouseButton2:
						CameraInput.desktopPanEnded();
						UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
						break;
				}
			}),
		);
		this.eventController.maid.GiveTask(
			UserInputService.PointerAction.Connect(function (wheel, pan, pinch, gpe) {
				if (gpe) return;
				CameraInput.mouseState.Wheel = wheel;
				CameraInput.mouseState.Pan = pan;
				CameraInput.mouseState.Pinch = -pinch;
			}),
		);
		this.eventController.maid.GiveTask(() => ContextActionService.UnbindAction("CustomCameraKeypress"));
	}
}

function adjustTouchPitchSensitivity(delta: Vector2): Vector2 {
	const camera = Workspace.CurrentCamera;
	if (!camera) return delta;
	const [X, Y, Z] = camera.CFrame.ToEulerAnglesXYZ();

	if (X * Y * Z * delta.Y >= 0) {
		return delta;
	}
	const curveY = (1 - (2 * math.abs(X * Y * Z)) / math.pi) ^ 0.75;
	const sensitivity = curveY * (1 - MIN_TOUCH_SENSITIVITY_FRACTION) + MIN_TOUCH_SENSITIVITY_FRACTION;
	return new Vector2(1, sensitivity).mul(delta);
}

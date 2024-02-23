import { Signal } from "@rbxts/beacon";
import { CreateInstance } from "shared/Utils";
import { R6Legs } from "./FakeLegs";
//Module to handle the procedural animation the hip and legs
//remnants from iGottics Code
const ANGLES = CFrame.Angles;
const x_and_z = new Vector3(1, 0, 1);
const TAU = 2 * math.pi;
const DOWN = new Vector3(0, -4, 0);

class ProceduralAnimator {
	RootPart: Part;
	vector: Vector3;
	OrientationAngles: CFrame;
	Humanoid: Humanoid | undefined;
	lookVector: Vector3;
	PreviouslookVector: Vector3;
	RaycastParams: RaycastParams;
	yVelocity: number;
	RootMotor?: Motor6D;
	RootMotorC1Store?: CFrame;
	RootMotorC0Store?: CFrame;
	WaistCycle?: number;
	Legs: R6Legs; // You might want to define a more specific type for Legs
	DefaultStride: number;
	CycleSpeed: number;
	DefaultStrideOffset: number;
	DefaultStrideCF: CFrame;
	MovementDirectionXZ: Vector3;
	rootvelm: number;
	FootStep: Signal<RaycastResult | undefined>;
	MaxSpeed: number;
	EngineSound: Sound | undefined;
	WalkBounce: number;
	SwayX: number;
	RandomNumGenerator: Random;
	IsMoving: boolean;
	constructor(RootPart: Part, Legs: R6Legs, RootMotor?: Motor6D, raycastParams?: RaycastParams) {
		this.RootPart = RootPart;
		this.IsMoving = false;
		this.vector = new Vector3(0, 0, 0);
		this.OrientationAngles = new CFrame(0, 0, 0);
		this.Humanoid = this.RootPart.Parent?.FindFirstChildWhichIsA("Humanoid");
		this.lookVector = this.RootPart.CFrame.LookVector;
		this.PreviouslookVector = this.lookVector.Unit;
		this.RaycastParams = raycastParams || new RaycastParams();
		this.yVelocity = 0;
		if (RootMotor) {
			this.RootMotor = RootMotor;
			this.RootMotorC1Store = this.RootMotor.C1;
			this.RootMotorC0Store = this.RootMotor.C0;
			this.WaistCycle = 0;
		}

		this.Legs = Legs;

		// Default settings for legs
		this.DefaultStride = 2; // Changes how far the legs move
		this.CycleSpeed = 14; // How fast the leg-movement cycle is. Change this to suit your needs!
		this.DefaultStrideOffset = 0;
		// Radius of the circle at CFrame front of the player
		this.DefaultStrideCF = new CFrame(0, 0, -this.DefaultStride / 2); // Turn that stride number into a CFrame we can use

		// Variables that will change
		this.MovementDirectionXZ = new Vector3(1, 0, 1); // This will be changed
		this.rootvelm = 0;

		// Sound
		this.FootStep = new Signal<RaycastResult>();
		this.MaxSpeed = 20;
		this.EngineSound = undefined;
		// FootstepModule:CreateSoundGroup(workspace); // Assuming FootstepModule is defined elsewhere
		this.RandomNumGenerator = new Random();

		this.WalkBounce = 0.24; // factor by which it bounces
		this.SwayX = -1 * 5; // factor in Z direction front or behind, currently set to tilt forward
	}

	Animate(dt: number): void {
		const dt10 = math.min(dt * 10, 1); // Normalize dt for our needs
		const assemblyVelocity = this.RootPart.AssemblyLinearVelocity;
		const rootVelocity = assemblyVelocity.mul(x_and_z);
		this.yVelocity = assemblyVelocity.Y;
		this.lookVector = this.RootPart.CFrame.LookVector;
		// Begin the step
		const rootVelocityMagnitude = rootVelocity.Magnitude;

		this.IsMoving = rootVelocityMagnitude > 0.1;
		if (this.EngineSound) {
			this.EngineSound.PlaybackSpeed = rootVelocityMagnitude / this.MaxSpeed + 0.6; // Dunno what this is for.
		}

		if (this.IsMoving) {
			this.MovementDirectionXZ = this.MovementDirectionXZ.Lerp(rootVelocity.Unit, dt10);
		}
		const relativizeToHumanoidSpeed = rootVelocityMagnitude / 16; //default walk speed is 16
		const stepCycle = relativizeToHumanoidSpeed * dt * this.CycleSpeed;
		this.MoveLegs(stepCycle, dt);
		if (this.RootMotor) {
			this.MoveTorso(stepCycle, dt10, rootVelocity);
		}
	}

	MoveLegs(stepCycle: number, dt: number) {
		for (const [_, Leg] of pairs(this.Legs)) {
			const strideCF = this.DefaultStrideCF;
			const strideOffset = this.DefaultStrideOffset;
			const lookVector = this.lookVector;
			const angle = math.atan2(lookVector.X, lookVector.Z);
			const rad = math.deg(angle);
			const raycastParams = this.RaycastParams;
			if (this.IsMoving || this.Humanoid?.FloorMaterial === Enum.Material.Air) {
				Leg.CurrentCycle = (Leg.CurrentCycle + stepCycle) % 360;
			} else {
				// do something
			}
			const cycle = Leg.CurrentCycle;
			const IKTolerance = 0;
			const hipPosition = Leg.HipAttachment.WorldPosition;
			const ground = Leg.FootAttachment.WorldPosition;

			const desiredPosition = new CFrame(ground, ground.add(this.MovementDirectionXZ))
				.mul(ANGLES(-cycle, 0, 0))
				.mul(strideCF).Position;
			const offset = desiredPosition.sub(hipPosition); // vector from hip to the circle
			const raycastResult = game.Workspace.Raycast(
				hipPosition,
				offset.Unit.mul(offset.Magnitude + strideOffset),
				raycastParams,
			);
			const targetPos = hipPosition.add(offset.Unit.mul(offset.Magnitude + strideOffset));
			const footPos = targetPos;
			Leg.CCDIKController.CCDIKIterateUntil(footPos, IKTolerance);
			if (!Leg.TouchedGround && raycastResult) {
				this.FootStep.Fire(raycastResult);
			}
			Leg.TouchedGround = raycastResult !== undefined;
		}
	}

	MoveTorso(stepCycle: number, dt10: number, rootVelocity: Vector3) {
		const lowercf = this.RootPart.CFrame;
		const waistjoint = this.RootMotor!;
		const waist1 = this.RootMotorC1Store!;
		const rootvel = rootVelocity;
		if (this.IsMoving) {
			this.WaistCycle = (this.WaistCycle! + stepCycle) % 360;
			const relv0 = lowercf.VectorToObjectSpace(rootvel);
			const relv1 = relv0.mul(0.2);

			const bounceCFrame = new CFrame(0, this.WalkBounce * math.cos((this.WaistCycle + 90 + 45) * 2), 0);
			const sway = math.rad(-relv1.X) + 0.08 * math.cos(this.WaistCycle + 90);
			const swayY = 0.1 * math.cos(this.WaistCycle) - 2 * math.rad(relv1.X);
			const swayX = math.rad(relv1.Z) * 0.5 * this.SwayX;
			const goalCF = bounceCFrame.mul(
				waist1.mul(ANGLES(swayX, swayY, sway).Inverse().mul(this.OrientationAngles)),
			);
			waistjoint.C1 = waistjoint.C1.Lerp(goalCF, dt10);
		} else {
			const goalCF = waistjoint?.C1.Lerp(waist1.mul(this.OrientationAngles), dt10);
			waistjoint.C1 = goalCF;
		}
	}

	ConnectFootStepSound(sound: Sound): void {
		this.FootStep.Connect((raycastResult: RaycastResult | undefined) => {
			if (raycastResult === undefined) return;
			const soundPositionAttachment = CreateInstance("Attachment", {
				WorldPosition: raycastResult.Position,
				Parent: game.Workspace.Terrain,
			});
			const footStepSound = sound.Clone();
			const randomPlaybackSpeed = this.RandomNumGenerator.NextNumber(0.9, 1.1);
			footStepSound.PlaybackSpeed = randomPlaybackSpeed;
			//footStepSound.SoundId = footStepSound.SoundId;
			footStepSound.PlayOnRemove = true;
			footStepSound.Parent = soundPositionAttachment;
			soundPositionAttachment.Destroy();
		});
	}
}

export default ProceduralAnimator;

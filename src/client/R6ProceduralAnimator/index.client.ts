//import CCDIKController from "./CCDIKController";

import CCDIKController, { ConstraintsValue } from "@rbxts/ccdik-controller";
import ProceduralAnimator from "./ProceduralAnimator";
import { R6Legs } from "./FakeLegs";

const PlayerService = game.GetService("Players");
const LocalPlayer = PlayerService.LocalPlayer;
const RunService = game.GetService("RunService");

function createFakeLegs(
	character: Model,
	Torso: BasePart,
	RealLLeg: BasePart,
	RealRLeg: BasePart,
): [Motor6D[], Motor6D[], BasePart, BasePart] {
	// Create Fake Upper Left Leg
	const FakeUpperLLeg = new Instance("Part");
	FakeUpperLLeg.Transparency = 1;
	FakeUpperLLeg.Size = new Vector3(0.1, 0.1, 0.1);
	FakeUpperLLeg.CanCollide = false;
	FakeUpperLLeg.CanQuery = false;
	FakeUpperLLeg.CanTouch = false;

	const LeftHip = new Instance("Motor6D");
	LeftHip.Name = "Fake Left Hip";
	LeftHip.C1 = new CFrame(0, 0.3, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	LeftHip.C0 = new CFrame(-0.5, -0.95, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	LeftHip.Part0 = Torso;
	LeftHip.Part1 = FakeUpperLLeg;

	const LeftLeg = new Instance("Motor6D");
	LeftLeg.Name = "Fake Left Leg";
	LeftLeg.C1 = new CFrame(0, 0.6, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	LeftLeg.C0 = new CFrame(0, -0.15, 0);
	LeftLeg.Part0 = FakeUpperLLeg;
	LeftLeg.Part1 = RealLLeg;

	// Parenting
	FakeUpperLLeg.Parent = character;
	LeftHip.Parent = Torso;
	LeftLeg.Parent = Torso;

	// Create Fake Upper Right Leg
	const FakeUpperRLeg = new Instance("Part");
	FakeUpperRLeg.Transparency = 1;
	FakeUpperRLeg.Size = new Vector3(0.1, 0.1, 0.1);
	FakeUpperRLeg.CanCollide = false;
	FakeUpperRLeg.CanQuery = false;
	FakeUpperRLeg.CanTouch = false;
	FakeUpperRLeg.Parent = character;

	const RightHip = new Instance("Motor6D");
	RightHip.Name = "Fake Right Hip";
	RightHip.C1 = new CFrame(0, 0.3, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	RightHip.C0 = new CFrame(0.5, -0.95, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	RightHip.Part0 = Torso;
	RightHip.Part1 = FakeUpperRLeg;

	const RightLeg = new Instance("Motor6D");
	RightLeg.Name = "Fake Right Leg";
	RightLeg.C1 = new CFrame(0, 0.6, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1);
	RightLeg.C0 = new CFrame(0, -0.15, 0);
	RightLeg.Part0 = FakeUpperRLeg;
	RightLeg.Part1 = RealRLeg;

	// Parenting
	FakeUpperRLeg.Parent = character;
	RightHip.Parent = Torso;
	RightLeg.Parent = Torso;

	// Return Motor6Ds packaged form
	return [[LeftHip, LeftLeg], [RightHip, RightLeg], FakeUpperLLeg, FakeUpperRLeg];
}

function giveCharacterIK(character: Model) {
	const Torso = character.WaitForChild("Torso");

	const RealRightLeg = character.WaitForChild("Right Leg");
	const RealLeftLeg = character.WaitForChild("Left Leg");
	const EndEffector = new Instance("Attachment");
	EndEffector.Name = "EndEffector";
	EndEffector.Position = new Vector3(0, -0.9, 0);
	EndEffector.Parent = RealRightLeg;

	const cloneEndEffect = EndEffector.Clone();
	cloneEndEffect.Parent = RealLeftLeg;

	const [LeftLegData, RightLegData, FakeUpperLLeg, FakeUpperRLeg] = createFakeLegs(
		character,
		Torso as BasePart,
		RealLeftLeg as BasePart,
		RealRightLeg as BasePart,
	);

	//Create hinge constraint for CCDIK
	function createHingeConstraints() {
		const LKneeAttachment = new Instance("Attachment");
		LKneeAttachment.Position = new Vector3(0, -0.35, 0);
		LKneeAttachment.Parent = FakeUpperLLeg;

		const LKneeAttachment1 = new Instance("Attachment");
		LKneeAttachment1.Position = new Vector3(0, 0.4, 0);
		LKneeAttachment1.Parent = RealLeftLeg;

		const kneeConstraint = new Instance("HingeConstraint");
		kneeConstraint.Attachment0 = LKneeAttachment;
		kneeConstraint.Attachment1 = LKneeAttachment1;
		kneeConstraint.LowerAngle = -145;
		kneeConstraint.UpperAngle = -15;
		kneeConstraint.Parent = FakeUpperLLeg;

		//Repeat for right leg
		const RKneeAttachment = new Instance("Attachment");
		RKneeAttachment.Position = new Vector3(0, -0.35, 0);
		RKneeAttachment.Parent = FakeUpperRLeg;

		const RKneeAttachment1 = new Instance("Attachment");
		RKneeAttachment1.Position = new Vector3(0, 0.4, 0);
		RKneeAttachment1.Parent = RealRightLeg;

		const kneeConstraintRight = new Instance("HingeConstraint");
		kneeConstraintRight.Attachment0 = RKneeAttachment;
		kneeConstraintRight.Attachment1 = RKneeAttachment1;
		kneeConstraintRight.LowerAngle = -145;
		kneeConstraintRight.UpperAngle = -15;
		kneeConstraintRight.Parent = FakeUpperRLeg;
	}
	createHingeConstraints();

	function createBallSocketConstraints() {
		const RightHipAttachment = new Instance("Attachment");
		RightHipAttachment.Position = new Vector3(0.5, -0.95, 0);
		RightHipAttachment.Parent = Torso;

		const RightHipAttachment1 = new Instance("Attachment");
		RightHipAttachment1.Position = new Vector3(0, 0.3, 0);
		RightHipAttachment1.Parent = FakeUpperRLeg;

		const hipConstraint = new Instance("BallSocketConstraint");
		hipConstraint.Name = "RightBallSocketConstraint";
		hipConstraint.LimitsEnabled = true;
		hipConstraint.TwistLimitsEnabled = true;
		hipConstraint.UpperAngle = 5;
		hipConstraint.Attachment0 = RightHipAttachment;
		hipConstraint.Attachment1 = RightHipAttachment1;
		hipConstraint.Parent = Torso;

		const LeftHipAttachment = new Instance("Attachment");
		LeftHipAttachment.Position = new Vector3(-0.5, -0.95, 0);
		LeftHipAttachment.Parent = Torso;

		const LeftHipAttachment1 = new Instance("Attachment");
		LeftHipAttachment1.Position = new Vector3(0, 0.3, 0);
		LeftHipAttachment1.Parent = FakeUpperLLeg;

		const hipConstraintLeft = hipConstraint.Clone();
		hipConstraintLeft.Attachment0 = LeftHipAttachment;
		hipConstraintLeft.Attachment1 = LeftHipAttachment1;
		hipConstraintLeft.Name = "LeftBallSocketConstraint";
		hipConstraintLeft.Parent = Torso;
	}
	createBallSocketConstraints();
	//Disable the original Hip motor6ds
	const RHip = Torso.WaitForChild("Right Hip") as Motor6D;
	const LHip = Torso.WaitForChild("Left Hip") as Motor6D;
	RHip.Enabled = false;
	LHip.Enabled = false;

	const rightLegController = new CCDIKController(RightLegData);
	rightLegController.GetConstraints();
	rightLegController.GetConstraintsFromMotor(RightLegData[0], "RightBallSocketConstraint");

	const leftLegController = new CCDIKController(LeftLegData);
	leftLegController.GetConstraints();
	leftLegController.GetConstraintsFromMotor(LeftLegData[0], "LeftBallSocketConstraint");

	const leftStepAttach = new Instance("Attachment");
	leftStepAttach.Name = "LeftStepAttach";
	leftStepAttach.Position = new Vector3(-0.5, -2.8, 0.1);
	leftStepAttach.Parent = Torso;

	const rightStepAttach = new Instance("Attachment");
	rightStepAttach.Name = "rightStepAttach";
	rightStepAttach.Position = new Vector3(0.5, -2.8, 0.1);
	rightStepAttach.Parent = Torso;

	const rightHipAttach = new Instance("Attachment");
	rightHipAttach.Name = "RightHipAttach";
	rightHipAttach.Position = new Vector3(0.5, -0.9, 0);
	rightHipAttach.Parent = Torso;

	const leftHipAttach = new Instance("Attachment");
	leftHipAttach.Name = "LeftHipAttach";
	leftHipAttach.Position = new Vector3(-0.5, -0.9, 0);
	leftHipAttach.Parent = Torso;

	const r6Legs = new R6Legs(
		rightLegController,
		leftLegController,
		rightHipAttach,
		leftHipAttach,
		rightStepAttach,
		leftStepAttach,
	);

	const params = new RaycastParams();
	params.FilterDescendantsInstances = [character];
	const humanoidRootPart = character.WaitForChild("HumanoidRootPart") as Part;
	const rootMotor = humanoidRootPart.WaitForChild("RootJoint") as Motor6D;
	const animator = new ProceduralAnimator(humanoidRootPart, r6Legs, rootMotor, params);

	const runSound = humanoidRootPart.WaitForChild("Running") as Sound;
	runSound.Volume = 0;
	animator.ConnectFootStepSound();
	// Begin Animation.
	const animationConnection = RunService.PreSimulation.Connect(function (dt) {
		animator.Animate(dt);
	});

	//cleanup when died functions, or root part is destroyed
	const humanoid = character.WaitForChild("Humanoid") as Humanoid;
	humanoid.Died.Connect(function () {
		if (animationConnection) {
			animationConnection.Disconnect();
		}
	});
	humanoid.StateChanged.Connect(function () {
		if (character) {
			const state =
				humanoid.GetState() === Enum.HumanoidStateType.Seated ||
				humanoid.GetState() === Enum.HumanoidStateType.PlatformStanding;
			RHip.Enabled = state;
			LHip.Enabled = state;
		}
	});
}

function givePlayerIK(player: Player) {
	player.CharacterAdded.Connect(giveCharacterIK);
	if (player.Character) {
		giveCharacterIK(player.Character);
	}
}

PlayerService.PlayerAdded.Connect(givePlayerIK);

for (const player of PlayerService.GetPlayers()) {
	givePlayerIK(player);
}

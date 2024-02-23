import CCDIKController from "@rbxts/ccdik-controller";

export class Leg {
	CurrentCycle: number;
	CCDIKController: CCDIKController;
	HipAttachment: Attachment;
	FootAttachment: Attachment;
	TouchedGround: boolean;

	constructor(
		currentCycle: number,
		ccDikController: CCDIKController,
		hipAttachment: Attachment,
		footAttachment: Attachment,
	) {
		this.CurrentCycle = currentCycle;
		this.CCDIKController = ccDikController;
		this.HipAttachment = hipAttachment;
		this.FootAttachment = footAttachment;
		this.TouchedGround = false;
	}
}

export class R6Legs {
	rightLeg: Leg;
	leftLeg: Leg;

	constructor(
		rightLegController: CCDIKController,
		leftLegController: CCDIKController,
		rightHipAttach: Attachment,
		leftHipAttach: Attachment,
		rightStepAttach: Attachment,
		leftStepAttach: Attachment,
	) {
		this.rightLeg = new Leg(0, rightLegController, rightHipAttach, rightStepAttach);
		this.leftLeg = new Leg(math.pi, leftLegController, leftHipAttach, leftStepAttach);
	}
}

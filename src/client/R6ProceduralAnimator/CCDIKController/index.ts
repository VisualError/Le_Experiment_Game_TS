const Debris = game.GetService("Debris"); // for debugging
const RunService = game.GetService("RunService");
const TweenService = game.GetService("TweenService");

import Maid from "./Maid";

class CCDIKController {
	constructor(Motor6Table: Array<Motor6D>, Constraints?: Map<unknown, Map<string, Attachment>>) {
		this.Maid = new Maid();
		this.Motor6Table = Motor6Table;
		if (Constraints) {
			this.Constraints = Constraints;
		}
		[this.JointInfo, this.JointAxisInfo] = this.SetupJoints();
	}
	GetConstraints(): void {
		for (const motor of this.Motor6Table) {
			const motorPart0 = motor.Part0;
			const hingeConstraint = motorPart0?.FindFirstChildWhichIsA("HingeConstraint") as HingeConstraint;
			const ballSocketConstraint = motorPart0?.FindFirstChildWhichIsA(
				"BallSocketConstraint",
			) as BallSocketConstraint;
			if (hingeConstraint) {
				this.Constraints.set(motor, new Map<string, Attachment>());
			}
		}
	}

	GetConstraintsFromMotor(): void {}
	SetupJoints(): [unknown, unknown] {
		const joints = new Map<Motor6D, Attachment>();
		const jointAxisInfo = {};
		for (const motor of this.Motor6Table) {
			//In order to find the joint in world terms and index it fast, only thing that needs to be destroyed
			const attachment = new Instance("Attachment");
			attachment.CFrame = motor.C0;
			attachment.Name = "JointPosition";
			attachment.Parent = motor.Part0;
			joints.set(motor, attachment);
			//self.Maid:GiveTask(attachment) need to implement

			if (this.Constraints) {
				// If it doesn't already have an axis attachment, find one,
				if (this.Constraints.has(motor)) {
					const motorConstraints = this.Constraints.get(motor);
					if (motorConstraints) {
						if (!motorConstraints.has("AxisAttachment")) {
							const AxisAttachment = motor.Part0?.FindFirstChild(
								`${motor.Part0.Name} AxisAttachment`,
							) as Attachment;
							motorConstraints.set("AxisAttachment", AxisAttachment);
						} else {
							const AxisAttachment = motor.Part0?.FindFirstChild(
								`${motorConstraints.get("AxisAttachment")} AxisAttachment`,
							) as Attachment;
							motorConstraints.set("AxisAttachment", AxisAttachment);
						}

						if (!motorConstraints.has("JointAttachment")) {
							const AxisAttachment = motor.Part0?.FindFirstChild(
								`${motor.Part0.Name} JointAttachment`,
							) as Attachment;
							motorConstraints.set("JointAttachment", AxisAttachment);
						} else {
							const AxisAttachment = motor.Part0?.FindFirstChild(
								`${motorConstraints.get("JointAttachment")} JointAttachment`,
							) as Attachment;
							motorConstraints.set("JointAttachment", AxisAttachment);
						}
					}
				}
			}
		}
		return [joints, jointAxisInfo];
	}
	UseLastMotor: boolean = false;
	JointAxisInfo: unknown;
	JointInfo: unknown;
	EndEffector: unknown;
	Constraints = new Map<unknown, Map<string, Attachment>>();
	Motor6Table: Array<Motor6D>;
	Maid: unknown;
}

export default CCDIKController;

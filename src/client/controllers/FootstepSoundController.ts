import { Controller, OnStart } from "@flamework/core";
import ProceduralAnimator from "client/R6ProceduralAnimator/ProceduralAnimator";

@Controller()
export class FootstepSoundController implements OnStart {
	onStart(): void {
		ProceduralAnimator.footStepSound.SoundId = "rbxassetid://5248174126";
	}
}

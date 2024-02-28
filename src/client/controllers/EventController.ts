import { Controller, OnStart } from "@flamework/core";
import { CameraController } from "./CameraController";

@Controller()
export class EventController implements OnStart {
	constructor() {}
	public testNumber = 100;
	onStart(): void {
		this.testNumber = 69;
	}
}

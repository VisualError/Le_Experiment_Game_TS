import { Controller, OnStart } from "@flamework/core";
import { EventController } from "./EventController";

@Controller()
export class SprintController implements OnStart {
	constructor(public eventController: EventController) {}

	onStart(): void {
		print(this.eventController.testNumber);
		this.eventController.testNumber = -100;
	}
}

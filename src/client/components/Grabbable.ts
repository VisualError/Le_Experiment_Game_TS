// import { Component } from "@flamework/components";
// import { OnStart } from "@flamework/core";
// import { assign } from "@rbxts/object-utils";
// import { Assign, CreateInstance } from "shared/Utils";
// import { GameObject } from "shared/abstract/GameObject";
// @Component({
// 	tag: "grabbable.object",
// 	predicate: (instance) => instance.FindFirstChildWhichIsA("ClickDetector") !== undefined,
// })
// export class GrabbableObjectClient extends GameObject<{}, Part> implements OnStart {
// 	onStart(): void {
// 		const clickDetector = this.instance.FindFirstChildWhichIsA("ClickDetector");
// 		if (!clickDetector) return;
// 		print("successfuly started on client!");
// 		this.maid?.GiveTask(
// 			clickDetector.MouseClick.Connect((mouseClick) => {
// 				print("clicked the client!!");
// 			}),
// 		);
// 	}
// }

// unsure if i need this on the client side. oh well.

import { BaseComponent, Component } from "@flamework/components";
import { OnRemove } from "interfaces/CustomInterfaces";
import { GameObject } from "shared/abstract/GameObject";

interface TestAttributes {
	test: string;
}

@Component({
	tag: "test.component",
	defaults: {
		test: "hi",
	},
})
export class TestComponent extends BaseComponent<TestAttributes, Part> implements OnRemove {
	onRemove(): void {
		print("remove");
	}
}

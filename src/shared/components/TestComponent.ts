import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { OnRemove } from "interfaces/CustomInterfaces";

interface TestAttributes {
	test?: string;
}

@Component({
	tag: "test.component",
})
export class TestComponent extends BaseComponent<TestAttributes, Part> implements OnRemove, OnStart {
	onStart(): void {
		this.attributes.test = "test";
	}
	onRemove(): void {
		this.attributes.test = undefined;
	}
}

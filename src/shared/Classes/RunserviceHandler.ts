import Class from "shared/AbstractClasses/ClassAbstract";

class RunserviceHandler extends Class {
	constructor() {
		super();
		print("constructor called");
		this.cache = new Array<string>();
	}
	Start(): void {}
	private cache: Array<string>; // Unique string identifier per each module.
}

export = RunserviceHandler;

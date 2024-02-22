import { IClass } from "interfaces/IClass";

abstract class Class implements IClass {
	Start(): void {
		throw "Method not implemented.";
	}
	Dispose: boolean = false;
}

export = Class;

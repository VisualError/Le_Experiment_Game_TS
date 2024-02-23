import { IClass } from "interfaces/IClass";

abstract class Class implements IClass {
	Start(): void {
		warn(`Start not implemented for ${tostring(this)}`);
	}
}

export = Class;

import { IComponent } from "interfaces/IComponent";
import RunserviceHandler from "shared/Classes/RunserviceHandler";
/**
 * An abstract class that implements the IComponent interface.
 * @param Instance - The instance of the object that inherits from this class.
 */
abstract class AbstractComponent implements IComponent {
	constructor(Instance: Instance) {
		this.Instance = Instance;
		this.Disposed = false;
		this.Threads = new Map<string, thread>();
		if ((this as IComponent).Update !== undefined) {
			RunserviceHandler.Connect("Update", this);
		}
		if ((this as IComponent).FixedUpdate !== undefined) {
			RunserviceHandler.Connect("FixedUpdate", this);
		}
		if ((this as IComponent).LateUpdate !== undefined) {
			RunserviceHandler.Connect("LateUpdate", this);
		}
	}
	Instance: Instance;
	Disposed: boolean;
	Dispose(): void {
		if (this.Disposed) {
			warn(`[${tostring(this)}] Can't disposed an already disposed object!`);
			return;
		}
		RunserviceHandler.Disconnect(this);
		this.Disposed = true;
		for (const [_, thread] of this.Threads) {
			if (coroutine.status(thread) !== "dead") {
				coroutine.close(thread);
				this.Threads.clear();
			}
		}
	}
	StartCoroutine(method: Callback): void {
		const newThread = coroutine.create(method);
		this.Threads.set(`${tostring(this.Instance)}${tostring(method)}`, newThread);
		coroutine.resume(newThread);
	}
	StopCoroutine(): void {}
	Start(): void {}
	//Instance: Instance;
	Threads: Map<string, thread>;
}

export default AbstractComponent;

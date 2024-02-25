import { IComponent } from "interfaces/IComponent";
/**
 * An abstract class that implements the IComponent interface.
 * @param Instance - The instance of the object that inherits from this class.
 */
abstract class AbstractComponent implements IComponent {
	constructor(Instance: Instance) {
		this.Instance = Instance;
		this.Disposed = false;
		this.Threads = new Map<string, thread>();
	}
	Instance: Instance;
	Disposed: boolean;
	Dispose(): void {
		if (this.Disposed) {
			warn(`[${tostring(this)}] Can't disposed an already disposed object!`);
			return;
		}
		this.Disposed = true;
		for (const [_, thread] of this.Threads) {
			if (coroutine.status(thread) !== "dead") {
				coroutine.close(thread);
				this.Threads.clear();
			}
		}
	}
	static Disposed: boolean;
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

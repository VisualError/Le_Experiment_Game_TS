import { IComponent } from "interfaces/IComponent";
/**
 * An abstract class that implements the IComponent interface.
 * @param Instance - The instance of the object that inherits from this class.
 */
abstract class AbstractComponent implements IComponent {
	constructor(Instance: Instance) {
		this.Instance = Instance;
		this.Threads = new Map<string, thread>();
		this.Dispose = false;
	}
	Dispose: boolean;
	StartCoroutine(method: Callback, identifier: string): void {
		const newThread = coroutine.create(method);
		this.Threads.set(identifier, newThread);
		coroutine.resume(newThread);
	}
	StopCoroutine(): void {}
	Start(): void {}
	Destroy(): void {
		this.Dispose = true;
		for (const [_, thread] of this.Threads) {
			if (coroutine.status(thread) !== "dead") {
				coroutine.close(thread);
				this.Threads.clear();
			}
		}
	}
	Instance: Instance;
	Threads: Map<string, thread>;
}

export default AbstractComponent;

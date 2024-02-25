import { IDisposable } from "interfaces/IDisposable";
import Class from "shared/AbstractClasses/ClassAbstract";
import Component from "./Component";
import { IComponent } from "interfaces/IComponent";
const RunService = game.GetService("RunService");
// TODO: Probably need to turn this into a proper singleton.
class RunserviceHandler extends Class implements IDisposable {
	constructor() {
		super();
		print("constructor called");
		this.Disposed = false;
	}
	Dispose(): void {
		this.PreSimulationEvent?.Disconnect();
		this.PreSimulationEvent = undefined;
		this.HeartbeatEvent?.Disconnect();
		this.HeartbeatEvent = undefined;
		RunserviceHandler.FixedUpdateCache.clear();
	}
	Disposed: boolean;
	Start(): void {
		this.PreSimulationEvent = RunService.PreSimulation.Connect((dt) => this.OnPreSimulation(dt));
		this.HeartbeatEvent = RunService.Heartbeat.Connect((dt) => this.OnHeartbeat(dt));
	}
	static Connect(
		this: typeof RunserviceHandler,
		updateType: "Update" | "FixedUpdate" | "LateUpdate",
		Instance: Component,
	): void {
		print("New connection!", Instance);
		switch (updateType) {
			case "Update":
				this.UpdateCache.push(Instance);
				break;
			case "FixedUpdate":
				this.FixedUpdateCache.push(Instance);
				break;
			case "LateUpdate":
				//this.FixedUpdateCache.push(Instance);
				break;
		}
	}
	static Disconnect(
		this: typeof RunserviceHandler,
		Instance: Component,
		updateType?: "Update" | "FixedUpdate" | "LateUpdate",
	): void {
		switch (updateType) {
			case "Update":
				this.UpdateCache.remove(this.UpdateCache.indexOf(Instance));
				break;
			case "FixedUpdate":
				this.FixedUpdateCache.remove(this.FixedUpdateCache.indexOf(Instance));
				break;
			case "LateUpdate":
				//this.FixedUpdateCache.splice(this.FixedUpdateCache.indexOf(Instance), 1);
				break;
			default:
				this.FixedUpdateCache.remove(this.FixedUpdateCache.indexOf(Instance));
				this.UpdateCache.remove(this.UpdateCache.indexOf(Instance));
		}
	}
	OnPreSimulation(deltaTime: number) {
		//print(RunserviceHandler.cache);
		for (const Instance of RunserviceHandler.FixedUpdateCache) {
			(Instance as IComponent).FixedUpdate!(deltaTime);
		}
	}
	OnHeartbeat(deltaTime: number): void {
		for (const Instance of RunserviceHandler.UpdateCache) {
			(Instance as IComponent).Update!(deltaTime);
		}
	}
	private PreSimulationEvent?: RBXScriptConnection;
	private HeartbeatEvent?: RBXScriptConnection;
	static FixedUpdateCache: Array<Component> = new Array<Component>(); // Unique string identifier per each module.
	static UpdateCache: Array<Component> = new Array<Component>(); // Unique string identifier per each module.
}

export = RunserviceHandler;

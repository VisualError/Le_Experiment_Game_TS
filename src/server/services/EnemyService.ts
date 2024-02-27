import { Service, OnStart, OnTick } from "@flamework/core";
@Service()
export class EnemyService implements OnStart, OnTick {
	onTick(dt: number): void {}
	onStart() {}
}

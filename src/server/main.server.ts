import { IClass } from "interfaces/IClass";
import CacheHandler from "shared/Classes/CacheHandler";
import ModuleLoader from "shared/ModuleLoader";

const ReplicatedStorageService = game.GetService("ReplicatedStorage");
const classesFolder = ReplicatedStorageService.FindFirstChild("TS")?.FindFirstChild("Classes");

const Loader = new ModuleLoader(new CacheHandler());
Loader.Init(classesFolder?.GetChildren() as ModuleScript[]);
Loader.Start();

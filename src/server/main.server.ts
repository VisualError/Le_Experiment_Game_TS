import CacheHandler from "shared/Classes/CacheHandler";
import ClassLoader from "shared/ClassLoader";

const ReplicatedStorageService = game.GetService("ReplicatedStorage");

const classesFolder = ReplicatedStorageService.FindFirstChild("TS")?.FindFirstChild("Classes");

const Loader = new ClassLoader(new CacheHandler());
Loader.Init(classesFolder?.GetChildren() as ModuleScript[]);
Loader.Start();

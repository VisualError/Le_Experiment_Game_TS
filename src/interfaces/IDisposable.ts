/**
 * An interface for a disposable class.
 */
export interface IDisposable {
	Dispose(): void;
	Disposed: boolean;
}

/**
 * An interface for a class.
 */
export interface IDisposable {
	Dispose(): void;
	Disposed?: boolean;
}

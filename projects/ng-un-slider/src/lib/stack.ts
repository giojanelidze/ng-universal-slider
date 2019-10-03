export class Stack<T> {
    private _store: T[] = [];
    public get notEmpty(): boolean {
        return this._store.length > 0;
    }
    public get length(): number {
        return this._store.length;
    }

    push(val: T) {
        this._store.push(val);
    }
    pop(): T | undefined {
        return this._store.pop();
    }
}

import { Stack } from './stack';
import { Observable } from 'rxjs';
import { debounceTime, first } from 'rxjs/operators';

export class Queue {
    private _queue: Stack<Function | Observable<Function>> = new Stack<Function | Observable<Function>>();
    private state: 'inprogress' | 'finished' = 'finished';

    private async executeFromQueue() {
        if (this.state === 'inprogress') { return; }
        while (this._queue.notEmpty) {
            const fn = this._queue.pop();
            if (fn instanceof Observable) {
                const _fn = await fn.pipe(first()).toPromise();
                _fn.apply(this);
            } else {
                fn.apply(this);
            }
        }
        this.state = 'finished';
    }

    execute(callback: any, timOut: number = 0) {
        this._queue.push(timOut
            ? new Observable(subscriber => subscriber.next(callback))
                .pipe(debounceTime(timOut))
            : callback
        );
        if (this.state === 'finished') { this.executeFromQueue(); }
    }
}

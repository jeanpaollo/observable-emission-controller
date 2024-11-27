import { Nillable } from "nullish-utils";
import {
  BehaviorSubject,
  delay,
  EMPTY,
  Observable,
  ObservableInput,
  ObservedValueOf,
  Operator,
  OperatorFunction,
  shareReplay,
  switchMap,
  tap,
} from "rxjs";
import { ObservableEmissionController } from "../interfaces";

export class ObservableEmissionControllerImpl<T>
  extends Observable<T>
  implements ObservableEmissionController<T>
{
  static of<T, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O
  ): OperatorFunction<T, ObservedValueOf<O>> {
    return (observable: Observable<T>) =>
      new ObservableEmissionControllerImpl<T>(
        observable.pipe(switchMap(project))
      ) as any;
  }

  private readonly _isWaitingEmission$ = new BehaviorSubject<boolean>(true);

  readonly isWaitingEmission$ = this._isWaitingEmission$.asObservable();

  readonly isWaitingEmissionDelayed$ = this.isWaitingEmission$.pipe(delay(0));

  private readonly _observable$ = new BehaviorSubject<Nillable<Observable<T>>>(
    null
  );

  readonly observable$ = this._observable$.asObservable();

  set observable(value: Nillable<Observable<T>>) {
    this.source = this.observable$.pipe(
      tap(() => this._isWaitingEmission$.next(true)),
      switchMap((observable) => observable || EMPTY),
      tap({
        complete: () => this._isWaitingEmission$.next(false),
        next: () => this._isWaitingEmission$.next(false),
        finalize: () => this._isWaitingEmission$.next(false),
      }),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
    this._observable$.next(value);
  }

  get observable() {
    return this._observable$.value;
  }

  constructor(observable?: Observable<T>) {
    super();
    observable && (this.observable = observable);
  }

  override lift<R>(
    operator: Operator<T, R>
  ): ObservableEmissionControllerImpl<R> {
    const store = new ObservableEmissionControllerImpl<R>(<any>this);
    store.operator = operator;
    return store;
  }
}

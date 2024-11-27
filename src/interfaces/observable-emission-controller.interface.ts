import { Nillable } from "nullish-utils";
import { Observable } from "rxjs";

export interface ObservableEmissionController<T> extends Observable<T> {
  readonly isWaitingEmission$: Observable<boolean>;

  readonly isWaitingEmissionDelayed$: Observable<boolean>;

  readonly observable$: Observable<Nillable<Observable<T>>>;

  observable: Nillable<Observable<T>>;
}

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {combineLatest} from 'rxjs/operator/combineLatest';
import {merge} from 'rxjs/operator/merge';
import {scan} from 'rxjs/operator/scan';
import {getAssociatedActions, hasAssociatedActions} from './associatedActions';

export default function combineReducers(reducerMap) {
  return (preloadedState = {}) => {
    const reducerKeys = Object.keys(reducerMap);
    const actionCollection = new Map();
    const reducerCollection = new Map();
    const reducers = new Array(reducerKeys.length);

    for (let i = 0, len = reducerKeys.length; i < len; i += 1) {
      const key = reducerKeys[i];
      const reducer = reducerMap[key];

      if (typeof reducer !== 'function') {
        throw new Error('Expected reducer to be a function');
      }

      if (hasAssociatedActions(reducer)) {
        const actions = getAssociatedActions(reducer);

        const actor$ = new Subject();
        const reducer$ = Observable::of(preloadedState)
          ::merge(actor$.map(action => state => reducer(state, action)))
          ::scan((state, handler) => handler(state));

        reducers[i] = reducer$;

        for (const action of actions) {
          actionCollection.set(action, actor$);
          reducerCollection.set(reducer, reducer$);
        }
      } else {
        const [
          reducer$,
          combinedActionCollection,
          combinedReducerCollection
        ] = reducer(preloadedState[key]);

        reducers[i] = reducer$;

        for (const item of combinedActionCollection) {
          actionCollection.set(...item);
        }

        for (const item of combinedReducerCollection) {
          reducerCollection.set(...item);
        }
      }
    }

    const reducer$ = Observable::combineLatest(
      ...reducers,
      (...states) => {
        const map = {};

        for (let i = 0, len = states.length; i < len; i += 1) {
          map[reducerKeys[i]] = states[i];
        }

        return map;
      }
    );

    return [reducer$, actionCollection, reducerCollection];
  };
}

import isPlainObject from 'lodash.isplainobject';
import {merge} from 'rxjs/operator/merge';
import {scan} from 'rxjs/operator/scan';

export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  let currentState = preloadedState;
  let [reducer$, actionCollection, reducerCollection] = reducer(currentState);

  const updateCurrentState = state => (currentState = state);

  let subscription = reducer$.subscribe(updateCurrentState);

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      );
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      );
    }

    const actor$ = actionCollection.get(action);
    actor$.next(action);

    return action;
  }

  function findReducerStream(search) {
    return reducerCollection.get(search);
  }

  function addReducer(nextKey, nextReducer) {
    const [nextReducer$, nextActionMap] = nextReducer(currentState);

    reducer$ = reducer$
      ::merge(nextReducer$.map(data => state => (state[nextKey] = data)))
      ::scan((acc, handler) => handler(acc));

    subscription.unsubscribe();
    subscription = reducer$.subscribe(updateCurrentState);

    for (const [action, reducerAndActor$] of nextActionMap) {
      actionCollection.set(action, reducerAndActor$);
    }
  }

  function replaceReducer(nextReducer) {
    const [nextReducer$, nextActionCollection, nextReducerCollection] = nextReducer(currentState);

    reducer$ = nextReducer$;
    subscription.unsubscribe();
    subscription = reducer$.subscribe(updateCurrentState);

    actionCollection = nextActionCollection;
    reducerCollection = nextReducerCollection;
  }

  function subscribe(listener) {
    return reducer$.subscribe(listener);
  }

  return {
    addReducer,
    dispatch,
    getState,
    findReducerStream,
    replaceReducer,
    subscribe
  };
}

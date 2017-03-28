import isPlainObject from 'lodash.isplainobject';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';

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

  const updateCurrentState = state => (currentState = {...currentState, ...state});

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

    if (actionCollection.has(action.type)) {
      const actor$ = actionCollection.get(action.type);
      actor$.next(action);
    } else {
      for (const actor$ of new Set(actionCollection.values())) {
        actor$.next(action);
      }
    }

    return action;
  }

  function getReducerStream(wantedReducer) {
    if (typeof wantedReducer !== 'function') {
      throw new Error('Expected wanted reducer to be a function.');
    }

    return reducerCollection.get(wantedReducer);
  }

  function addReducer(nextReducer) {
    const [nextReducer$, nextActionMap] = nextReducer(currentState);

    reducer$ = Observable::combineLatest(
      reducer$,
      nextReducer$,
      (...states) => Object.assign({}, ...states)
    );

    subscription.unsubscribe();
    subscription = reducer$.subscribe(updateCurrentState);

    for (const [action, reducerAndActor$] of nextActionMap) {
      actionCollection.set(action, reducerAndActor$);
    }
  }

  function replaceReducer(nextReducer, nextPreloadedState = {}) {
    currentState = nextPreloadedState;

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
    getReducerStream,
    replaceReducer,
    subscribe
  };
}

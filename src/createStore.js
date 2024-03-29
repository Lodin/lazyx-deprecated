import isPlainObject from 'lodash/isPlainObject'
import {Observable} from 'rxjs/Observable'
import {combineLatest} from 'rxjs/observable/combineLatest'

export default function createStore (reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  if (!reducer.isCombinedReducer) {
    throw new Error('Expected the reducer to be a product of "combineReducer" function')
  }

  let currentState = preloadedState

  const [reducer$, actionCollection, reducerCollection] = reducer(currentState)

  let currentReducer$ = reducer$

  const updateCurrentState = state => (currentState = {...currentState, ...state})

  let updateSubscription = currentReducer$.subscribe(updateCurrentState)

  function getState () {
    return currentState
  }

  function dispatch (action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (actionCollection.has(action.type)) {
      const actor$ = actionCollection.get(action.type)
      actor$.next(action)
    } else {
      // If the action is undefined whole store will be refreshed and all subscribers will receive
      // this action and return their current state
      for (const actor$ of new Set(actionCollection.values())) {
        actor$.next(action)
      }
    }

    return action
  }

  function getReducerStream (wantedReducer) {
    if (typeof wantedReducer !== 'function') {
      throw new Error('Expected wanted reducer to be a function.')
    }

    if (typeof wantedReducer.associatedActions === 'undefined') {
      throw new Error('Expected wanted reducer to be associated with it\'s actions')
    }

    return reducerCollection.get(wantedReducer)
  }

  function addReducer (nextReducer) {
    const [nextReducer$, nextActionMap] = nextReducer(currentState)

    currentReducer$ = Observable::combineLatest(
      currentReducer$,
      nextReducer$,
      (originalState, nextState) => ({...originalState, ...nextState})
    )

    updateSubscription.unsubscribe()
    updateSubscription = currentReducer$.subscribe(updateCurrentState)

    for (const item of nextActionMap) {
      actionCollection.set(...item)
    }
  }

  function subscribe (listener) {
    const subscription = currentReducer$.subscribe(listener)
    return ::subscription.unsubscribe
  }

  return {
    addReducer,
    dispatch,
    getState,
    getReducerStream,
    subscribe
  }
}

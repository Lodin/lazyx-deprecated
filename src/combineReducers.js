import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'
import {of} from 'rxjs/observable/of'
import {combineLatest} from 'rxjs/observable/combineLatest'
import {map} from 'rxjs/operator/map'
import {merge} from 'rxjs/operator/merge'
import {scan} from 'rxjs/operator/scan'

export default function combineReducers (reducerMap) {
  const combination = (preloadedState) => {
    const reducerKeys = Object.keys(reducerMap)
    const actionCollection = new Map()
    const reducerCollection = new Map()
    const reducers = new Array(reducerKeys.length)

    for (let i = 0, len = reducerKeys.length; i < len; i += 1) {
      const key = reducerKeys[i]
      const reducer = reducerMap[key]

      if (typeof reducer !== 'function') {
        throw new Error('Expected reducer to be a function.')
      }

      if (typeof reducer.associatedActions !== 'undefined') {
        const actions = reducer.associatedActions

        const actor$ = new Subject()

        const initialState = preloadedState && preloadedState[key]
          ? preloadedState[key]
          : reducer(undefined, {})

        const reducer$ = Observable::of(initialState)
          ::merge(actor$::map(action => state => reducer(state, action)))
          ::scan((state, handler) => handler(state))

        reducers[i] = reducer$

        for (const action of actions) {
          actionCollection.set(action, actor$)
          reducerCollection.set(reducer, reducer$)
        }
      } else {
        const initialState = preloadedState ? preloadedState[key] : undefined

        const [
          reducer$,
          combinedActionCollection,
          combinedReducerCollection
        ] = reducer(initialState)

        reducers[i] = reducer$

        for (const item of combinedActionCollection) {
          actionCollection.set(...item)
        }

        for (const item of combinedReducerCollection) {
          reducerCollection.set(...item)
        }
      }
    }

    const reducer$ = Observable::combineLatest(
      ...reducers,
      (...states) => {
        const state = {}

        for (let i = 0, len = states.length; i < len; i += 1) {
          state[reducerKeys[i]] = states[i]
        }

        return state
      }
    )

    return [reducer$, actionCollection, reducerCollection]
  }

  combination.isCombinedReducer = true

  return combination
}

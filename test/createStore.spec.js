import {skip} from 'rxjs/operator/skip';
import createStore from '../src/createStore';
import combineReducers from '../src/combineReducers';
import {createReducers, createAdditionalReducer} from './helpers';

describe('Function "createStore" creates a store that', () => {
  let counter;
  let calculator;
  let finalReducer;

  beforeEach(() => {
    [counter,, calculator] = createReducers();
    finalReducer = combineReducers({
      counter,
      calculator
    });
  });

  describe('is simple and', () => {
    let store;

    beforeEach(() => {
      store = createStore(finalReducer);
    });

    it('should get it\'s own state', () => {
      expect(store.getState()).toEqual({
        counter: 0,
        calculator: 0
      });
    });

    it('should dispatch action', () => {
      store.dispatch({type: 'CALCULATOR_PLUS', payload: 50});
      expect(store.getState()).toEqual({
        counter: 0,
        calculator: 50
      });
    });

    it('should dispatch an unknown action that should call whole store updating', () => {
      let subscriptionCounter = 0;
      const checkState = (state) => {
        expect(state).toEqual(0);
        subscriptionCounter += 1;
      };

      // skipping initial store emitting
      store.getReducerStream(counter)::skip(1).subscribe(checkState);
      store.getReducerStream(calculator)::skip(1).subscribe(checkState);
      store.dispatch({type: 'UNKNOWN'});

      expect(subscriptionCounter).toEqual(2);
    });

    it('should be able to be subscribed', (done) => {
      let subscriptionCounter = 0;
      store.subscribe((state) => {
        switch (subscriptionCounter) {
          case 0:
            expect(state).toEqual({
              counter: 0,
              calculator: 0
            });
            break;
          case 1:
            expect(state).toEqual({
              counter: 0,
              calculator: 50
            });
            done();
            break;
          default:
            break;
        }

        subscriptionCounter += 1;
      });

      store.dispatch({type: 'CALCULATOR_PLUS', payload: 50});
    });

    it('should be able to get a reducer\'s stream', (done) => {
      const reducer$ = store.getReducerStream(counter);

      let subscriptionCounter = 0;
      reducer$.subscribe((state) => {
        switch (subscriptionCounter) {
          case 0:
            expect(state).toEqual(0);
            break;
          case 1:
            expect(state).toEqual(-1);
            done();
            break;
          default:
            break;
        }

        subscriptionCounter += 1;
      });

      store.dispatch({type: 'CALCULATOR_PLUS', payload: 50});
      store.dispatch({type: 'COUNTER_DECREASE'});
    });

    describe('manipulating reducers', () => {
      let letter;

      beforeEach(() => {
        letter = createAdditionalReducer();
      });

      it('should be able to add a reducer', () => {
        store.addReducer(combineReducers({letter}));

        expect(store.getState()).toEqual({
          counter: 0,
          calculator: 0,
          letter: 'foo'
        });
      });

      it('should be able to replace current reducer to a new one', () => {
        const reducer = combineReducers({
          number: finalReducer,
          letter
        });

        store.replaceReducer(reducer);

        expect(store.getState()).toEqual({
          number: {
            counter: 0,
            calculator: 0
          },
          letter: 'foo'
        });
      });
    });
  });

  describe('working with preloaded state', () => {
    it('should be able to receive it', () => {
      const preloadedState = {
        counter: 10,
        calculator: 50
      };

      const store = createStore(finalReducer, preloadedState);

      expect(store.getState()).toEqual(preloadedState);
    });

    it('should be able to contain parts of preloaded state not covered by reducers', () => {
      const preloadedState = {
        counter: 10,
        calculator: 50,
        letter: 'bar'
      };

      const store = createStore(finalReducer, preloadedState);
      expect(store.getState()).toEqual(preloadedState);

      store.dispatch({type: 'COUNTER_INCREASE'});
      expect(store.getState()).toEqual({
        counter: 11,
        calculator: 50,
        letter: 'bar'
      });
    });

    it('should be able to apply preloaded state to newly added reducers', () => {
      const preloadedState = {
        counter: 10,
        calculator: 50,
        letter: 'bar'
      };

      const letter = createAdditionalReducer();

      const store = createStore(finalReducer, preloadedState);
      store.addReducer(combineReducers({letter}));
      expect(store.getState()).toEqual(preloadedState);

      store.dispatch({type: 'LETTER_ADD', payload: 'z'});
      expect(store.getState()).toEqual({
        counter: 10,
        calculator: 50,
        letter: 'barz'
      });
    });

    it('should set the next preloaded state on reducer replacing', () => {
      const preloadedState = {
        counter: 10,
        calculator: 50
      };

      const nextPreloadedState = {
        number: {
          counter: 20,
          calculator: 100
        },
        letter: 'baz'
      };

      const store = createStore(finalReducer, preloadedState);
      expect(store.getState()).toEqual(preloadedState);

      const letter = createAdditionalReducer();

      const reducer = combineReducers({
        number: finalReducer,
        letter
      });

      store.replaceReducer(reducer, nextPreloadedState);
      expect(store.getState()).toEqual(nextPreloadedState);

      store.dispatch({type: 'COUNTER_DECREASE'});

      expect(store.getState()).toEqual({
        number: {
          counter: 19,
          calculator: 100
        },
        letter: 'baz'
      });
    });
  });

  describe('working with enhancers', () => {
    let preloadedState;

    beforeEach(() => {
      preloadedState = {
        counter: 10,
        calculator: 50
      };
    });

    it('should take an enhancer as a third argument', () => {
      const enhancer = originalCreateStore => (...args) => {
        expect(args[0]).toEqual(finalReducer);
        expect(args[1]).toEqual(preloadedState);
        expect(args.length).toEqual(2);
        const originalStore = originalCreateStore(...args);
        return {
          ...originalStore,
          dispatch: jest.fn(originalStore.dispatch)
        };
      };

      const store = createStore(finalReducer, preloadedState, enhancer);
      const action = {type: 'COUNTER_INCREASE'};
      store.dispatch(action);

      expect(store.dispatch).toBeCalledWith(action);
      expect(store.getState()).toEqual({
        counter: 11,
        calculator: 50
      });
    });

    it('should take an enhancer as a third argument', () => {
      const enhancer = originalCreateStore => (...args) => {
        expect(args[0]).toEqual(finalReducer);
        expect(args[1]).toBeUndefined();
        expect(args.length).toEqual(2);
        const originalStore = originalCreateStore(...args);
        return {
          ...originalStore,
          dispatch: jest.fn(originalStore.dispatch)
        };
      };

      const store = createStore(finalReducer, enhancer);
      const action = {type: 'COUNTER_INCREASE'};
      store.dispatch(action);

      expect(store.dispatch).toBeCalledWith(action);
      expect(store.getState()).toEqual({
        counter: 1,
        calculator: 0
      });
    });
  });

  describe('checking the incoming data', () => {
    it('should throw an error if the enhancer is not a function', () => {
      const preloadedState = {
        counter: 10,
        calculator: 50
      };

      expect(() => createStore(finalReducer, preloadedState, {}))
        .toThrow(/Expected the enhancer to be a function/);
    });

    it('should throw an error if the reducer is not a function', () => {
      expect(() => createStore({})).toThrow(/Expected the reducer to be a function/);
    });

    it('should throw an error if dispatched action is not a plain object', () => {
      const store = createStore(finalReducer);
      expect(() => store.dispatch(() => 1)).toThrow(/Actions must be plain objects/);
    });

    it('should throw an error if action type is undefined', () => {
      const store = createStore(finalReducer);
      expect(() => store.dispatch({type: undefined}))
        .toThrow(/Actions may not have an undefined "type" property/);
    });

    it('should not throw if action type is falsy', () => {
      const store = createStore(finalReducer);
      expect(() => store.dispatch({type: false})).not.toThrow();
      expect(() => store.dispatch({type: 0})).not.toThrow();
      expect(() => store.dispatch({type: null})).not.toThrow();
      expect(() => store.dispatch({type: ''})).not.toThrow();
    });
  });
});

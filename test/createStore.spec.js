import {skip} from 'rxjs/operator/skip';
import {createStore, combineReducers} from '../src';
import {counter, calculator, letter} from './helpers/reducers';

describe('Function "createStore" creates a store', () => {
  let finalReducer;

  beforeEach(() => {
    finalReducer = combineReducers({
      counter: counter.reducer,
      calculator: calculator.reducer
    });
  });

  describe('being simple', () => {
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
      store.dispatch(calculator.plus(50));
      expect(store.getState()).toEqual({
        counter: 0,
        calculator: 50
      });
    });

    it('should dispatch an unknown action calling whole store updating', () => {
      let subscriptionCounter = 0;
      const checkState = (state) => {
        expect(state).toEqual(0);
        subscriptionCounter += 1;
      };

      // skipping initial store emitting
      store.getReducerStream(counter.reducer)::skip(1).subscribe(checkState);
      store.getReducerStream(calculator.reducer)::skip(1).subscribe(checkState);
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

      store.dispatch(calculator.plus(50));
    });

    it('should be able to get a reducer\'s stream', (done) => {
      const reducer$ = store.getReducerStream(counter.reducer);

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

      store.dispatch(calculator.plus(50));
      store.dispatch(counter.decrease());
    });

    it('should be able to add a reducer', () => {
      store.addReducer(combineReducers({
        letter: letter.reducer
      }));

      expect(store.getState()).toEqual({
        counter: 0,
        calculator: 0,
        letter: 'foo'
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

      store.dispatch(counter.increase());
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

      const store = createStore(finalReducer, preloadedState);
      store.addReducer(combineReducers({letter: letter.reducer}));
      expect(store.getState()).toEqual(preloadedState);

      store.dispatch(letter.add('z'));
      expect(store.getState()).toEqual({
        counter: 10,
        calculator: 50,
        letter: 'barz'
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
      const action = counter.increase();
      store.dispatch(action);

      expect(store.dispatch).toHaveBeenCalledWith(action);
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
      const action = counter.increase();
      store.dispatch(action);

      expect(store.dispatch).toHaveBeenCalledWith(action);
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

    it('should throw an error if reducer to search a stream is not a function', () => {
      const store = createStore(finalReducer);
      expect(() => store.getReducerStream({}))
        .toThrow(/Expected wanted reducer to be a function/);
    });

    it('should throw an error if reducer to search a stream is not associated with actions',
      () => {
        const fake = () => {};
        const store = createStore(finalReducer);
        expect(() => store.getReducerStream(fake))
          .toThrow(/Expected wanted reducer to be associated with it's actions/);
      });

    it('should throw an error if reducer is not a product of "combineReducer" function', () => {
      expect(() => createStore(calculator.reducer))
        .toThrow(/Expected the reducer to be a product of "combineReducer" function/);
    });

  });
});

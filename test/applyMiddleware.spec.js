import {applyMiddleware, combineReducers, createStore} from '../src';
import thunk from './helpers/middleware';
import {calculator, special} from './helpers/reducers';

describe('Function "applyMiddleware"', () => {
  let reducer;
  let spy;

  beforeEach(() => {
    reducer = combineReducers({calculator: calculator.reducer});
    spy = jest.fn();
  });

  it('should wrap dispatch method with middleware once', () => {
    const test = spyOnMethods => (methods) => {
      spyOnMethods(methods);
      return next => action => next(action);
    };

    const store = applyMiddleware(test(spy), thunk)(createStore)(reducer);

    store.dispatch(calculator.plus(5));
    store.dispatch(calculator.minus(1));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      dispatch: expect.any(Function),
      getState: expect.any(Function)
    });

    expect(store.getState()).toEqual({calculator: 4});
  });

  it('should pass recursive dispatches through the middleware chain', () => {
    const test = spyOnMethods => () => next => (action) => {
      spyOnMethods(action);
      return next(action);
    };

    const store = applyMiddleware(test(spy), thunk)(createStore)(reducer);

    return store.dispatch(special.plusCalculatorAsync(10)).then(() => {
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it('should work with thunk middleware', () => {
    const store = applyMiddleware(thunk)(createStore)(reducer);

    store.dispatch(special.plusCalculatorIfZero(10));
    expect(store.getState()).toEqual({calculator: 10});

    store.dispatch(special.plusCalculatorIfZero(10));
    expect(store.getState()).toEqual({calculator: 10});

    return store.dispatch(special.plusCalculatorAsync(20)).then(() => {
      expect(store.getState()).toEqual({calculator: 30});
    });
  });

  it('should throw an error if there is an attempt to dispatch during middleware initialization',
    () => {
      const earlyDispatch = ({dispatch}) => {
        dispatch(calculator.plus(20));
        return () => action => action;
      };

      expect(() => createStore(reducer, applyMiddleware(earlyDispatch)))
        .toThrow(/Dispatching while constructing your middleware is not allowed/);
    });
});


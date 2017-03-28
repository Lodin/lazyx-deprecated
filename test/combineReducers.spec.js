import {Observable} from 'rxjs/Observable';
import combineReducers from '../src/combineReducers';
import {createReducers} from './helpers';

describe('Function "combineReducers"', () => {
  let counter;
  let calculator;
  let counterActions;

  const startSendingEvents = (actionCollection) => {
    for (const action of counterActions) {
      actionCollection.get(action).next({type: action});
    }

    const calcPlus = {type: 'CALCULATOR_PLUS', payload: 10};
    const calcMinus = {type: 'CALCULATOR_MINUS', payload: 5};
    const calcReset = {type: 'CALCULATOR_RESET'};

    actionCollection.get(calcPlus.type).next(calcPlus);
    actionCollection.get(calcMinus.type).next(calcMinus);
    actionCollection.get(calcReset.type).next(calcReset);
  };

  beforeEach(() => {
    [counter, counterActions, calculator] = createReducers();
  });

  it('should create a high-level reducer to consume received reducers', (done) => {
    const product = combineReducers({
      counter,
      calculator
    });

    const productData = product();
    expect(productData).toEqual([jasmine.any(Observable), jasmine.any(Map), jasmine.any(Map)]);

    const [reducer$, actionCollection, reducerCollection] = productData;

    expect(Array.from(reducerCollection.entries())).toEqual([
      [counter, jasmine.any(Observable)],
      [calculator, jasmine.any(Observable)]
    ]);

    let subscriptionCounter = 0;
    reducer$.subscribe((state) => {
      switch (subscriptionCounter) {
        case 0:
          expect(state).toEqual({
            counter: 0,
            calculator: 0
          });
          break;
        case 1:
          expect(state).toEqual({
            counter: 1,
            calculator: 0
          });
          break;
        case 2:
          expect(state).toEqual({
            counter: 0,
            calculator: 0
          });
          break;
        case 3:
          expect(state).toEqual({
            counter: -1,
            calculator: 0
          });
          break;
        case 4:
          expect(state).toEqual({
            counter: -1,
            calculator: 10
          });
          break;
        case 5:
          expect(state).toEqual({
            counter: -1,
            calculator: 5
          });
          break;
        case 6:
          expect(state).toEqual({
            counter: -1,
            calculator: 0
          });
          done();
          break;
        default:
          break;
      }

      subscriptionCounter += 1;
    });

    startSendingEvents(actionCollection);
  });

  it('should allow to set preloaded state for all reducers', (done) => {
    const product = combineReducers({
      counter,
      calculator
    });

    const preloadedState = {
      counter: 10,
      calculator: 50
    };
    const productData = product(preloadedState);
    expect(productData).toEqual([jasmine.any(Observable), jasmine.any(Map), jasmine.any(Map)]);

    const [reducer$, actionCollection] = productData;

    let subscriptionCounter = 0;
    reducer$.subscribe((state) => {
      switch (subscriptionCounter) {
        case 0:
          expect(state).toEqual({
            counter: 10,
            calculator: 50
          });
          break;
        case 1:
          expect(state).toEqual({
            counter: 11,
            calculator: 50
          });
          break;
        case 2:
          expect(state).toEqual({
            counter: 0,
            calculator: 50
          });
          break;
        case 3:
          expect(state).toEqual({
            counter: -1,
            calculator: 50
          });
          break;
        case 4:
          expect(state).toEqual({
            counter: -1,
            calculator: 60
          });
          break;
        case 5:
          expect(state).toEqual({
            counter: -1,
            calculator: 55
          });
          break;
        case 6:
          expect(state).toEqual({
            counter: -1,
            calculator: 0
          });
          done();
          break;
        default:
          break;
      }

      subscriptionCounter += 1;
    });

    startSendingEvents(actionCollection);
  });

  it('should consume products of lower-level "combineReducer" functions', (done) => {
    const product = combineReducers({
      counterTop: combineReducers({
        counter
      }),
      calculatorTop: combineReducers({
        calculator
      })
    });

    const productData = product();
    expect(productData).toEqual([jasmine.any(Observable), jasmine.any(Map), jasmine.any(Map)]);

    const [reducer$] = productData;

    reducer$.subscribe((state) => {
      expect(state).toEqual({
        counterTop: {
          counter: 0
        },
        calculatorTop: {
          calculator: 0
        }
      });

      done();
    });
  });

  it('should allow to set preloaded state for all reducer tree', (done) => {
    const product = combineReducers({
      counterTop: combineReducers({
        counter
      }),
      calculatorTop: combineReducers({
        calculator
      })
    });

    const preloadedState = {
      counterTop: {
        counter: 10
      },
      calculatorTop: {
        calculator: 50
      }
    };

    const productData = product(preloadedState);
    expect(productData).toEqual([jasmine.any(Observable), jasmine.any(Map), jasmine.any(Map)]);

    const [reducer$] = productData;

    reducer$.subscribe((state) => {
      expect(state).toEqual({
        counterTop: {
          counter: 10
        },
        calculatorTop: {
          calculator: 50
        }
      });

      done();
    });
  });

  it('should throw an error if the reducer is not a function', () => {
    expect(combineReducers({
      counter: {}
    })).toThrow(/Expected reducer to be a function/);
  });
});

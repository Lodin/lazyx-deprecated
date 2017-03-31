import {bindActionCreators, createStore, combineReducers} from '../src'
import {calculator} from './helpers/reducers'

describe('Function "bindActionCreators"', () => {
  let actionCreators
  let store

  beforeEach(() => {
    store = createStore(combineReducers({calculator: calculator.reducer}))
    actionCreators = {
      plus: calculator.plus,
      minus: calculator.minus,
      reset: calculator.reset
    }
  })

  it('should wrap the action creators with the dispatch function', () => {
    const boundActionCreators = bindActionCreators(actionCreators, store.dispatch)
    const action = boundActionCreators.plus(50)

    expect(action).toEqual(actionCreators.plus(50))
    expect(store.getState()).toEqual({calculator: 50})
  })

  it('should skip non-functional values in the passed object', () => {
    const _console = console
    global.console = {warn: jest.fn()}

    const boundActionCreators = bindActionCreators({
      ...actionCreators,
      foo: 'a',
      bar: 1,
      baz: undefined,
      nil: null,
      obj: {}
    }, store.dispatch)

    expect(Object.keys(boundActionCreators)).toEqual(Object.keys(actionCreators))
    expect(global.console.warn).toHaveBeenCalledTimes(5)

    global.console = _console
  })

  it('should support wrapping a single function', () => {
    const boundCalculatorPlus = bindActionCreators(calculator.plus, store.dispatch)
    expect(boundCalculatorPlus(50)).toEqual(calculator.plus(50))
    expect(store.getState()).toEqual({calculator: 50})
  })

  it('should throw an error for an undefined actionCreator', () => {
    expect(() => bindActionCreators(undefined, store.dispatch))
      .toThrow(/bindActionCreators expected an object or a function, instead received undefined/)
  })

  it('should throw an error for a null actionCreator', () => {
    expect(() => bindActionCreators(null, store.dispatch))
      .toThrow(/bindActionCreators expected an object or a function, instead received null/)
  })

  it('should throw an error for a primitive actionCreator', () => {
    expect(() => bindActionCreators('str', store.dispatch))
      .toThrow(/bindActionCreators expected an object or a function, instead received string/)
  })
})

import {associateActions} from '../src/associatedActions';

export function createReducers() {
  const counterActions = ['COUNTER_INCREASE', 'COUNTER_RESET', 'COUNTER_DECREASE'];
  const counter = associateActions((state = 0, action) => {
    switch (action.type) {
      case 'COUNTER_INCREASE':
        return state + 1;
      case 'COUNTER_RESET':
        return 0;
      case 'COUNTER_DECREASE':
        return state - 1;
      default:
        return state;
    }
  }, counterActions);

  const calculatorActions = ['CALCULATOR_PLUS', 'CALCULATOR_MINUS', 'CALCULATOR_RESET'];
  const calculator = associateActions((state = 0, action) => {
    switch (action.type) {
      case 'CALCULATOR_PLUS':
        return state + action.payload;
      case 'CALCULATOR_MINUS':
        return state - action.payload;
      case 'CALCULATOR_RESET':
        return 0;
      default:
        return state;
    }
  }, calculatorActions);

  return [counter, counterActions, calculator, calculatorActions];
}

export function createAdditionalReducer() {
  return associateActions((state = 'foo', action) => {
    switch (action.type) {
      case 'LETTER_ADD':
        return state + action.payload;
      case 'LETTER_REMOVE':
        return state.slice(0, -1);
      default:
        return state;
    }
  }, ['LETTER_ADD', 'LETTER_REMOVE']);
}

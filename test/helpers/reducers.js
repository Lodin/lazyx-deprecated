import {associateActions} from '../../src';

const INCREASE_COUNTER = 'INCREASE_COUNTER';
const RESET_COUNTER = 'RESET_COUNTER';
const DESCREASE_COUNTER = 'DESCREASE_COUNTER';

const counterActions = [INCREASE_COUNTER, RESET_COUNTER, DESCREASE_COUNTER];
const counterReducer = associateActions((state = 0, action) => {
  switch (action.type) {
    case INCREASE_COUNTER:
      return state + 1;
    case RESET_COUNTER:
      return 0;
    case DESCREASE_COUNTER:
      return state - 1;
    default:
      return state;
  }
}, counterActions);

const increaseCounter = () => ({type: INCREASE_COUNTER});
const decreaseCounter = () => ({type: DESCREASE_COUNTER});
const resetCounter = () => ({type: RESET_COUNTER});

const PLUS_CALCULATOR = 'PLUS_CALCULATOR';
const MINUS_CALCULATOR = 'MINUS_CALCULATOR';
const RESET_CALCULATOR = 'RESET_CALCULATOR';

const calculatorActions = [PLUS_CALCULATOR, MINUS_CALCULATOR, RESET_CALCULATOR];
const calculatorReducer = associateActions((state = 0, action) => {
  switch (action.type) {
    case PLUS_CALCULATOR:
      return state + action.payload;
    case MINUS_CALCULATOR:
      return state - action.payload;
    case RESET_CALCULATOR:
      return 0;
    default:
      return state;
  }
}, calculatorActions);

const plusCalculator = payload => ({type: PLUS_CALCULATOR, payload});
const minusCalculator = payload => ({type: MINUS_CALCULATOR, payload});
const resetCalculator = () => ({type: RESET_CALCULATOR});

const ADD_LETTER = 'LETTER_ADD';
const REMOVE_LETTER = 'LETTER_REMOVE';

const letterActions = [ADD_LETTER, REMOVE_LETTER];
const letterReducer = associateActions((state = 'foo', action) => {
  switch (action.type) {
    case ADD_LETTER:
      return state + action.payload;
    case REMOVE_LETTER:
      return state.slice(0, -1);
    default:
      return state;
  }
}, letterActions);

const addLetter = payload => ({type: ADD_LETTER, payload});
const removeLetter = () => ({type: REMOVE_LETTER});

const plusCalculatorAsync = payload => dispatch => new Promise(resolve => setImmediate(() => {
  dispatch(plusCalculator(payload));
  resolve();
}));

const plusCalculatorIfZero = payload => (dispatch, getState) => {
  if (getState().calculator === 0) {
    dispatch(plusCalculator(payload));
  }
};

export const counter = {
  actions: counterActions,
  reducer: counterReducer,
  increase: increaseCounter,
  decrease: decreaseCounter,
  reset: resetCounter
};

export const calculator = {
  actions: calculatorActions,
  reducer: calculatorReducer,
  plus: plusCalculator,
  minus: minusCalculator,
  reset: resetCalculator
};

export const letter = {
  actions: letterActions,
  reducer: letterReducer,
  add: addLetter,
  remove: removeLetter
};

export const special = {
  plusCalculatorAsync,
  plusCalculatorIfZero
};

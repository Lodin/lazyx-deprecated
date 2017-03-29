# lazyx
`Lazyx` is the [Redux](https://github.com/reactjs/redux) made in the fully reactive way. It is 
built on top of [RxJS 5](https://github.com/ReactiveX/rxjs).

## More info
You can get closer with `Redux` reading it's [documentation](https://redux.js.org/) or 
[readme](https://github.com/reactjs/redux/blob/master/README.md) on Github. It is necessary because 
`Lazyx` inherits almost all `Redux` API and shares same ideas. 

## Reason
Why? We already have `Redux`, so why do we need another solution? 

Well, `Redux` is great. It provides a simple scalable architecture, atomic updates and fully 
predictable state management. It is functional, very close to the platform and easy to learn. May be
there are some boilerplate problem, but it is a reasonable pay for the control. 

However, there are several problems created by `Redux` architecture. 

First, `Redux` is a hard-worker. If it consume event, there is no way it stops until all reducers 
it has return their state. If you have 100 reducers, they all will be executed just for a single 
action.
 
Second, `Redux` does not get a permission to subscribe to the specific reducer. If you want to 
subscribe, subscribe to the whole store. It leads to the `React` update problem: if the application 
is subscribed to the whole store, it will be re-rendered on any action any part of the application
emits. 

Third, `Redux` has a problem with code splitting. The only way to update quantity of reducers it 
has is to replace root reducer with new one that has been combined with newly imported reducers. 
But newly added reducer will have it's initial state, and there is no way to predefine it through
the `preloadedState` in during the process of `createStore`.

Yes, these problems (may be except the first) can be solved using different approaches. For the 
second you can use `React` function `shouldComponentUpdate`. For the third the custom action that 
sets state for the newly added reducer. 

However, what if all of these problems would be solved by original architecture? If we would be able
to listen the specific reducer and start it by it's own action? To add a reducer that inspires 
store preloaded state dynamically?

To answer these question, there is `Lazyx`.

## Install
To install Lazyx use the following command
```bash
npm install --save lazyx
```

## Usage
`Lazyx` usage has a several moments that differs to vanilla `Redux`. Let's see where they are.

* Creating reducer. To create a `Lazyx` reducer you have to associate actions with reducer itself.
It can be made with function `associateActions`.
```javascript
import {associateActions} from 'lazyx';

export const INCREASE_COUNTER = 'INCREASE_COUNTER';
export const RESET_COUNTER = 'RESET_COUNTER';
export const DESCREASE_COUNTER = 'DESCREASE_COUNTER';

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

export default counterReducer;
```
* Subscribing to a specific reducer. To perform it you have to use `Store` method 
`getReducerStream`. Just send the reducer you want to subscribe to this method and add a 
subscription callback. The value it produces is the new reducer's state.
```javascript
import {combineReducers, createStore} from 'lazyx';
import counterReducer from './counterReducer';

const store = createStore(combineReducers({counter: counterReducer}));
store.getReducerStream(counterReducer).subscribe((state) => {
  // do everything you need with new reducer's state
});
```
* Adding a dynamically loaded reducer. To perform this action you have to use `Store` method 
`addReducer`. Do not forget to combine it first. 
```javascript
import {combineReducers, createStore} from 'lazyx';
import counterReducer, {INCREASE_COUNTER} from './counterReducer';

const store = createStore(combineReducers({counter: counterReducer}), {
  counter: 20, 
  calculator: 50
});

console.log(store.getState()); // prints `{counter: 20, calculator: 50}`

store.dispatch({type: INCREASE_COUNTER});

console.log(store.getState()); // prints `{counter: 21, calculator: 50}`

function getCalculatorReducer() {
  import('./calculatorReducer.js').then(({default: reducer, PLUS_CALCULATOR}) => {
    store.addReducer(combineReducers({calculator: reducer}));
    console.log(store.getState()); // prints `{counter: 21, calculator: 50}`
    store.dispatch({type: PLUS_CALCULATOR, payload: 50});
    console.log(store.getState()); // prints `{counter: 21, calculator: 100}`
  });
}
```
Preloaded state successfully affected the dynamically added reducer. 

In fact, that's everything by what `Lazyx` differs from `Redux`. You can use the same middlewares 
you use with `Redux` and there is a big chance they will work together.

## Size
There is one case where `Redux` completely wins. It is a bundle size. Minified `Redux` is about 
`7KB` and `Lazyx` is `30KB`. Quite a difference, but it is a unavoidable exchange for the power 
of RxJS.

## Integration with React
To use the `Lazyx` power in integration with `React` you may need the 
[react-lazyx](https://github.com/Lodin/react-lazyx) binding library. 

## License
Lazyx is published under the [MIT license](./LICENSE).
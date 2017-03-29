import compose from './compose';

export default function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.'
      );
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: action => dispatch(action)
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

import compose from './compose';

export default function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let dispatch = store.dispatch;

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

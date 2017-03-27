const symbol = Symbol('associatedActions');

export function associateActions(reducer, actions) {
  reducer[symbol] = Array.isArray(actions) ? actions : [actions];
  return reducer;
}

export function hasAssociatedActions(reducer) {
  return typeof reducer[symbol] !== 'undefined';
}

export function getAssociatedActions(reducer) {
  return reducer[symbol];
}

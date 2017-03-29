export function associateActions(reducer, actions) {
  reducer.associatedActions = Array.isArray(actions) ? actions : [actions];
  return reducer;
}

export function hasAssociatedActions(reducer) {
  return typeof reducer.associatedActions !== 'undefined';
}

export function getAssociatedActions(reducer) {
  return reducer.associatedActions;
}

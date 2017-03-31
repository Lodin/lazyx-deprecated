export default function associateActions (reducer, actions) {
  reducer.associatedActions = Array.isArray(actions) ? actions : [actions]
  return reducer
}

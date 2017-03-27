import {
  associateActions,
  getAssociatedActions,
  hasAssociatedActions
} from '../src/associatedActions';

describe('Function "associateActions"', () => {
  const getSymbol = reducer => Reflect.ownKeys(reducer).filter(key => typeof key === 'symbol')[0];

  it('should associate action list with reducer', () => {
    const actions = ['TEST_ACTION1', 'TEST_ACTION2'];
    const reducer = associateActions(state => state, actions);

    const symbol = getSymbol(reducer);

    expect(reducer[symbol]).toEqual(actions);
  });

  it('should allow to use single action instead of array', () => {
    const action = 'TEST_ACTION';
    const reducer = associateActions(state => state, action);

    const symbol = getSymbol(reducer);

    expect(reducer[symbol]).toEqual([action]);
  });
});

describe('Function "getAssociatedActions"', () => {
  it('should get associated action list from reducer', () => {
    const actions = ['TEST_ACTION1', 'TEST_ACTION2'];
    const reducer = associateActions(state => state, actions);

    expect(getAssociatedActions(reducer)).toEqual(actions);
  });
});

describe('Function "hasAssociated"', () => {
  let actions;

  beforeEach(() => {
    actions = ['TEST_ACTION1', 'TEST_ACTION2'];
  });

  it('should inform if the reducer has no associated actions', () => {
    const reducer = state => state;
    expect(hasAssociatedActions(reducer)).not.toBeTruthy();
  });

  it('should inform if the reducer has associated actions', () => {
    const reducer = associateActions(state => state, actions);
    expect(hasAssociatedActions(reducer)).toBeTruthy();
  });
});

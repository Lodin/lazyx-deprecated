import associateActions from '../src/associateActions';

describe('Function "associateActions"', () => {
  it('should associate action list with reducer', () => {
    const actions = ['TEST_ACTION1', 'TEST_ACTION2'];
    const reducer = associateActions(state => state, actions);
    expect(reducer.associatedActions).toEqual(actions);
  });

  it('should allow to use single action instead of array', () => {
    const action = 'TEST_ACTION';
    const reducer = associateActions(state => state, action);
    expect(reducer.associatedActions).toEqual([action]);
  });
});

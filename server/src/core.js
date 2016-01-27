import {List, Map} from 'immutable';

export function storeInsight(state, insight) {
  return state.get('insights').push(insight);
}

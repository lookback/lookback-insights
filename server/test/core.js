import {expect} from 'chai';
import {List, Map, fromJS} from 'immutable';
import {storeInsight} from '../src/core';

describe('application logic', () => {

  describe('storeInsight', () => {

     it('stores an insight', () => {
       const state = fromJS({
         insights: []
       });
       const insight = fromJS({
         description: 'The menu is hard to find',
         tags: ['bug', 'menu']
       });
       const stateWithInsight = storeInsight(state, insight);
       
       expect(stateWithInsight).to.equal(fromJS({
         insights: [{
           description: 'The menu is hard to find',
           tags: ['bug', 'menu']
         }]
       }));
     });

  });

});

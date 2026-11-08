import test from 'node:test';
import assert from 'node:assert/strict';
import {Uno} from '../server/uno.js';
import {chooseUnoAction} from '../server/bot.js';

test('all robot levels use legal cards from their own hand and complete matches',()=>{
 for(const difficulty of ['easy','medium','hard'])for(let repeat=0;repeat<3;repeat++){
  const game=new Uno([{id:'a'},{id:'b'},{id:'c'}]);
  for(let i=0;i<3000&&!game.winner;i++){
   const id=game.current,view=game.snapshot(id),before=game.save();
   const choice=chooseUnoAction(view,id,difficulty);
   assert.deepEqual(game.save(),before);assert.ok(choice);
   assert.doesNotThrow(()=>game.action(id,choice.action,choice.value));
  }
  assert.ok(game.winner,'robots must finish a complete match');
 }
});
test('medium and hard declare UNO and choose a wild color from their own remaining cards',()=>{
 const view={turn:'a',direction:1,counts:[{id:'a',count:2},{id:'b',count:1}],hand:[{id:'wild',color:'wild',value:'wild',playable:true},{id:'red',color:'red',value:'5',playable:false}]};
 assert.equal(chooseUnoAction(view,'a','medium').action,'unoCall');
 const choice=chooseUnoAction({...view,declared:true},'a','hard',()=>0);
 assert.deepEqual(choice,{action:'unoPlay',value:{cardId:'wild',color:'red'}});
 assert.equal(chooseUnoAction({...view,turn:'b'},'a','hard'),null);
});
test('hard prioritizes interrupting the next player when that player is about to finish',()=>{
 const view={turn:'a',direction:1,declared:true,counts:[{id:'a',count:3},{id:'b',count:1}],hand:[
  {id:'normal',color:'red',value:'2',playable:true},{id:'skip',color:'red',value:'skip',playable:true},{id:'other',color:'red',value:'8',playable:false}
 ]};
 assert.equal(chooseUnoAction(view,'a','hard',()=>0).value.cardId,'skip');
 assert.equal(chooseUnoAction(view,'a','easy',()=>0).value.cardId,'normal');
});

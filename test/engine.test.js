import test from 'node:test';import assert from 'node:assert/strict';import {Uno} from '../server/uno.js';
test('engine preserves the match on restore',()=>{const players=Array.from({length:2},(_,i)=>({id:'p'+i,number:i+1,color:'#64ddff'}));const game=new Uno(players);assert.deepEqual(new Uno(players,game.save()).snapshot(),game.snapshot());});

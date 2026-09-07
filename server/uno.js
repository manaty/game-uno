import { randomInt } from 'node:crypto';
export const UNO_COLORS = ['red','yellow','green','blue'];
export function shuffle(cards) { const result=[...cards];for(let i=result.length-1;i>0;i--){const j=randomInt(i+1);[result[i],result[j]]=[result[j],result[i]];}return result; }
export function makeDeck() {
  const deck=[];let id=0;
  const add=(color,value)=>deck.push({id:String(++id),color,value});
  for(const color of UNO_COLORS){add(color,'0');for(const value of ['1','2','3','4','5','6','7','8','9','skip','reverse','draw2']){add(color,value);add(color,value);}}
  for(let i=0;i<4;i++){add('wild','wild');add('wild','draw4');}return deck;
}
export class Uno {
  constructor(players,saved) {
    this.animationId=0;this.animations=[];this.players=players.map(p=>p.id);this.hands={};this.deck=shuffle(makeDeck());this.discard=[];this.turn=0;this.direction=1;this.drawn=null;this.vulnerable=null;this.declared=[];this.winner=null;this.event={key:'cardsDealt'};
    if(saved){Object.assign(this,structuredClone(saved));return;}
    for(const id of this.players)this.hands[id]=this.deck.splice(-7);
    const first=this.deck.findIndex(c=>/^\d$/.test(c.value));this.discard.push(...this.deck.splice(first,1));this.color=this.discard[0].color;
  }
  record(type,player,card,count){this.animations.push({id:++this.animationId,type,player,...(card?{card:{...card}}:{}),...(count?{count}:{})});this.animations=this.animations.slice(-24);}
  addPlayer(player){this.players.push(player.id);this.hands[player.id]=[];this.drawCards(player.id,7);}
  get current() {return this.players[this.turn];}
  next(steps=1){this.turn=(this.turn+steps*this.direction+this.players.length*steps)%this.players.length;this.drawn=null;}
  drawCards(id,count) {
    const drawn=[];
    for(let i=0;i<count;i++) {
      if(!this.deck.length && this.discard.length>1){const top=this.discard.pop();this.deck=shuffle(this.discard);this.discard=[top];}
      if(!this.deck.length)break;
      const card=this.deck.pop();this.hands[id].push(card);drawn.push(card);
    }
    if(drawn.length)this.record('draw',id,null,drawn.length);
    return drawn;
  }
  playable(id, card) {
    if(!card || this.winner || this.current!==id || (this.drawn && this.drawn!==card.id))return false;
    if(card.value==='draw4')return !this.hands[id].some(c=>c.color===this.color);
    return card.color==='wild'||card.color===this.color||card.value===this.discard.at(-1).value;
  }
  action(id, action, value = {}) {
    if(!this.hands[id] || this.winner)throw new Error('gameUnavailable');
    if(action==='unoCall') {
      if(this.hands[id].length!==1 && !(this.current===id&&this.hands[id].length===2))throw new Error('unoNotYet');
      if(!this.declared.includes(id))this.declared.push(id);
      if(this.vulnerable===id)this.vulnerable=null;
      this.event={key:'unoCalled',player:id};return;
    }
    if(action==='unoCatch') {
      if(!this.vulnerable || this.vulnerable===id || value.target!==this.vulnerable)throw new Error('unoNoCatch');
      this.drawCards(this.vulnerable,2);this.event={key:'unoPenalty',player:this.vulnerable};this.vulnerable=null;return;
    }
    if(id!==this.current)throw new Error('notYourTurn');
    if(action==='unoDraw') {
      if(this.drawn)throw new Error('alreadyDrawn');
      this.vulnerable=null;this.declared=this.declared.filter(p=>p!==id);
      const cards=this.drawCards(id,1);this.event={key:'cardDrawn',player:id};
      if(cards.length && this.playable(id,cards[0]))this.drawn=cards[0].id;else this.next();
      return;
    }
    if(action==='unoPass') {
      if(!this.drawn)throw new Error('drawBeforePass');
      this.vulnerable=null;this.next();this.event={key:'turnPassed',player:id};return;
    }
    if(action!=='unoPlay')throw new Error('invalidGameAction');
    const hand=this.hands[id], index=hand.findIndex(c=>c.id===value.cardId), card=hand[index];
    if(!this.playable(id,card))throw new Error('cardNotPlayable');
    if(card.color==='wild'&&!UNO_COLORS.includes(value.color))throw new Error('chooseColor');
    this.vulnerable=null;hand.splice(index,1);this.discard.push(card);this.record('play',id,card);this.color=card.color==='wild'?value.color:card.color;
    if(hand.length===1&&!this.declared.includes(id))this.vulnerable=id;
    this.declared=this.declared.filter(p=>p!==id);
    let skip=card.value==='skip'?2:1;
    if(card.value==='reverse'){this.direction*=-1;if(this.players.length===2)skip=2;}
    this.next();
    if(['draw2','draw4'].includes(card.value)) {this.drawCards(this.current,card.value==='draw2'?2:4);this.next();}
    else if(skip===2)this.next();
    this.event={key:'cardPlayed',player:id};
    if(!hand.length){this.winner=id;this.vulnerable=null;this.event={key:'cardsWon',player:id};}
  }
  snapshot(playerId) {
    return {animations:this.animations,top:this.discard.at(-1),color:this.color,turn:this.current,direction:this.direction,winner:this.winner,counts:this.players.map(id=>({id,count:this.hands[id].length})),vulnerable:this.vulnerable,event:this.event,
      ...(playerId&&this.hands[playerId]?{hand:this.hands[playerId].map(card=>({...card,playable:this.playable(playerId,card)})),canDraw:this.current===playerId&&!this.drawn&&!this.winner,canPass:this.current===playerId&&Boolean(this.drawn)&&!this.winner,declared:this.declared.includes(playerId)}:{})};
  }
  release() {}
  save(){return structuredClone({...this});}
}

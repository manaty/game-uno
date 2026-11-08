import {randomInt} from 'node:crypto';

// Deliberately takes only this player's snapshot, never the engine or other hands.
export function chooseUnoAction(view,id,difficulty='medium',random=randomInt){
 if(view.winner||!view.hand)return null;
 const choose=items=>items[random(items.length)];
 if(difficulty!=='easy'&&view.vulnerable&&view.vulnerable!==id)
  return {action:'unoCatch',value:{target:view.vulnerable}};
 if(view.turn!==id)return null;
 if(!view.declared&&view.hand.length===2&&difficulty!=='easy')return {action:'unoCall'};
 const cards=view.hand.filter(card=>card.playable);
 if(!cards.length)return view.canDraw?{action:'unoDraw'}:view.canPass?{action:'unoPass'}:null;
 let card;
 if(difficulty==='easy')card=choose(cards);
 else{
  const count=color=>view.hand.filter(c=>c.color===color).length;
  const next=view.counts[(view.counts.findIndex(p=>p.id===id)+view.direction+view.counts.length)%view.counts.length];
  const value=c=>{
   let score=count(c.color)*3+(c.color==='wild'?-5:0);
   if(difficulty==='hard'){
    if(next?.count<=2&&['skip','reverse','draw2','draw4'].includes(c.value))score+=25;
    score+=({draw4:3,draw2:2,skip:1,reverse:1}[c.value]||0);
    if(view.hand.length===1)score+=100;
   }
   return score;
  };
  const best=Math.max(...cards.map(value));card=choose(cards.filter(c=>value(c)===best));
 }
 let color;
 if(card.color==='wild'){
  const colors=['red','yellow','green','blue'];
  if(difficulty==='easy')color=choose(colors);
  else{const counts=colors.map(c=>view.hand.filter(other=>other.id!==card.id&&other.color===c).length),best=Math.max(...counts);color=choose(colors.filter((c,i)=>counts[i]===best));}
 }
 return {action:'unoPlay',value:{cardId:card.id,...(color?{color}:{})}};
}

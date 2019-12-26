<template lang="html">
  <div class="main-container">
    <Modal v-show="showModal"/>
    <div class="chessboard">
      <Square v-for="n in board" :index="n.index" :key="n.index" :move="n.move" :piece="n.piece" :onMoveClicked="onMoveClicked" :showMoves="toggleMoves"  :onFinishedMoving="onFinishedMoving" />
    </div>
    <div class="side-bar">
      <div class="graveyard">
        Graveyard Enemy
      </div>
      <Timer :remaining="timer.times[1]" :starting="timer.starting"/>
      <div class="button-bar">
        <button type="button" name="button" @click="undoAnimation()" :disabled="animIndex <= 0">Undo</button>
        <button type="button" name="button" @click="redoAnimation()" :disabled="animIndex === animationList.length">Redo</button>
        <button type="button" name="button" @click="resetGame()" :disabled="animationList.length < 1"> ResetGame</button>
        <div class="chessboard__status-list">
      </div>
      </div>
      <Timer :remaining="timer.times[0]" :starting="timer.starting" />
      <div class="graveyard">
        Graveyard Player
      </div>
    </div>
  </div>
</template>
<script>
import Square from "./Square.vue";
import Modal from "./Modal.vue";
import Vue from 'vue';
import Timer from './Timer.vue';
import enemyAudio from '@/assets/enemykill.ogg';
import allyAudio from '@/assets/allykill.ogg';
import {Board} from '@/gamelogic/board.js'
 let BLACK = true;
 function defaultState()
 {
  let boardseed = [];
  let pieces = [{type:"pawn", color: "white", pos: 0, moves: [10,63,19]}, {type:"pawn", color:"white" ,pos: 8, moves:[8,16,24]},
   {type:"castle", color:"white", pos:16, moves:[23,16,56]}, {type:"pawn", color:"black", pos: 23, moves:[8, 32]}, {type:"horse", color:"black", pos: 44, moves:[5, 43]}];
  for(let k = 0; k < 64; k++)
  {
    boardseed.push({piece: null, move: null, index: k});
  }
  pieces.forEach((item)=>
  {
    boardseed[item.pos].piece = {...item};
  });
  return{
    board: boardseed,
    bord: new Board(),
    moving_queue: [],
    showModal: false,
    interval: null,
    timer: {times: [635, 620], starting: 640},
    orientation: BLACK,
    animationList: [],
    animIndex: 0,
    permissions: false,
  }
  }


export default {
  components:{Square, Modal, Timer},
  // props:{
  //   boardSeed:{
  //   type: Object,
  //   default: function(){ return defaultBoard }
  //   }
// },
  data(){
    return defaultState()
  },
  watch:{
    animIndex()
    {
      clearInterval(this.interval);
      this.orientation = !this.orientation;

      this.interval = setInterval(()=>{
        let index = (this.orientiation ? 0 : 1);
        console.log(index,this.orientation, "HREJRJL");
        Vue.set(this.timer.times, index, this.timer.times[index] - 1);
      }, 1000);
    }
  },
  created(){
    this.interval = setInterval(()=>{
      let index = this.orientation ? 0 : 1;
      Vue.set(this.timer.times, index, this.timer.times[index] - 1);
    }, 1000);
  },

  computed:{
    graveyard(){
      return this.animationList.slice(0, this.animIndex).map(item => item.deleted).filter(item=>item);
    }
  },
  methods:
  {
    toggleMoves(piece=null)
    {
      if (piece){
        let moves = piece.show_moves();
        this.board = this.board.map((square) => moves.includes(square.index) ?  {...square, move: piece.pos} : {...square, move: null});
      }
      else
        this.board = this.board.map((square) => {return {...square, move: null}});
    },


    // TODO: I could possibly play an animation here if I wanted to as all required info is here.
    onMoveClicked(origin, dest, add=true, recovered=null)
    {
      if (origin === null || dest === null)
        return
      let hor  = dest%8 - origin%8;
      let vert = Math.floor(dest/8) - Math.floor(origin/8);
      let deleted = this.board[dest].piece ? {...this.board[dest].piece} : null;


      if(add)
      {
        this.animationList.splice(this.animIndex,(this.animationList.length - this.animIndex),{origin: dest, dest: origin, deleted: deleted});
        this.animIndex++;
      }
      let moving = {hor: hor, vert: vert, origin: origin, dest: dest, recovered: recovered, deleted: deleted, announce: add};
      this.addToQueue({...moving});
      this.toggleMoves();
    },
    //TODO: LULW. Probably should be its own class
    setAnnouncement(piece){
      console.log(piece.type + " FUCKING DESTROYED");
      if(piece.color == "white"){
        let audio = new Audio(enemyAudio);
        audio.play();
      }
      else{
        let audio = new Audio(allyAudio);
        audio.play();
      }
    },
    onFinishedMoving(piece)
    {
      let dest = piece.moving.dest;
      let origin = piece.moving.origin;
      piece.pos = dest;
      this.board[dest].piece = piece;
      console.log(piece.moving.recovered, "REC")
      this.board[origin].piece = piece.moving.recovered;
      if(piece.moving.announce && piece.moving.deleted){
        this.setAnnouncement({...piece.moving.deleted});
      }
      Vue.delete(piece, 'moving');
      this.updateQueue();
    },
    //WARNING: Make sure that the animations happen in sequence, since code is async, create a animated queue, after each animation is finished it removes itself from the queue and lets the next animation play.

    addToQueue(movingObject)
    {
      if(this.moving_queue.length === 0)
      {
        this.moving_queue.push(movingObject);
        let piece = this.board[movingObject.origin].piece;
        Vue.set(piece, 'moving', movingObject);
      }
      else{

        this.moving_queue.push(movingObject);
      }
    },
    updateQueue()
    {

      this.moving_queue.shift();

      if(this.moving_queue.length > 0)
      {

        let movingObject = this.moving_queue[0];
        let piece = this.board[movingObject.origin].piece;
        setTimeout(()=>{  Vue.set(piece, 'moving', movingObject);
      }, 200);
      }
    },
    // TODO: Send info over network to ensure that a player agrees to undo and redo.
    undoAnimation(){
      if (this.permissions){
        this.showModal = true
      }
      if (this.animIndex > 0)
      {
        let {origin, dest, deleted} = this.animationList[this.animIndex-1];
        this.onMoveClicked(origin, dest, false, deleted);
        this.animIndex--;
      }
    },
    redoAnimation(){
      if (this.permissions){
        this.showModal = true
      }
      if (this.animIndex < this.animationList.length)
      {
        let {origin, dest} = this.animationList[this.animIndex];
        this.onMoveClicked(dest, origin, false);
        this.animIndex++;
      }
    },
    resetGame(){
      if (this.permissions){
        this.showModal = true
      }
      while(this.animIndex > 0){
        this.undoAnimation();
      }
      this.animationList.splice(0, this.animationList.length);
    }
  },
}
</script>

<style lang="css" scoped>
  .main-container{
    position:relative;
    width: 50rem;
    height: 50rem;

  }
  .graveyard{
    margin: 1rem;
    height: 4rem;
  }
  .chessboard
  {
    display:grid;
    width: 40rem;
    height: 40rem;
    grid-template: repeat(8, 1fr) / repeat(8, 1fr);
    grid-area: 2 / 2 / span 8 / span 8;
  }
  .chessboard__status-list{
    height: 4rem;
  }
  .button-bar{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .side-bar{
    box-shadow: 2px 2px 2px 2px rgba(0,0,0,0.2);
    background-color: lightgrey;
  }
</style>

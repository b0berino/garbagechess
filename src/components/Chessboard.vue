<template lang="html">
  <div class="main-container">
    <div  v-if="board" class="chessboard">
      <Modal v-show="showModal" :callback = "modalCallback" :promo="choose_promo" :status ="modalStatus" @hideModal="hideModal()" @onChoosePromo="onPromotion($event)">
      </Modal>
      <Square v-for="n in board" :index="n.index" :key="n.index" :move="n.move" :piece="n.piece" :onMoveClicked="onMoveClicked" :showMoves="toggleMoves"  :onFinishedMoving="updateQueue" :color="playerColor" />
    </div>
    <div class="side-bar">
      <div class="graveyard">
        Graveyard Enemy
      </div>
      <div class="side-bar__status_list">
      </div>
      <div class="button-bar">
        <button class="button-bar__button" type="button" name="button" @click="createModal(
          'Are you sure you want to undo last move?', () => undo(1))" :disabled="animIndex <= 0">Undo</button>
        <button class="button-bar__button" type="button" name="button" @click="createModal('Are you sure you want to redo last move?',()=>redo(1))" :disabled="animIndex === animList.length"> Redo </button>
        <button class="button-bar__button" type="button" name="button" @click="createModal('Are you sure you want to restart the game?', ()=> {undo(animIndex).then(()=> animList=[])})" :disabled="animList.length < 1 || animIndex < 1"> ResetGame</button>
        <div class="chessboard__status-list">
      </div>
      </div>
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
// import Timer from './Timer.vue';
import {mapGetters, mapActions, mapState} from 'vuex';
// import enemyAudio from '@/assets/enemykill.ogg';
// import allyAudio from '@/assets/allykill.ogg';
import {createPiece} from '@/gamelogic/board.js';
// let WHITE = true;
let BLACK = false;
 function defaultState()
 {
  return{
    moving_queue: [],
    interval: null,
    showModal: false,
    modalCallback: null,
    modalStatus: null,
    timer: {times: [635, 620], starting: 640},
    orientation: BLACK,
    permissions: false,
    choose_promo: false,
  }
}


export default {
  components:{Square, Modal},
  data()
  {
    return defaultState()
  },
  watch:{
    animIndex(newVal, oldVal)
    {
    //   clearInterval(this.interval);
    //   this.orientation = !this.orientation;
    //
    //   this.interval = setInterval(()=>{
    //     let index = (this.orientiation ? 0 : 1);
    //     console.log(index,this.orientation, "HREJRJL");
    //     Vue.set(this.timer.times, index, this.timer.times[index] - 1);
    //   }, 1000);
      this.toggleMoves();
      this.returnAnimations(oldVal).then(result => this.addToQueue(result));
    }
  },
  created()
  {
    this.interval = setInterval(()=>
    {
      let index = this.orientation ? 0 : 1;
      Vue.set(this.timer.times, index, this.timer.times[index] - 1);
    }, 1000);
    this.initialize();
  },

  computed:{
    ...mapState(['turn', 'playerColor']),
    ...mapState('animations', ['animIndex','animList']),
    ...mapGetters('animations',['white_graveyard', 'black_graveyard']),
    ...mapGetters('board', ['board']),
   },
  methods:
  {
    // TODO: I could possibly play an animation here if I wanted to as all required info is here.
    ...mapActions('board',['initialize', 'setPiece', 'toggleMoves', 'endMoving', 'calculate_moves']),
    ...mapActions('animations', ['undo', 'redo', 'addAnimation', 'returnAnimations']),
    onMoveClicked(move)
    {
      this.toggleMoves();
      this.addAnimation(move);
    },
    //WARNING: Make sure that the animations happen in sequence, since code is async, create a animated queue, after each animation is finished it removes itself from the queue and lets the next animation play.

    addToQueue(actions)
    {
      if(this.moving_queue.length === 0)
      {
        this.moving_queue = actions;
        this.setPiece(this.moving_queue[0]);
      }
      else
      {
        this.moving_queue = this.moving_queue.concat(actions);
      }
    },
    hideModal(){
      this.showModal = false;
    },

    updateQueue()
    {
      const move = this.moving_queue[0];
      if(move.promo && !move.chosen){
        console.log("REEEEEEEE WAIT WHAT?")
        this.choose_promo = true;
        this.callback = null;
        this.showModal = true;
        return;
      }
      this.moving_queue.shift();
      this.endMoving(move).then(() => {

        if(this.moving_queue.length > 0)
        {
          this.setPiece(this.moving_queue[0]);
        }
        else
        {
          this.calculate_moves();
        }
      }

      )
    },

    createModal(status, callback){
      this.modalStatus = status;
      this.modalCallback = callback;
      this.showModal = true;
    },
    onPromotion(tag)
    {
      this.moving_queue[0].chosen = createPiece(tag, this.moving_queue[0].demo.color, this.moving_queue[0].destination);
      console.log(this.moving_queue[0])
      this.updateQueue();
      this.showModal = false;
      this.choose_promo = false;
    }
  },
}
</script>

<style lang="css" scoped>
  .main-container{
    position:relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .graveyard
  {
    margin: 1rem;
    height: 4rem;
  }
  .chessboard
  {
    display:grid;
    position: relative;
    width: 50rem;
    height: 50rem;
    grid-template: repeat(8, 1fr) / repeat(8, 1fr);
    grid-area: 2 / 2 / span 8 / span 8;
  }
  .sidebar__status-list
  {
    height: 20rem;
    width: 10rem;
    background: white;
    border: 2px solid black;
  }
  .button-bar
  {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .button-bar__button{
    padding: 1rem;
  }
  .side-bar
  {
    /* box-shadow: 2px 2px 2px 2px rgba(0,0,0,0.2); */
    background-color: lightgrey;
    height: 50rem;
    width: 18rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>

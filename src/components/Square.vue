<template>
  <div :class="activeClass" @click="showMoves()">
    <Piece v-if="piece" :piece="piece" :playerColor="color" :showMoves="showMoves" @finishedMoving="onFinishedMoving($event)"/>
    <transition name="bounce">
      <div :class="moveClass" v-if="move !== null" @click.once="onMoveClicked(move)"></div>
    </transition>
  </div>
</template>

<script>
import Piece from '@/components/Piece.vue'
export default {
  props:{
    index: Number,
    move: Object,
    onMoveClicked: Function,
    piece: Object,
    showMoves: Function,
    onFinishedMoving: Function,
    color: Boolean
  },
  components:{
    Piece
  },
  computed: {
    activeClass()
    {
      if((this.index + parseInt((this.index) / 8) ) % 2)
        if(this.color)
          return "chessboard__square";
        else
          return "chessboard__square--alternate";
      if(this.color)
          return "chessboard__square--alternate";
      else
          return "chessboard__square";
    },
    moveClass()
    {
      if(this.piece && this.move)
        return "chessboard__move--targeted"
      else
        return "chessboard__move"
    }
  },
  methods:{

  }
}
</script>


<style lang="css" scoped>
  .chessboard__square, .chessboard__square--alternate{
    display: flex;
    justify-content: center;
    align-items: center;
    grid-area: span 1 / span 1;
    background: rgb(83, 64, 47);
    position: relative;
  }
  .chessboard__square--alternate{
    background: rgb(159, 155, 53);
  }
  .chessboard__move{
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 100%;
    background: orange;
    cursor: pointer;
  }
  .chessboard__move--targeted{
    position: absolute;
    z-index: 3;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 1.5px solid red;
    cursor: pointer;
  }

.bounce-enter-active {
  animation: bounce-in .45s;
}


/* TODO: Time the leave animation with the speed of the pieces to ensure no lag */

.bounce-leave-active {
  animation: bounce-in .25s reverse;
}
@keyframes bounce-in{
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>

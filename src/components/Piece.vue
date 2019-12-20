<template>
  <div class="container">
      <transition @enter="enter" @after-enter="afterEnter" :css="false">
        <div v-show="piece.moving" :class="pieceClass"></div>
      </transition>
    <div v-show="!piece.moving" :class="pieceClass" @click.stop="showMoves(piece)"></div>
  </div>
</template>

<script>
export default {
  props:{
    showMoves: Function,
    piece: Object
  },
  computed:{
    pieceClass(){
      let s = this.piece.color == "white" ? "white" : "black";
      let type = this.piece.type;
      return type +  " " + s;
    }
  },



  methods:{
    enter(el,done){

      let vertconst = this.piece.moving.vert * 100;
      let horconst  = this.piece.moving.hor * 100;
      let hordelt = parseInt(horconst / 20);
      let vertdelt = parseInt(vertconst / 20);
      let hor = 0;
      let vert  = 0;
      let orientation = this.piece.moving.orientation || 1;
      const interval = setInterval(()=>{
          if(Math.abs(vert - vertconst) <= 0 && Math.abs(hor - horconst) <= 0){
            clearInterval(interval);
            done();
          }
          else
          {
            if (Math.abs(vert - vertconst) > 0)
              vert += vertdelt;
            if (Math.abs(hor - horconst) > 0)
              hor += hordelt;
            el.style.top  = orientation * vert + "%";
            el.style.left = orientation * hor + "%";
          }
      }, 20);
    },
    afterEnter()
    {
      this.$emit("finishedMoving", this.piece);
    }
  }
}
</script>

<style lang="css" scoped>
.chessboard__piece, .chessboard__piece--move, .pawn, .castle
{
  background: rgb(5, 35, 52);
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 100%;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.castle{
    border-radius: 0%;
    height: 1.25rem;
}
.horse{
  height: 0;
  width: 0;
  border-left: 0.75rem solid transparent;
  border-bottom: 1.5rem solid transparent;

}

.black{
  background: black;
  border-color: black;
}
.white{
  background: white;
  border-color: white;
}


  .container{

    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  .chessboard__piece--move{
    background: rgb(28, 21, 111);
    cursor: none;
  }
  .bounce-enter-active {
  animation: bounce-in .45s;
}
.bounce-leave-active {
  animation: bounce-in .45s reverse;
}
@keyframes bounce-in{
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(2.5);
  }
  100% {
    transform: scale(1);
  }
}

</style>

<template lang="html">
  <div class="main-container">
    <div  v-for="piece in graveyard" :class="pieceClass" />
  </div>
</template>

<script>
export default {
  props:
  {
    graveyard: Object
  }
  computed:{
    pieceClass(){

    }
  }
}
</script>

<style lang="css" scoped>
  .main-container{
    display: flex;
    justify-content: space-around;
    width: 10rem;
    height: 4rem;
  }
</style>

<template lang="html">
  <div class="main-view">
    <Chessboard />
  </div>
</template>

<script>
import Chessboard from "@/components/Chessboard.vue";
export default {
  components:{
    Chessboard
  }
}
</script>

<style lang="css" scoped>

  .main-view{
    display: grid;
    grid-template:  repeat(12, 1fr), repeat(12, 1fr);
    width: 100%;
    height: 100%;
    margin: auto;
  }

</style>

<template lang="html">
  <div class="status-list">

  </div>
</template>

<script>
import convertToAlgebra from "@/gamelogic/chessnotation";
export default{
  props:
  {
    statusList: Object,
    board: Object,
    
  }
}
</script>

<style lang="css" scoped>
  .status-list{
    height: 10rem;
    width: 10rem;
    background: white;
  }
</style>

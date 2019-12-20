<template lang="html">
  <div class="modal">
    <div class="description">
      Waiting for Player...
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="css" scoped>

  .modal{
    position:absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
  }
  .description{
    background: white;
    color: black;
    text-align: center;
    font-size: 2rem;
  }
</style>

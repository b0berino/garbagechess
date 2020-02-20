<template lang="html">
  <div class="modal" v-show="showModal">
    <div class="description">
      {{status}}
    <div class="promo" v-if="promo">
      <div class="white queen playable" @click="choosePromo('queen')">
      </div>
      <div class="white horse playable" @click="choosePromo('horse')">
      </div>
      <div class="white castle playable" @click="choosePromo('rook')">
      </div>
      <div class="white bishop playable" @click="choosePromo('bishop')">
      </div>
    </div>
    <div class="bar" v-else-if="callback">
      <button type="button" name="button" @click="execute()">Yes</button>
      <button type="button" name="button" @click="decline()"> No</button>
    </div>
    <div v-else>
      <button type="button" name="button" @click="decline()">Cancel</button>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  props:{
    status: String,
    callback: Function,
    showModal: Boolean,
    promo: Boolean,
  },
  methods:{
    execute()
    {
      this.callback();
      this.$emit("hideModal");
    },
    decline()
    {
      this.$emit("hideModal");
    },
    choosePromo(selection)
    {
      console.log("what the fuck")
      this.$emit("onChoosePromo", selection);
    }
  }
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
    background: lightgrey;
    color: black;
    text-align: center;
    font-size: 2rem;
  }
  .promo{
    display: flex;
    justify-content: space-around;
    width: 4rem;
    align-items: center;
    height: 4rem;
  }
</style>

<template lang="html">
  <div class="timer-back">
    <div class="timer-remaining">
    </div>
    <div class="timer">
      <span>{{timerLabel}}</span>
    </div>
  </div>

</template>

<script>
export default {
  props:{
    starting:{
      type: Number,
      default: 0,
    },
    remaining:{
      type: Number,
      default: 0,
    }
  },
  computed:{
    timerLabel()
    {
      let minute = parseInt(this.remaining / 60);
      let second = this.remaining % 60;
      return minute + ":" + (second >= 10 ? second : "0" + second);
    },
    progress()
    {
      return (100 * (this.starting - this.remaining)/this.remaining) + "%";
    }
  }
}
</script>

<style lang="css" scoped>
  .timer-back{
    position: relative;
    height: 7.5rem;
    width:  7.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: grey;
    border-radius: 100%;
    margin: auto;
  }
  .timer-remaining{
    position: absolute;
    top: 0;
    background: green;
    width: 10%;
    height: 50%;
    border-radius: 100%;
  }

  .timer{
    font-size: 2.5rem;
    position: relative;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 100%;
    height: 7rem;
    width: 7rem;
    background: orange;
  }


</style>

<template>
  <div id="app" class="app">
    helloworld
  </div>
</template>

<script>
export default {

}
</script>

<style lang="stylus">
@import "./style/base.styl"
</style>

<style lang="stylus" scoped>
@import "./style/mixins.styl"
.app
  color $primary-600
span
  color red
body
  background red
</style>

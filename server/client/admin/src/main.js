
import Vue from 'vue'
import App from './App.vue'


Vue.config.productionTip = false
Vue.config.devtools = true

// For client addons
window.Vue = Vue

const app = new Vue({
  ...App
})

app.$mount('#app')

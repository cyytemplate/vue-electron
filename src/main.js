import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
const electron = require('electron')

Vue.config.productionTip = false
Object.defineProperty(Vue.prototype, '$electron', { value: electron })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

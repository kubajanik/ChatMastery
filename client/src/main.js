import Vue from 'vue';
import App from './App.vue';
import VueSocketIO from 'vue-socket.io';
import VueScroll from 'vuescroll';
import Vuebar from 'vuebar';

Vue.use(Vuebar);

window.location.hash = '';

Vue.use(VueScroll, {
  ops: {
    bar: {
      size: 0
    }
  }
});

const baseUrl = (process.env.NODE_ENV == 'development' ? 'http://localhost:8080' : '')
Vue.prototype.$baseUrl = baseUrl;

Vue.use(new VueSocketIO({
  connection: baseUrl
}));

Vue.config.productionTip = false;

new Vue({
  data: {
    user: {}
  },
  render: h => h(App),
}).$mount('#app');

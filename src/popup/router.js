import Vue from 'vue';
import Router from 'vue-router';
import HomeView from './views/Home'
import CreateView from './views/Create'
import ImportView from './views/Import'
import WalletView from './views/Wallet'
import ReceiveView from './views/Receive'
import SendView from './views/Send'
import ConfirmView from './views/Confirm'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/create',
      name: 'create',
      component: CreateView
    },
    {
      path: '/import',
      name: 'import',
      component: ImportView
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: WalletView
    },{
      path: '/receive',
      name: 'receive',
      component: ReceiveView
    },{
      path: '/send',
      name: 'send',
      component: SendView
    },{
      path: '/confirm',
      name: 'confirm',
      component: ConfirmView
    }
  ],
});

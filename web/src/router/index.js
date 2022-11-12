import { createRouter, createWebHistory } from 'vue-router'
import PkIndexView from '../views/pk/PkIndexView.vue'
import RankListIndexView from '../views/ranklist/RankListIndexView.vue'
import RecordIndexView from '../views/record/RecordIndexView.vue'
import UserBotIndexView from '../views/user/bot/UserBotIndexView.vue'
import NotFound from '../views/error/NotFound.vue'

const routes = [
  {//如果是根路径，将其重定向至Pk界面
    path:"/",
    name:"home",
    redirect:"/pk/"
  },
  {
    path:"/pk/",//注意是相对路径
    name:"pk_index",
    component:PkIndexView,//要显示的组件
  },
  {
    path:"/record/",//注意是相对路径
    name:"record_index",
    component:RecordIndexView,//要显示的组件
  },
  {
    path:"/ranklist/",//注意是相对路径
    name:"ranklist_index",
    component:RankListIndexView,//要显示的组件
  },
  {
    path:"/user/bot/",//注意是相对路径
    name:"user_bot_index",
    component:UserBotIndexView,//要显示的组件
  },
  {
    path:"/404/",//注意是相对路径
    name:"404",
    component:NotFound,//要显示的组件
  },
  {
    path:"/:cathAll(.*)",
    redirect:"/404/"
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

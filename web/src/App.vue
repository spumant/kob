<template>
  <NavBar></NavBar><!--如果要将一个组件展示出来需要将其在template中以标签形式放在合适的位置-->
  <router-view/>
</template>
<script>
import NavBar from './components/NavBar.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap"
export default{
  components:{
      NavBar,
  }
  
}
</script>


<style>
body{
  background-image: url("./assets/background.jpg");
  background-size: cover;
}
</style>

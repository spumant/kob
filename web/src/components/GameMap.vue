<template>
    <div ref="parent" class="gamemap"><!--只要在标签中加上ref就可以将变量与其关联-->
        <canvas ref="canvas">

        </canvas>
    </div>
</template>

<script>
import { GameMap } from '../assets/scripts/GameMap';
import {ref,onMounted} from 'vue';//onMounted是当我们组件挂载完之后需要进行某些操作

export default {
    setup(){
        let parent=ref(null);
        let canvas=ref(null);

        onMounted(()=>{//从ref中取一个变量的值需要.value
            new GameMap(canvas.value.getContext('2d'),parent.value);
        })

        return{
            parent,
            canvas,
        }

    }
}
</script>

<style scoped>
div.gamemap{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
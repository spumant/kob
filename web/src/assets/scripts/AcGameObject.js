const AC_GAME_OBJECTS=[];//存下所有的游戏对象

export class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.timedelta=0;//记录每一帧的时间间隔，以更好的实现图像的移动
        this.has_called_start=false;//记录一下有没有执行过 
    }
    start(){//只执行一次

    }
    update(){//每一帧执行一次，除了第一次

    }
    on_destroy(){//删除之前执行

    }
    destroy() {//用来删除当前对象
        this.on_destroy();

        for(let i in AC_GAME_OBJECTS){
            const obj=AC_GAME_OBJECTS[i];
            if(obj===this){
                AC_GAME_OBJECTS.splice(i);
                break;
            }
        }   
    }
}
let last_timestap;//上一次执行的时刻
const step= timestap =>{//回调函数
    for(let obj of AC_GAME_OBJECTS){
        if(!obj.has_called_start){
            obj.has_called_start=true;
            obj.start();
        }else{
            obj.timedelta=timestap-last_timestap;
            obj.update();
        }
    }

    last_timestap=timestap;
    requestAnimationFrame(step);//如果想让每次都执行，只要写成一个递归,就可以在每一帧都执行
}

requestAnimationFrame(step)//浏览器默认刷新60次，这个函数能在下一次刷新之前执行一次
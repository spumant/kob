import { AcGameObject } from "./AcGameObject";
import { Cell } from "./Cell";

export class Snake extends AcGameObject{
    constructor(info,gamemap){//info用来存储信息
        super();
        //取出基本的id
        this.id=info.id;
        this.color=info.color;
        this.gamemap=gamemap;//方便调用函数和参数


        this.cells=[new Cell(info.r,info.c)];//存放蛇的身体，cells[0]存放蛇头
        this.next_cell=null;//蛇的下一步的目的地
        
        this.speed=5;//蛇每秒钟走5个格子
        this.direction=-1;//-1表示没有指令，0、1、2、3表示上右下左
        this.status="idle";//idle表示静止，move表示正在移动，die表示已经死亡

        this.dr=[-1,0,1,0];//行的偏移量
        this.dc=[0,1,0,-1];//列的偏移量

        this.step=0;//表示回合数
        this.eps=1e-2;//允许的误差

        this.eye_direction=0;
        if(this.id==1) this.eye_direction=2;//左下角的蛇初始朝上，右上角的蛇初始朝下

        this.eye_dx = [//蛇的眼睛x方向偏移量
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1],
        ];
        this.eye_dy = [//蛇的眼睛y方向偏移量
            [-1, -1],
            [-1, 1],
            [1, 1],
            [1, -1],
        ];
    }

    start(){

    }

    set_direction(d){
        this.direction=d;
    }

    check_tail_increasing(){//检测当前回合蛇的长度是否增加
        if(this.step<=10) return true;
        if(this.step%3===1) return true;
        return false;
    }



    next_step(){//将蛇的状态变为走下一步
        const d=this.direction;
        this.next_cell=new Cell(this.cells[0].r+this.dr[d],this.cells[0].c+this.dc[d]);
        this.eye_direction=d;
        this.direction=-1;//清空操作
        this.status="move";
        this.step++;
        const k=this.cells.length;//获取蛇的长度
        for(let i=k;i>0;i--){//初始元素不变每一个元素往后移动一位
            this.cells[i]=JSON.parse(JSON.stringify(this.cells[i-1]));
        }
        if(!this.gamemap.check_valid(this.next_cell)){//下一步撞了，蛇直接去世
            this.status="die";
        }
    }
    update_move(){
        const dx=this.next_cell.x-this.cells[0].x;
        const dy=this.next_cell.y-this.cells[0].y;
        const distance=Math.sqrt(dx*dx+dy*dy);
        if(distance<this.eps){//当两个点之间的误差小于eps的时候我们就认为他已经重合了
            this.cells[0]=this.next_cell;//添加一个新蛇头
            this.next_cell=null;
            this.status="idle";//走完后停下

            if(!this.check_tail_increasing()){//蛇不变长则砍掉蛇尾
                this.cells.pop();
            }
        }else{
            const move_distatnce=this.speed*this.timedelta/1000;//每两帧之间走过的距离
            this.cells[0].x+=move_distatnce*dx/distance;
            this.cells[0].y+=move_distatnce*dy/distance; 

            if(!this.check_tail_increasing()){
                const k=this.cells.length;
                const tail=this.cells[k-1],tail_target=this.cells[k-2];
                const tail_dx=tail_target.x-tail.x;
                const tail_dy=tail_target.y-tail.y;
                tail.x+=move_distatnce*tail_dx/distance;
                tail.y+=move_distatnce*tail_dy/distance;
            }
        }
    }

    update(){
        if(this.status==='move'){
            this.update_move();
        }
        this.render();
    }
    render(){
        //画一个基本的蛇的图形
        const L=this.gamemap.L;
        const ctx=this.gamemap.ctx;
        ctx.fillStyle=this.color;
        //判断蛇死亡
        if(this.status==="die"){
            ctx.fillStyle="white";
        }
        for(const cell of this.cells){
            ctx.beginPath();
            //前两个参数为横纵坐标,第三个参数为圆的半径,后面两个参数为圆弧的起始角度与终止角度
            ctx.arc(cell.x*L,cell.y*L,L/2*0.8,0,Math.PI*2);
            ctx.fill();
        }
        for(let i=1;i<this.cells.length;i++){
            const a=this.cells[i-1],b=this.cells[i];
            if(Math.abs(a.x-b.x)<this.eps&&Math.abs(a.y-b.y)<this.eps)
                continue;//如果两个圆已经混合了就不用再填充了
            if(Math.abs(a.x-b.x)<this.eps){
                //竖直方向
                ctx.fillRect((a.x-0.4)*L,Math.min(a.y,b.y)*L,L*0.8,Math.abs(a.y-b.y)*L);
            }else{
                ctx.fillRect(Math.min(a.x,b.x)*L,(a.y-0.4)*L,Math.abs(a.x-b.x)*L,L*0.8);
            }
        }
        ctx.fillStyle="black";
        for(let i=0;i<2;i++){
            const eye_x=(this.cells[0].x+this.eye_dx[this.eye_direction][i]*0.15)*L;
            const eye_y=(this.cells[0].y+this.eye_dy[this.eye_direction][i]*0.15)*L;
            ctx.beginPath();
            ctx.arc(eye_x,eye_y,L*0.05,0,Math.PI*2);
            ctx.fill();
        }
    }
}
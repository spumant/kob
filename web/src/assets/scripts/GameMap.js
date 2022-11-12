import { AcGameObject } from "./AcGameObject";
import { Wall } from "./Wall";

export class GameMap extends AcGameObject {
    constructor(ctx, parent) {//ctx:画布，parent:画布的父元素
        super();
        this.ctx = ctx;
        this.parent = parent;
        this.L = 0;//地图每一个格子的单位距离
        this.cols = 13;
        this.rows = 13;
        this.walls=[];

        this.inner_walls_count=20;
    }
    //判断是否联通
    check_connectivity(g,sx,sy,tx,ty){
        if(sx==tx&&sy==ty)  return true;
        g[sx][sy]=true;
        let dx=[-1,0,1,0],dy=[0,1,0,-1];
        for(let i=0;i<4;i++){
            let x=sx+dx[i],y=sy+dy[i];
            if(!g[x][y]&&this.check_connectivity(g,x,y,tx,ty))
                return true;
        }
        return false;
    }

    create_walls(){//用于创建障碍物
        //有墙为true，无墙为false
        const g=[];
        for(let r=0;r<this.rows;r++){
            g[r]=[];
            for(let c=0;c<this.cols;c++){
                g[r][c]=false;
            }
        }
        //给四周加上障碍物
        for(let r=0;r<this.rows;r++){
            g[r][0]=g[r][this.cols-1]=true;
        }
        for(let c=0;c<this.cols;c++){
            g[0][c]=g[this.rows-1][c]=true;
        }

        //创建随机障碍物
        for(let i=0;i<this.inner_walls_count;i++){
            for(let j=0;j<1000;j++){//为避免重复，可以将其循环一千次，因为格子只有一百多个，一千次一定能找出合适的位置
                let r=parseInt(Math.random()*this.rows);
                let c=parseInt(Math.random()*this.cols);
                if(g[r][c]|g[c][r]) continue;

                // 排除左下角和右上角
                if (r == this.rows - 2  && c == 1|| r == 1 && c == this.cols - 2)
                    continue;
                
                g[r][c]=g[c][r]=true;
                break;
            }
        }

        const copy_g=JSON.parse(JSON.stringify(g));//先转换为JSON再转换回来可以对对象进行深度复制
        if(!this.check_connectivity(copy_g,this.rows-2,1,1,this.cols-2)){
            return false;
        }
        for(let r=0;r<this.rows;r++){
            for(let c=0;c<this.cols;c++){
                if(g[r][c]){
                    this.walls.push(new Wall(r,c,this));
                }
            }
        }
        return true;
    }

    start() {
        for(let i=0;i<1000;i++)
        {
            if(this.create_walls())
            break;
        }
    }
    update_size() {
         // 计算小正方形的边长
         this.L = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
         this.ctx.canvas.width = this.L * this.cols;
         this.ctx.canvas.height = this.L * this.rows;
    }
    update() {
        this.update_size();
        this.render();
    }

    //渲染函数
    render() {
         //取颜色
         const color_eve = "#AAD751", color_odd = "#A2D149";
         //染色
         for(let r=0;r<this.rows;r++)
            for(let c=0;c<this.cols;c++){
                if((r+c)%2==0){
                    this.ctx.fillStyle=color_eve;
                }else{
                    this.ctx.fillStyle=color_odd;
                }
                //左上角左边，明确canvas坐标系
                this.ctx.fillRect(c*this.L,r*this.L,this.L,this.L);
            }
    }
}
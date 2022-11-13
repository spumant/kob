export class Cell{
    constructor(r,c){
        this.r=r;
        this.c=c;
        //因为地图的坐标和canvas画布的坐标是不一样的，所以要转化为canvas坐标
        this.x=c+0.5;
        this.y=r+0.5;
    }
}
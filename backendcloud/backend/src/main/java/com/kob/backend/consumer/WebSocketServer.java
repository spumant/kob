package com.kob.backend.consumer;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.kob.backend.consumer.utils.Game;
import com.kob.backend.consumer.utils.JwtAuthentication;
import com.kob.backend.mapper.RecordMapper;
import com.kob.backend.mapper.UserMapper;
import com.kob.backend.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@ServerEndpoint("/websocket/{token}")  // 注意不要以'/'结尾
public class WebSocketServer {
    //线程安全的哈希表，将userId映射到相应用户的WebSocketServer
    final public static ConcurrentHashMap<Integer,WebSocketServer> users=new ConcurrentHashMap<>();

    private User user;//存储每个链接对应的用户信息
    //每个链接都是用session来维护的
    private Session session=null;

    private static UserMapper userMapper;
    public static RecordMapper recordMapper;

    private static RestTemplate restTemplate;
    private Game game=null;
    private final static String addPlayerUrl="http://127.0.0.1:3001/player/add/";
    private final static String removePlayerUrl="http://127.0.0.1:3001/player/remove/";
    @Autowired
    public void setUserMapper(UserMapper userMapper){
        WebSocketServer.userMapper=userMapper;
    }
    @Autowired
    public void setRecordMapper(RecordMapper recordMapper){
        WebSocketServer.recordMapper=recordMapper;
    }
    @Autowired
    public void setRestTemplate(RestTemplate restTemplate){
        WebSocketServer.restTemplate=restTemplate;
    }
    @OnOpen
    public void onOpen(Session session, @PathParam("token") String token) throws IOException {
        // 建立连接
        this.session=session;
        System.out.println("connected");
        //当建立连接时，需要从token中读取当前的用户是谁，为了方便，一开始传入的不是token而是id

        //现在已经修改为使用token登录
        Integer userId= JwtAuthentication.getUserId(token);
        this.user=userMapper.selectById(userId);
        if(this.user!=null){//如果这名用户存在则表示链接成功
            users.put(userId,this);
        }else{//否则断开连接
            this.session.close();
        }

    }

    @OnClose
    public void onClose() {
        // 关闭链接
        System.out.println("disconnected");
        //当关闭链接时需要将user移除
        if(this.user!=null){
            users.remove(this.user.getId());
        }
    }
    public static void startGame(Integer aId,Integer bId){
        User a=userMapper.selectById(aId);
        User b=userMapper.selectById(bId);
        Game game=new Game(13,14,20,a.getId(),b.getId());
        game.CreateMap();
        if(users.get(a.getId())!=null){
            users.get(a.getId()).game=game;
        }
        if(users.get(b.getId())!=null){
            users.get(b.getId()).game=game;
        }


        game.start();

        JSONObject respGame=new JSONObject();
        respGame.put("a_id",game.getPlayerA().getId());
        respGame.put("a_sx",game.getPlayerA().getSx());
        respGame.put("a_sy",game.getPlayerA().getSy());
        respGame.put("b_id",game.getPlayerB().getId());
        respGame.put("b_sx",game.getPlayerB().getSx());
        respGame.put("b_sy",game.getPlayerB().getSy());
        respGame.put("map",game.getG());

        JSONObject respA=new JSONObject();//用于将A的消息传回
        respA.put("event","start-matching");
        respA.put("opponent_username",b.getUsername());//传回对手的名字
        respA.put("opponent_photo",b.getPhoto());//传回对手的头像
        respA.put("game",respGame);
        if(users.get(a.getId())!=null)
            users.get(a.getId()).sendMessage(respA.toJSONString());//获取A的链接，将A的信息传到前端

        JSONObject respB=new JSONObject();//用于将B的消息传回
        respB.put("event","start-matching");
        respB.put("opponent_username",a.getUsername());//传回对手的名字
        respB.put("opponent_photo",a.getPhoto());//传回对手的头像
        respB.put("game",respGame);
        if(users.get(b.getId())!=null)
            users.get(b.getId()).sendMessage(respB.toJSONString());//获取B的链接，将B的信息传到前端
    }
    private void startMatching(){
        MultiValueMap<String,String> data=new LinkedMultiValueMap<>();
        data.add("user_id",this.user.getId().toString());
        data.add("rating",this.user.getRating().toString());
        restTemplate.postForObject(addPlayerUrl,data,String.class);
    }

    private void stopMatching(){
        MultiValueMap<String,String> data=new LinkedMultiValueMap<>();
        data.add("user_id",this.user.getId().toString());
        restTemplate.postForObject(removePlayerUrl,data,String.class);
    }

    private void move(int direction){
        if(game.getPlayerA().getId().equals(user.getId())){
            game.setNextStepA(direction);
        }else if(game.getPlayerB().getId().equals(user.getId())){
            game.setNextStepB(direction);
        }
    }
    @OnMessage
    public void onMessage(String message, Session session) {//当作路由判断要将任务交给谁
        // 从Client接收消息
        System.out.println("receive message!");
        JSONObject data= JSON.parseObject(message);
        String event=data.getString("event");
        if("start-matching".equals(event)){
            startMatching();
        }else if("stop-matching".equals(event)){
            stopMatching();
        }else if("move".equals(event)){
            move(data.getInteger("direction"));
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }

    public void sendMessage(String message){//实现从后端向前端发送信息
        synchronized (this.session) {//异步通信需要加锁
            try {
                this.session.getBasicRemote().sendText(message);//这个api可以将后端的信息发送给前端
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }
}
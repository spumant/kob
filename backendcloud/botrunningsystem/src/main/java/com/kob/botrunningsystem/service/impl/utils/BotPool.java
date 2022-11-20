package com.kob.botrunningsystem.service.impl.utils;

import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class BotPool extends Thread{

    private final ReentrantLock lock=new ReentrantLock();
    private final Condition condition=lock.newCondition();
    private final Queue<Bot> bots=new LinkedList<>();
    public void addBot(Integer userId,String botCode,String input){
        lock.lock();
        try {
            bots.add(new Bot(userId,botCode,input));
            condition.signalAll();
        }finally {
            lock.unlock();
        }
    }
    private void consume(Bot bot){//消费任务
        Consumer consumer=new Consumer();
        consumer.startTimeout(2000,bot);
    }

    @Override
    public void run() {
        while(true){
            lock.lock();
            if(bots.isEmpty()){
                try {
                    condition.await();//执行await会自动释放锁
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    lock.unlock();//如果出了异常记得释放锁
                    break;
                }
            }else{
                Bot bot=bots.remove();
                lock.unlock();
                consume(bot);//比较耗时的操作记得放在解锁之后，因为此时已经没有入队出队的操作了，不会发生队列的读写冲突问题
            }
        }
    }
}

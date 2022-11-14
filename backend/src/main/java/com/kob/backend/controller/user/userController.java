package com.kob.backend.controller.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.kob.backend.mapper.UserMapper;
import com.kob.backend.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class userController {

    @Autowired//使用Mapper层需要自动注入
    UserMapper userMapper;

    //可以直接使用requestMapping，但是一般是处理什么样的请求使用哪种Mapping
    //比如处理get请求就使用GetMapping
    @GetMapping("/user/all/")
    public List<User> getAll(){
        return userMapper.selectList(null);
    }
    //查询单个用户
    @GetMapping("/user/{userId}")//在路径中带参数需要将参数用{}括起来
    public User getUser(@PathVariable int userId){
        QueryWrapper<User> queryWrapper=new QueryWrapper<>();
        queryWrapper.eq("id",userId);
        return userMapper.selectOne(queryWrapper);
    }
    //添加用户
    @GetMapping("/user/add/{userId}/{username}/{password}/")
    public String addUser(@PathVariable int userId,
                          @PathVariable String username,
                          @PathVariable String password){
        PasswordEncoder passwordEncoder=new BCryptPasswordEncoder();
        String encodedPassword=passwordEncoder.encode(password);
        User user=new User(userId,username,encodedPassword);
        userMapper.insert(user);
        return "Add User Successfully";
    }
    //删除用户
    @GetMapping("/user/delete/{userId}/")
    public String deleteUser(@PathVariable int userId){
        userMapper.deleteById(userId);
        return "Delete User Successfully";
    }

}

package com.kob.backend.service.impl.user.account;

import com.kob.backend.pojo.User;
import com.kob.backend.service.impl.util.UserDetailsImpl;
import com.kob.backend.service.user.account.LoginService;
import com.kob.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public Map<String, String> getToken(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken=
                new UsernamePasswordAuthenticationToken(username,password);//将用户名和密码封装成一个类，里面不会存储明文，存储的是加密后的字符串
        Authentication authenticate = authenticationManager.authenticate(authenticationToken);
        //如果登录失败会自动处理
        UserDetailsImpl loginUser= (UserDetailsImpl) authenticate.getPrincipal();
        User user=loginUser.getUser();
        String jwt= JwtUtil.createJWT(user.getId().toString());//封装成jwt
        Map<String,String> map=new HashMap<>();
        map.put("error_message","success");//如果失败authentication会处理
        map.put("token",jwt);
        return map;
    }
}

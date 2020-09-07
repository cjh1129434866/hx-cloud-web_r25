# hx-cloud-web

合续云平台前端项目 v2.5（村镇污水处理管理云平台）  账号 15817468540  密码 abc

### 安装依赖

`npm install`

### 本地运行

```javascript
npm run serve
```

### 测试

```javascript
npm run test:unit           // 单元测试
npm run test:e2e            // 端到端测试
```

### <a href="#build" name="build">构建</a>

```javascript
npm run build               // 开始构建生成 dist 目录(业务相关的代码)
```

### 构建后包大小分析

```javascript
npm run analyz              // 分析模块的大小与依赖
```

### 发布

把 **[构建](#build)** 中生成的 **dist** 目录下的所有文件放到 nginx 的 html **(nginx/html)** 文件夹下

### nginx 配置(nginx/conf/nginx.conf)
#### 注意：更新服务器上的nginx配置时，请同步更新以下配置

```nginx


#user  nobody;
worker_processes  1;

error_log  logs/error.log;
error_log  logs/error.log  notice;
error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] $status "$request" '
                      '$body_bytes_sent(B) $request_time(s)';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;
    
	gzip on;
	gzip_min_length 1k;
	gzip_buffers 4 16k;
	#gzip_http_version 1.0;
	gzip_comp_level 2;
	gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
	gzip_vary off;
	gzip_disable "MSIE [1-6]\.";

    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        if ($time_iso8601 ~ "^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})") {
            set $year $1;
            set $month $2;
            set $day $3;
        }
        error_log logs/host_80_error.log;
        access_log  logs/host_80_access_$year-$month-$day.log  main;

        location / {
            # root   html;
            # index  index.html index.htm;
	    add_header Cache-Control public,max-age=2592000;
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://www.hexucloud.com:18003;  
            proxy_set_header Host $Host;  
            proxy_set_header X-Real-IP $remote_addr;  
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  
        }

        location /videoapi {
            proxy_pass https://open.ys7.com/api;
            proxy_set_header Cookie '';
        }
	
	location /webApiAmap {
            proxy_pass https://webapi.amap.com;
        }

        location /Images {
            proxy_pass http://www.hexucloud.com:18003;
            proxy_set_header Cookie '';
        }

        location /Files {
            proxy_pass http://www.hexucloud.com:18003;
            proxy_set_header Cookie '';
        }

        location /test {
            proxy_pass http://192.168.100.3:8082;
            proxy_set_header Cookie '';
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }


    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}

```

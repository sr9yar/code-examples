#!/bin/bash

docker stop $(docker ps -aq)

docker rm tmp-nginx; docker run -p 80:80 -v $(pwd):/usr/share/nginx/html --name tmp-nginx -d nginx;

sensible-browser -o http://localhost:80


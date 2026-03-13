# Deployment Guide

## A) Run On Local Machine

### 1) Build prod image

```bash
docker build -f docker/prod/Dockerfile -t kavin0604/anigas-attire:latest .
```

Explanation:
- Builds frontend image using prod Dockerfile.
- During build, `.env.docker.public` is copied inside the image as `.env`.
- Make sure `.env.docker.public` is populated with the correct production values before building.
- Keep only `NEXT_PUBLIC_*` variables in `.env.docker.public`.

### 2) Publish image to Docker Hub

```bash
docker login
docker push kavin0604/anigas-attire:latest
```

Explanation:
- Logs in to Docker Hub.
- Pushes latest frontend image.

## 0) Install Docker On Ubuntu Server

### 1) Remove old Docker packages (if any)

```bash
sudo apt-get remove -y docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc
```

### 2) Set up Docker apt repository

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

### 3) Install Docker engine and plugins

```bash
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4) Enable and verify Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo docker --version
```

## B) Run On Server

### 0) Server folder setup (do this first)

```bash
cd /srv
sudo mkdir -p anigas-attire/data
cd /srv/anigas-attire
```

Explanation:
- Creates `/srv/anigas-attire` for deployment files.
- Creates `/srv/anigas-attire/data` for backend bind mount.
- If you have old backend data, transfer it to `/srv/anigas-attire/data` using WinSCP.

### 0.1) Create env files (`fe.env` and `be.env`)

```bash
cd /srv/anigas-attire
touch fe.env be.env
```

Explanation:
- `fe.env` is for frontend container env vars.
- `be.env` is for backend container env vars.
- Populate both files manually with the required environment values before running containers.

### 1) Pull latest images

```bash
docker pull kavin0604/anigas-attire:latest
docker pull infominsolutions/cashya-shoppy:latest
```

Explanation:
- Downloads newest frontend and backend images.

### 2) Create network once

```bash
docker network create anigas-network
```

### 3) Run backend container

```bash
docker rm -f anigas-attire-backend

docker run -d --name anigas-attire-backend \
  --restart unless-stopped \
  --network anigas-network \
  --env-file /srv/anigas-attire/be.env \
  -p 8000:8000 \
  -v /srv/anigas-attire/data:/app/data \
  infominsolutions/cashya-shoppy:latest
```

Explanation:
- Equivalent to backend service in docker/prod/compose.yml.
- Uses bind mount for backend data.

### 4) Run frontend container

```bash
docker rm -f anigas-attire-frontend

docker run -d --name anigas-attire-frontend \
  --restart unless-stopped \
  --network anigas-network \
  --env-file /srv/anigas-attire/fe.env \
  -p 3000:3000 \
  kavin0604/anigas-attire:latest
```

## C) Nginx + SSL Setup (Server)

Prerequisite:
- Point your domain DNS A record to this server IP.

### 1) Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2) Create Nginx site config

```bash
sudo nano /etc/nginx/sites-available/anigasattire.kavint.tech.conf
```

Paste this config into nano:

```nginx
server {
  server_name anigasattire.kavint.tech;

  access_log /var/log/nginx/anigasattire.access.log;
  error_log  /var/log/nginx/anigasattire.error.log warn;

  client_max_body_size 50M;

  location ^~ /static/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  location ^~ /media/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  location ^~ /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  location ^~ /admin/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_redirect off;
  }

  listen 80;
}
```

Save and exit nano:
- Press `Ctrl + O`, then `Enter`
- Press `Ctrl + X`

### 3) Enable site and reload Nginx

```bash
sudo ln -sf /etc/nginx/sites-available/anigasattire.kavint.tech.conf /etc/nginx/sites-enabled/anigasattire.kavint.tech.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 4) Install Certbot and Nginx plugin

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5) Issue SSL certificate and auto-configure HTTPS

```bash
sudo certbot --nginx -d anigasattire.kavint.tech
```

### 6) Verify auto-renew

```bash
sudo certbot renew --dry-run
```

### 5) Remove old images from server

Safe cleanup (unused images only):

```bash
docker image prune -a -f
```

Optional deeper cleanup:

```bash
docker system prune -a -f
```

Explanation:
- Frees disk space by removing unused Docker artifacts.

### Quick update flow (frontend only)

```bash
docker pull kavin0604/anigas-attire:latest

docker rm -f anigas-attire-frontend

docker run -d --name anigas-attire-frontend \
  --restart unless-stopped \
  --network anigas-network \
  --env-file /srv/anigas-attire/fe.env \
  -p 3000:3000 \
  kavin0604/anigas-attire:latest
```

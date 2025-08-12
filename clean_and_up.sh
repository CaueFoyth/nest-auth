#!/bin/bash

echo "Parando todos os containers..."
docker stop $(docker ps -q) 2>/dev/null

echo "Removendo todos os containers..."
docker rm $(docker ps -a -q) 2>/dev/null

echo "Removendo todas as imagens..."
docker rmi -f $(docker images -q) 2>/dev/null

echo "Removendo todos os volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null

echo "Removendo redes personalizadas..."
docker network rm $(docker network ls -q | grep -v "bridge\|host\|none") 2>/dev/null

echo "Removendo node_modules e dist..."
sudo rm -rf node_modules dist

echo "Subindo o docker-compose..."
docker compose -f docker-compose.prod.yml up --build --force-recreate

#/bin/bash

echo "Type: 1 for [ PRODUCTION  ] - (only file logs)"
echo "Type: 2 for [ DEVELOPMENT ] - (console logs + file logs)"
read -n 1 -p "-> " "mode"

if [[ $mode -eq 1 ]];
then
    sudo MODE=start docker-compose up --build
elif [[ $mode -eq 2 ]];
then
    sudo MODE=dev docker-compose up --build
fi
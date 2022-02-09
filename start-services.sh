#/bin/bash

echo "Type: 1 for [ PRODUCTION  ] - (log files - production database(db) - tests)"
echo "Type: 2 for [ DEVELOPMENT ] - (log files - develop database(db_dev) - tests)"
read -n 1 -p "-> " "mode"

if [[ $mode -eq 1 ]];
then
    sudo MODE=test docker-compose -f testing_websockets.yml up --build --abort-on-container-exit 
    sudo MODE=test docker-compose -f testing_api.yml up --build --abort-on-container-exit 
    sudo MODE=start docker-compose up --build
elif [[ $mode -eq 2 ]];
then
    sudo MODE=test docker-compose -f testing_websockets.yml up --build --abort-on-container-exit 
    sudo MODE=test docker-compose -f testing_api.yml up --build --abort-on-container-exit 
    sudo MODE=dev docker-compose up --build
fi
#!/bin/bash

# TODO: dir trick for `cat token`

port=${PORT:=8080}
type=${1:-"device"}
id=${2:-"0"}

if [ -f 'token' ]; then
    token=$(cat token)
else
    token="$3"
fi

curl "http://localhost:$port/pubkey/$type/$id?token=$token"

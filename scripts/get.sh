#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
BASE="$DIR/.."

port=${PORT:=8080}
type=${1:-"device"}
id=${2:-"0"}


if [ -f "$BASE/token" ]; then
    token=$(cat "$BASE/token")
else
    token="$3"
fi

curl "http://localhost:$port/pubkey/$type/$id?token=$token"

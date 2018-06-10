#!/bin/bash

port=${PORT:=8080}
type=${1:-"master"}
id=${2:-"0"}
key=""

curl -X POST "http://localhost:$port/pubkey/$type/$id" \
    -d '{"key":"'$key'"}'


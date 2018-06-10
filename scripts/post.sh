#!/bin/bash

port=${PORT:=8080}
type=${1:-"device"}
id=${2:-"0"}
key="thisisatest"

curl -H "Content-Type: application/json" \
    -X POST "http://localhost:$port/pubkey/$type/$id" \
    -d '{"key":"'$key'"}'


#!/usr/bin/env bash

export ARGV="$@"
export ARGC="$#"

function sigterm_handler() {
    echo "SIGTERM signal received."
    forever stopall
}

trap "sigterm_handler; exit" TERM

function entrypoint() {
    if [ "$ARGC" -eq 0 ]
    then
        forever start server.js
    else
        forever start $ARGV
    fi

    forever --fifo logs 0 &
    wait
}

entrypoint


#!/usr/bin/env bash

export ARGV="$@"
export ARGC="$#"

export FFMPEG_PATH=$(which ffmpeg)

function sigterm_handler() {
    echo "SIGTERM signal received."
    forever stopall
}

trap "sigterm_handler; exit" TERM

function entrypoint() {
    forever start /app/server.js
    forever --fifo logs 0 &
    wait
}

entrypoint


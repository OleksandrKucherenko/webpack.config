#!/usr/bin/env bash

tm=$(date +%Y_%m_%d_%H_%M_%S)
config="tsconfig.old.json"

echo "Step 1/3: dump configuration to ./tsc.$tm.log"

# dump configurtion
{
    echo ""
    echo "------------------------"
    echo ""
    NODE_ENV=production yarn tsc --project $config --showConfig
    echo ""
    echo "------------------------"
    echo ""
} >"tsc.$tm.log"

echo "Step 2/3: tsc compilation"

{
    NODE_ENV=production yarn tsc --pretty \
        --project $config \
        --noEmit 2>&1
} | tee -a >(sed -r 's/\x1B\[(;?[0-9]{1,3})+[mGK]//g' >>"./tsc.$tm.log")

echo "Step 3/3: tsc compilation files"

{
    echo ""
    echo "------------------------"
    echo ""
    NODE_ENV=production yarn tsc --pretty \
        --project $config --listFiles --listEmittedFiles --noEmit |
        grep "$(pwd)"
} >>"./tsc.$tm.log"

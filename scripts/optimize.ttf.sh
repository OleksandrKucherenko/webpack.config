#!/bin/bash

pushd public/fonts || exit 1

npx glyphhanger \
    --whitelist="U+1F31F,U+1F334,U+1F340,U+1F344,U+1F35C,U+1F3C6,U+1F3E1,U+1F3FB,U+1F3FE,U+1F3FF,U+1F410,U+1F422,U+1F440,U+1F451,U+1F480,U+1F4F8,U+1F54A,U+1F63B,U+1F6A8,U+1F9FF,U+1FA77,U+1FABC,U+1FAE7,U+1FAF1,U+1FAF2,U+1FAF6" \
    --subset="*.ttf"

popd || exit 1

#!/usr/bin/env bash

FILE=$1
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <har-file>"
  exit 1
fi

DESTINATION=$(dirname "$FILE")
SOURCE="${DESTINATION}/source.webloc"

url=$(jq --raw-output ".log.pages[0].title" "$FILE")

# create MacOs web page link file
{
  echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
  echo "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">"
  echo "<plist version=\"1.0\">"
  echo "<dict>"
  echo "    <key>URL</key>"
  echo "    <string>$url</string>"
  echo "</dict>"
  echo "</plist>"
} >"${SOURCE}"

#!/bin/bash

FILE=$1
if [[ -z "$FILE" ]]; then
  echo "Usage: $0 <har-file>"
  exit 1
fi

DESTINATION=$(dirname "$FILE")
MAPPING="${DESTINATION}/mapping.json"

function urldecode() {
  : "${*//+/ }"
  echo -e "${_//%/\\x}"
}

function convert_url_to_filename() {
  local url="$1" decoded_url=""

  # Convert URL to a JSON-like format and use jq to decode
  decoded_url=$(urldecode "$url")

  # Remove the query part from the URL
  local base_url="${decoded_url%%\?*}"
  base_url="${base_url%/}" # Remove trailing slash if present

  # Remove protocol, domain, and port from the URL
  local path="${base_url#*//}"
  path="${path#*/}"

  # Simplify the path
  path="${path/api\//}" # Remove '/api/'
  path="${path/v1\//}"  # Remove 'v1' but keep 'v2' and 'v10'
  path="${path//\//-}"  # Replace '/' with '-'

  # Replace specific data patterns in path
  path=$(echo "$path" | sed -E 's/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/uuid/g')
  path=$(echo "$path" | sed -E 's/krn:[^:]+:[^:]+:uuid/krn/g; s/krn:[^:]+:[^:]+:[0-9]+/krn/g')

  # Extract query parameters and generate a hash
  local query="${decoded_url#*\?}"
  [[ "$query" == "$decoded_url" ]] && query=""

  # If query is not empty, generate a hash
  local filename="${path}"
  if [[ -n "$query" ]]; then
    filename+="-$(echo -n "$query" | md5sum | cut -c 1-8)" # Construct filename
  fi

  # Replace forbidden characters in filename
  filename=$(echo "$filename" | tr '<>:"/\\|?*' '%' | tr '_' '-' | tr '[:upper:]' '[:lower:]')

  echo "${filename}.json"
}

# TODO (olku): .response.status !== 200 should we exclude it from the mapping?

function extract_requests() {
  local method=${1:-"GET"}
  local PREFIX=${2:-","}
  # shellcheck disable=SC2155
  local filePrefix=$(echo "$method" | tr '[:upper:]' '[:lower:]')
  echo -n "$method: " >&2

  jq -r ".log.entries[] |
    select(.response.content.mimeType | contains(\"application/json\")) |
    select(.request.method | contains(\"$method\")) |
    .request.url" \
    "$FILE" |
    while read -r url; do
      filename=$(convert_url_to_filename "$url")
      echo "${PREFIX}" >>"${MAPPING}"
      echo -n "  [ \"$method\", \"$filePrefix.$filename\", \"$url\" ]" >>"${MAPPING}"

      # TODO (olku): we always extract the first response, should we extract each into own file?
      #   HAR file contains all responses and some of the can be repeated several times
      jq "[ .log.entries[] |
            select(.response.content.mimeType | contains(\"application/json\")) |
            select(.request.method | contains(\"$method\")) |
            select(.request.url == \"$url\") ] | 
            .[0] | .response.content.text | fromjson | ." \
        "$FILE" 2>/dev/null >"${DESTINATION}/$filePrefix.$filename"

      echo -n "."
      PREFIX=","
    done
}

echo "Extracting responses from $FILE..."

echo "[" >"${MAPPING}"

extract_requests "GET" " " && echo "get"
extract_requests "POST" && echo "post"
extract_requests "PUT" && echo "put"
extract_requests "OPTIONS" && echo "options"

echo "" >>"${MAPPING}"
echo "]" >>"${MAPPING}"

echo ""
echo "All done!"

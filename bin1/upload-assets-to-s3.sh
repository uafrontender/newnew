#!/bin/bash

set -euxo pipefail

echo "Starting ./bin/upload-assets-to-s3.sh"

# validate presence of these vars:
: "${CI_APPLICATION_REPOSITORY}"
: "${CI_APPLICATION_TAG}"
: "${CI_AWS_S3_BUCKET}"

LOCAL_ASSET_PATH=/tmp/upload-assets

mkdir $LOCAL_ASSET_PATH

# copy the generated assets out of the docker image
docker run --rm --entrypoint tar "$CI_APPLICATION_REPOSITORY:$CI_APPLICATION_TAG" cf - .next | tar xf - -C $LOCAL_ASSET_PATH

# rename .next to _next
mv "$LOCAL_ASSET_PATH/.next" "$LOCAL_ASSET_PATH/_next"

# remove directories that should not be uploaded to S3
rm -rf "$LOCAL_ASSET_PATH/_next/cache"
rm -rf "$LOCAL_ASSET_PATH/_next/server"

# gzip files
find $LOCAL_ASSET_PATH -regex ".*\.\(css\|svg\|js\)$" -exec gzip {} \;

# strip .gz extension off of gzipped files
find $LOCAL_ASSET_PATH -name "*.gz" -exec sh -c 'mv $1 `echo $1 | sed "s/.gz$//"`' - {} \;

# upload gzipped js, css, and svg assets
aws s3 sync --no-progress $LOCAL_ASSET_PATH "s3://$CI_AWS_S3_BUCKET" --cache-control max-age=31536000 --content-encoding gzip --exclude "*" --include "*.js" --include "*.css" --include "*.svg"

# upload non-gzipped assets
aws s3 sync --no-progress $LOCAL_ASSET_PATH "s3://$CI_AWS_S3_BUCKET" --cache-control max-age=31536000 --exclude "*.js" --exclude "*.css" --exclude "*.svg" --exclude "*.map"

rm -r $LOCAL_ASSET_PATH

echo "Finished ./bin/upload-assets-to-s3.sh"

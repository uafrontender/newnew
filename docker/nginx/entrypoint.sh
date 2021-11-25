# @see https://docs.docker.com/config/containers/multi-service_container/

# turn on job control
set -m

# Start the primary process and put it in the background
cd /app && npm run start &

nginx -g 'daemon off;'

# now we bring the primary process back into the foreground
# and leave it there
fg %1

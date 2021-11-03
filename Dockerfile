FROM node:16.5.0-alpine

# The value of `NEXT_JS_ASSET_URL` is passed in using the `--build-arg` option
# of the `docker build` command run in `.gitlab-ci.yml`. It is used like an
# environment variable in the `RUN npm run build` command below. In this project
# it is assigned to `assetPrefix` in `next.config.js`.
ARG NEXT_JS_ASSET_URL

ENV NODE_ENV=production

# `WORKDIR` sets the working directory and also creates it
WORKDIR /app
# Run `npm ci` before adding app code for better Docker caching
# https://semaphoreci.com/docs/docker/docker-layer-caching.html
COPY ./package.json ./
COPY ./package-lock.json ./
RUN apk add --no-cache git
RUN npm ci --include=dev
COPY . ./
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

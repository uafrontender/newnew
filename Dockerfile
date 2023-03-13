FROM nginx:alpine

COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/auth && apk add nodejs-current && apk add --update npm

COPY ./docker/nginx/auth/.htpasswd /etc/nginx/auth/.htpasswd

COPY ./docker/nginx/entrypoint.sh /app/entrypoint.sh

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

RUN chmod +x /app/entrypoint.sh

CMD ["sh", "/app/entrypoint.sh"]

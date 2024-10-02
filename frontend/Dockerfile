FROM node:19-alpine3.16 

# tzdata = to be able to set the correct timezone
ARG rundeps="tzdata rsync su-exec"

# install apk dependencies
RUN --mount=type=cache,target=/var/cache/apk \
    apk update \
    && apk --progress add $rundeps

# start script
COPY ./docker-start.sh /start.sh
RUN chmod +x /start.sh

# Copies package.json and package-lock.json to Docker environment (separately for better Docker caching)
# @see https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#add-or-copy
# Working directory within the virtualized Docker environment
WORKDIR /install
COPY package.json /install
COPY package-lock.json /install

# Installs all node packages
# Needed to use BuildKit cache feature
# --mount=type=cache,target=/root/.npm
RUN --mount=type=cache,target=/root/.npm npm ci

# RUN mkdir -p app/node_modules/.cache && chmod -R 777 app/node_modules/.cache

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
ENV WDS_SOCKET_PORT=3000
# Working directory within the virtualized Docker environment
WORKDIR /app
# Copies everything over to Docker environment
COPY . /app

ARG APP_UID={APP_UID:-1000}
ARG APP_GID={APP_GID:-1000}

# Uses port which is used by the actual application
EXPOSE 3000

# Finally runs the application
CMD [ "/start.sh" ]


FROM node:16-alpine
RUN mkdir -p /srv/node_modules && chown -R node:node /srv
WORKDIR /srv
COPY package*.json ./
ARG TOKEN
RUN npm set //npm.pkg.github.com/:_authToken $TOKEN && \
    npm i -g typescript ts-node && \
    apk add git
COPY --chown=node:node . .
USER node
CMD [ "npm", "start:mim" ]

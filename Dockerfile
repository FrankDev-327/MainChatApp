FROM node:alpine as development

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./ 
COPY orm.ts ./

RUN npm install

COPY . ./

RUN npm run build

FROM node:alpine as prod

ARG NODE_ENV=prod
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --only=prod

# Copy tsconfig.json from the development stage
COPY --from=development /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=development /usr/src/app/orm.ts ./orm.ts

# Copy only the necessary files for production
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

EXPOSE 3001

CMD node dist/src/main
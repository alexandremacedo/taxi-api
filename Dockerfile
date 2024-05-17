FROM node:20-slim as build

WORKDIR .
COPY . .

RUN npm install
RUN npm run build

FROM node:20-slim as production

WORKDIR .

COPY --from=build ./dist/ ./dist/
COPY package*.json ./

RUN npm install --production

EXPOSE 8080

# Inicia a aplicação
CMD ["npm", "run", "start:prod"]
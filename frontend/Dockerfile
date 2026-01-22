FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install
# Don't copy source code - it will be mounted as volume
# COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

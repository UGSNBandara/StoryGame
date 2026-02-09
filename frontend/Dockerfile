FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only package files first (better cache)
COPY package.json package-lock.json* ./

# Clean install (more stable in CI)
RUN npm ci

# Copy app source
COPY . .

EXPOSE 3000

# If you use Vite/React dev server, it usually needs --host
CMD ["npm", "run", "start"]

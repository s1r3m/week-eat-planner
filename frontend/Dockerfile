FROM node:22-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies (using Yarn)
RUN corepack enable && yarn install

# Copy rest of the project
COPY . .

# Default Vite dev port overrideable by ENV
ENV PORT=3000
EXPOSE 3000

# The default command will be overridden by Makefile or compose
CMD ["yarn", "dev", "--port", "3000", "--host", "0.0.0.0"]

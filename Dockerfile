FROM node:22.15.0

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ ./
EXPOSE 8000
CMD ["npm", "start"]
FROM node:20
WORKDIR /app/tweet-service
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]

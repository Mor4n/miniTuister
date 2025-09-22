FROM node:20
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5173
CMD ["npm", "run", "preview"]

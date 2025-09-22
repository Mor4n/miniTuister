# Dockerfile para el API Gateway (Node.js)
FROM node:20
WORKDIR /app
# Copia primero package.json y package-lock.json para aprovechar el caché de npm install
COPY package*.json ./
RUN npm install --production
# Copia el resto de la app
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

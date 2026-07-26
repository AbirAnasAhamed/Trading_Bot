# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /var/log/nginx/access.log && touch /var/log/nginx/access.log
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine

WORKDIR /app

COPY package.json package.json
COPY vite.config.js vite.config.js
COPY index.html index.html
COPY tailwind.config.js tailwind.config.js
COPY postcss.config.js postcss.config.js
COPY src src

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

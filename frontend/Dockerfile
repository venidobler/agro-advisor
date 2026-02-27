FROM node:22-alpine

WORKDIR /app

# Copia o package.json e o package-lock.json (se existir) primeiro
# Isso aproveita o cache do Docker e acelera o build
COPY package.json ./
COPY package-lock.json ./ 

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

EXPOSE 5173

# O comando padrão será o que definimos no docker-compose.yml
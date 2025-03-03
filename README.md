# README

## Inicialização do Frontend
Este é o frontend da aplicação, desenvolvido em **React** e servido através do **NGINX** dentro de um container Docker.

### **1. Pré-requisitos**
Certifique-se de ter instalado:
- [Docker](https://www.docker.com/get-started)

### **2. Como rodar o frontend**
1. No terminal, vá até a pasta do frontend:
   ```sh
   cd frontend
   ```
2. Construa a imagem Docker do frontend:
   ```sh
   docker build -t frontend-app .
   ```
3. Suba o container do frontend:
   ```sh
   docker run -d -p 3000:80 frontend-app
   ```

### **3. Acessando a Aplicação**
- O frontend estará disponível em: `http://localhost:3000`

### **4. Parando o frontend**
Para parar o container do frontend:
```sh
   docker stop $(docker ps -q --filter ancestor=frontend-app)
```

### **5. Debugging e Logs**
- Para visualizar os logs do frontend:
  ```sh
  docker logs -f $(docker ps -q --filter ancestor=frontend-app)
  ```

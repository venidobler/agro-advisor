# Como Contribuir para o Agro Advisor

Obrigado por investir seu tempo em contribuir para o nosso projeto!

## 🚀 Como começar (Ambiente de Desenvolvimento)

Nós utilizamos o **Docker** para padronizar o ambiente. Você não precisa instalar Python ou Node na sua máquina.

1. Faça um fork deste repositório e clone localmente.
2. Na raiz do projeto, rode o comando:

```bash
   docker compose up --build
```

O Frontend estará disponível em `http://localhost:5173`.

O Backend (API) estará disponível em `http://localhost:8000`.

## 📝 Processo de Pull Request
1. Crie uma branch para a sua feature (git checkout -b feature/MinhaFeature).

2. Faça o commit de suas alterações seguindo o padrão Conventional Commits (feat:, fix:, docs:).

3. Faça o push para a branch (git push origin feature/MinhaFeature).

4. Abra um Pull Request e preencha o template fornecido.
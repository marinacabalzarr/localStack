# Serverless CRUD com LocalStack e SNS

Este projeto implementa uma API CRUD Serverless utilizando AWS Lambda, API Gateway, DynamoDB e SNS (Simple Notification Service), executando totalmente em ambiente local por meio do LocalStack, conforme a Opção A do Roteiro 3 – Aplicações Serverless com LocalStack (PUC Minas).

A aplicação permite criar, listar, buscar, atualizar e remover recursos, além de publicar notificações em um tópico SNS quando ocorre a criação ou atualização de um item.

# Funcionalidades

API REST com operações Create, Read, Update e Delete

Persistência de dados utilizando DynamoDB

Publicação de mensagens em um tópico SNS em eventos do CRUD

Lambda subscriber responsável por consumir e processar as mensagens do SNS

Execução completa em ambiente local com LocalStack

# Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js (versão 18.x)

* Docker (obrigatoriamente em execução)

* Serverless Framework v3
 
```bash
npm install -g serverless
```
# Instalação e Deploy

* Instale as dependências do projeto:

```bash
npm install
```
```bash
serverless plugin install -n serverless-localstack
```
* Realize o deploy no local stack
```bash
serverless deploy --stage local
```

* Obtenha o ID da API:
  
Após o deploy, o terminal exibirá os endpoints da API, semelhantes a:

```bash
http://localhost:4566/restapis/abc123/local/_user_request_
```
Copie o ID gerado (exemplo: abc123), pois ele será utilizado nos testes abaixo no lugar de SEU_ID_AQUI.

# Testando a API (Comandos cURL)

⚠️ Importante: substitua SEU_ID_AQUI pelo ID gerado no seu deploy.

## Criar Item (POST)

Esta operação salva o item no DynamoDB e publica uma notificação no SNS.
```bash
curl -X POST http://localhost:4566/restapis/SEU_ID_AQUI/local/_user_request_/items \
  -H "Content-Type: application/json" \
  -d '{"nome": "Item de Exemplo", "descricao": "Criado via API"}'
```
## Listar Itens (GET)

Utilize este comando para listar todos os itens cadastrados e obter o id necessário para as próximas operações.

```bash
curl -X GET http://localhost:4566/restapis/SEU_ID_AQUI/local/_user_request_/items
```
## Buscar Item por ID (GET)

Substitua ID_DO_ITEM_AQUI pelo identificador retornado na listagem.

```bash
curl -X GET http://localhost:4566/restapis/SEU_ID_AQUI/local/_user_request_/items/ID_DO_ITEM_AQUI
```

## Atualizar Item (PUT)

Esta operação atualiza o item no banco e publica uma notificação de atualização no SNS.

```bash
curl -X PUT http://localhost:4566/restapis/SEU_ID_AQUI/local/_user_request_/items/ID_DO_ITEM_AQUI \
  -H "Content-Type: application/json" \
  -d '{"nome": "Item Atualizado", "descricao": "Alteração realizada com sucesso"}'
```

## Remover Item (DELETE)
```bash
curl -X DELETE http://localhost:4566/restapis/SEU_ID_AQUI/local/_user_request_/items/ID_DO_ITEM_AQUI
```

## Subscriber e Logs do SNS

O projeto possui uma função Lambda inscrita no tópico SNS, responsável por processar as mensagens publicadas.

Para acompanhar os logs do subscriber em tempo real, utilize:

```bash
serverless logs -f processNotification --stage local --tail
```

## Evidências de Funcionamento

O repositório contém prints e logs demonstrando:

* LocalStack em execução via Docker

<img width="839" height="72" alt="Captura de Tela 2025-12-14 às 23 13 56" src="https://github.com/user-attachments/assets/d75cd320-67e3-4045-8913-1721e6f21e44" />

* Deploy realizado com sucesso

<img width="585" height="315" alt="Captura de Tela 2025-12-14 às 23 00 15" src="https://github.com/user-attachments/assets/1c1dfb33-c7ad-400d-8cd9-6a26b26dd309" />

* Execução das operações POST, GET, PUT e DELETE

  * POST 

<img width="852" height="60" alt="Captura de Tela 2025-12-14 às 23 06 06" src="https://github.com/user-attachments/assets/12d8828f-2166-4374-b3eb-742843687163" />

  * GET geral

<img width="843" height="102" alt="Captura de Tela 2025-12-14 às 23 07 34" src="https://github.com/user-attachments/assets/672e4de8-0e1f-490f-9695-a3cf9d823e50" />

  * GET id
    
<img width="845" height="60" alt="Captura de Tela 2025-12-14 às 23 17 33" src="https://github.com/user-attachments/assets/30f66c27-db3a-40fc-96cc-873e17b0e8f9" />

  * PUT

<img width="845" height="76" alt="Captura de Tela 2025-12-14 às 23 18 35" src="https://github.com/user-attachments/assets/9f28842e-460b-4784-a24c-0e7c452e2b42" />

  * DELETE 

<img width="838" height="48" alt="Captura de Tela 2025-12-14 às 23 19 42" src="https://github.com/user-attachments/assets/3e45e8b5-ae41-4aff-87ee-c330e0fe4855" />

  * Publicação e consumo das mensagens SNS

<img width="844" height="104" alt="Captura de Tela 2025-12-14 às 23 21 03" src="https://github.com/user-attachments/assets/80fc7705-e62d-4868-bab3-bc39846e7023" />


Essas evidências comprovam o correto funcionamento da aplicação conforme os requisitos do roteiro.

## Observações

Todo o ambiente AWS é simulado localmente via LocalStack

O projeto atende aos requisitos da Opção A – CRUD Serverless com SNS

O domínio do CRUD pode ser facilmente adaptado para outros contextos (produtos, tarefas, usuários, etc.)

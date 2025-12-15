'use strict';
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// ================================
// CONFIGURAÇÃO LOCALSTACK
// ================================
const endpoint = process.env.LOCALSTACK_HOSTNAME
  ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
  : 'http://localhost:4566';

const awsConfig = {
  endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
};

const dynamoDb = new AWS.DynamoDB.DocumentClient(awsConfig);
const sns = new AWS.SNS(awsConfig);

// ================================
// CREATE (PUBLICA NO SNS)
// ================================
module.exports.createItem = async (event) => {
  try {
    const { nome, descricao } = JSON.parse(event.body || '{}');

    if (!nome) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nome obrigatório' }) };
    }

    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      nome,
      descricao,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamoDb.put({
      TableName: process.env.ITEMS_TABLE,
      Item: item,
    }).promise();

    await sns.publish({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: 'Novo Item Criado',
      Message: JSON.stringify({ event: 'CRIADO', item }),
    }).promise();

    return { statusCode: 201, body: JSON.stringify(item) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// LIST
// ================================
module.exports.listItems = async () => {
  try {
    const data = await dynamoDb.scan({
      TableName: process.env.ITEMS_TABLE,
    }).promise();

    return { statusCode: 200, body: JSON.stringify(data.Items || []) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// GET BY ID
// ================================
module.exports.getItem = async (event) => {
  try {
    const { id } = event.pathParameters;

    const data = await dynamoDb.get({
      TableName: process.env.ITEMS_TABLE,
      Key: { id },
    }).promise();

    if (!data.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Item não encontrado' }) };
    }

    return { statusCode: 200, body: JSON.stringify(data.Item) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// UPDATE (PUBLICA NO SNS)
// ================================
module.exports.updateItem = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { nome, descricao } = JSON.parse(event.body || '{}');
    const timestamp = new Date().toISOString();

    if (!nome) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nome obrigatório' }) };
    }

    const params = {
      TableName: process.env.ITEMS_TABLE,
      Key: { id },
      UpdateExpression: 'SET nome = :n, descricao = :d, updatedAt = :t',
      ExpressionAttributeValues: {
        ':n': nome,
        ':d': descricao,
        ':t': timestamp,
      },
      ReturnValues: 'ALL_NEW',
    };

    const data = await dynamoDb.update(params).promise();

    await sns.publish({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: 'Item Atualizado',
      Message: JSON.stringify({ event: 'ATUALIZADO', item: data.Attributes }),
    }).promise();

    return { statusCode: 200, body: JSON.stringify(data.Attributes) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// DELETE
// ================================
module.exports.deleteItem = async (event) => {
  try {
    const { id } = event.pathParameters;

    await dynamoDb.delete({
      TableName: process.env.ITEMS_TABLE,
      Key: { id },
    }).promise();

    return { statusCode: 200, body: JSON.stringify({ message: 'Item removido com sucesso' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// SUBSCRIBE EMAIL (HTTP)
// ================================
module.exports.subscribeEmail = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email obrigatório' }) };
    }

    const data = await sns.subscribe({
      Protocol: 'email',
      TopicArn: process.env.SNS_TOPIC_ARN,
      Endpoint: email,
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Email inscrito. Confirme no email.',
        subscriptionArn: data.SubscriptionArn,
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// ================================
// SUBSCRIBER (SNS)
// ================================
module.exports.processNotification = async (event) => {
  for (const record of event.Records) {
    console.log('[SNS]', record.Sns.Subject);
    console.log('[SNS]', record.Sns.Message);
  }
  return { statusCode: 200, body: 'OK' };
};

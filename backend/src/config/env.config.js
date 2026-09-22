'use strict';

const path = require('path');

const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),
  grpcHost: process.env.GRPC_HOST || '0.0.0.0',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/demo_stack',
  elasticsearchNode: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  elasticsearchIndex: process.env.ELASTICSEARCH_INDEX || 'records',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsEndpoint: process.env.AWS_ENDPOINT || (process.env.NODE_ENV === 'test' ? 'http://localhost:4566' : undefined),
  snsTopicArn: process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:000000000000:records-topic',
  sesFromEmail: process.env.SES_FROM_EMAIL || 'notifications@example.com',
  protoPath: path.resolve(__dirname, '../../../shared/proto/record.proto'),
};

module.exports = env;

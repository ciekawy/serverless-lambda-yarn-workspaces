import Redis from 'ioredis'
import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const REDIS_HOST = process.env.REDIS_HOST || 'cache.amazonaws.com'

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  let redis;
  let redis_debug = 'abc';
  if ( REDIS_HOST.includes( 'cache.amazonaws.com' ) ) {
    redis = new Redis({
      port: 6379,
      host: REDIS_HOST,
      maxRetriesPerRequest: 0,
      retryStrategy( times ) {
        return Math.min( times * 50, 500 )
      }
    })

    redis_debug += ' def';

    redis.on( 'error', (e) => console.log( `REDIS: Error > ${e.message}` ) )
    redis.on( 'connect', () => console.log( `REDIS: Connect > ${REDIS_HOST}` ) )
  }

  return formatJSONResponse({
    message: `Hello ${event?.body?.name}, ${redis_debug}, welcome to the exciting Serverless world!`,
    event,
  });
}

export const main = middyfy(hello);

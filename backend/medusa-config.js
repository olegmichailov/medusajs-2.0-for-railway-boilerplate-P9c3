import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import path from 'path';
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
  MINIO_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MEILISEARCH_HOST,
  MEILISEARCH_ADMIN_KEY,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL
} from 'lib/constants';

// Загружаем переменные окружения
loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: true, // Включено логирование БД
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    },
    storeName: process.env.STORE_NAME || 'Gmorkl Store'
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: MINIO_ENDPOINT,
              accessKey: MINIO_ACCESS_KEY,
              secretKey: MINIO_SECRET_KEY,
              bucket: MINIO_BUCKET
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`
            }
          }])
        ]
      }
    },
    ...(REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL
      }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        }
      }
    }] : []),
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          ...(RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
            resolve: path.resolve(__dirname, './src/modules/email-notifications/services/resend'),
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: RESEND_API_KEY,
              from: RESEND_FROM_EMAIL,
            },
          }] : [])
        ],
      }
    },
    ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET ? [{
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
              webhookEndpoint: `${BACKEND_URL}/api/webhooks/stripe`, // ✅ Исправлен путь
              enableLogging: true, // 🔥 Включаем логирование Stripe событий
            },
          },
        ],
      },
    }] : [])
  ],
  plugins: []
};

// 🔥 Проверка загрузки Resend
console.log("🔍 Проверка загрузки провайдеров уведомлений:", medusaConfig.modules.find(m => m.key === Modules.NOTIFICATION)?.options?.providers);

// 🔥 Проверка пути к Stripe Webhook
console.log("✅ Stripe webhook URL:", `${BACKEND_URL}/api/webhooks/stripe`);

export default defineConfig(medusaConfig);

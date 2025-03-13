import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import path from 'path';

// Загружаем переменные окружения
loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseLogging: true,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.WORKER_MODE,
    http: {
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      storeCors: process.env.STORE_CORS,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    storeName: process.env.STORE_NAME || 'Gmorkl Store',
  },
  admin: {
    backendUrl: process.env.BACKEND_URL,
    disable: process.env.SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY
            ? {
                resolve: './src/modules/minio-file',
                id: 'minio',
                options: {
                  endPoint: process.env.MINIO_ENDPOINT,
                  accessKey: process.env.MINIO_ACCESS_KEY,
                  secretKey: process.env.MINIO_SECRET_KEY,
                  bucket: process.env.MINIO_BUCKET,
                },
              }
            : {
                resolve: '@medusajs/file-local',
                id: 'local',
                options: {
                  upload_dir: 'static',
                  backend_url: `${process.env.BACKEND_URL}/static`,
                },
              },
        ],
      },
    },
    process.env.REDIS_URL
      ? {
          key: Modules.EVENT_BUS,
          resolve: '@medusajs/event-bus-redis',
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        }
      : null,
    process.env.REDIS_URL
      ? {
          key: Modules.WORKFLOW_ENGINE,
          resolve: '@medusajs/workflow-engine-redis',
          options: {
            redis: {
              url: process.env.REDIS_URL,
            },
          },
        }
      : null,
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          {
            resolve: path.resolve(__dirname, './src/modules/email-notifications/services/resend'),
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
    process.env.STRIPE_API_KEY && process.env.STRIPE_WEBHOOK_SECRET
      ? {
          key: Modules.PAYMENT,
          resolve: '@medusajs/payment',
          options: {
            providers: [
              {
                resolve: '@medusajs/payment-stripe',
                id: 'stripe',
                options: {
                  apiKey: process.env.STRIPE_API_KEY,
                  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  webhookEndpoint: `${process.env.BACKEND_URL}/hooks/payments/stripe`,
                  enableLogging: true,
                },
              },
            ],
          },
        }
      : null,
  ].filter(Boolean),
  plugins: [],
};

console.log(
  '🔍 Проверка загрузки провайдеров уведомлений:',
  medusaConfig.modules.find((m) => m.key === Modules.NOTIFICATION)?.options?.providers
);

export default defineConfig(medusaConfig);

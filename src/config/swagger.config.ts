import { serverport } from "./environment.config";

export const SWAGGEROPTIONS = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "NIYO Assessment API Documentation",
        version: "0.1.0",
        description:
          "These contains the API documentations, data models, and relevant information necessary for understanding and consuming the API",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "NIYO ASSESSMENT",
          url: "https://assessment.com",
          email: "api@assessment.com",
        },
      },

      servers: [
        {
          url: `http://localhost:${serverport}/api`,
          "description": "Local API Server",
        },
      ],

      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            in: 'header',
            name: 'Authorization',
            description: 'Bearer token to access these API endpoints',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: {
            type: "apiKey",
            name: "x-api-key",
            in: "header",
            description: "API key",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
          apiKeyAuth: [],
        },
      ],

    },
    apis: ["./src/docs/*.ts"],
  };

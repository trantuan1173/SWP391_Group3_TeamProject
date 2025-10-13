// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API quản lý",
    },
    components: {
      schemas: {
        Employee: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
            identityNumber: {
              type: "string",
              example: "123456789",
            },
            phoneNumber: {
              type: "string",
              example: "123456789",
            },
            address: {
              type: "string",
              example: "123 Main St",
            },
            dateOfBirth: {
              type: "string",
              example: "2022-01-01",
            },
            gender: {
              type: "string",
              example: "male",
            },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "/api",
      },
    ],
  },
  apis: [
    "./routes/AdminRouter.js", "./routes/EmployeeRouter.js", "./routes/PatientRouter.js", "./routes/ServiceRouter.js", "./routes/MedicalRecordRouter.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

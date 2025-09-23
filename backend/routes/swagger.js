// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API quản lý",
    },
    components: {
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
    "./routes/DoctorRouter.js",
    "./routes/PatientRouter.js",
    "./routes/UserRouter.js",
    "./routes/StaffRouter.js",
    "./routes/AdminRouter.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Campus Lost & Found API",
    version: "1.0.0",
    description: "Backend API for a campus lost & found platform: users, items, images, categories and admin.",
  },
  servers: [{ url: "http://localhost:6000", description: "Local development server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["student", "admin"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string", description: "JWT — send as Authorization: Bearer <token>" },
        },
      },
      Item: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: ["lost", "found"] },
          category: { type: "string" },
          location: { type: "string" },
          status: { type: "string", enum: ["ACTIVE", "RECOVERED"] },
          images: { type: "array", items: { type: "string" } },
          user: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }], description: "Owner id (or populated owner)" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "fail" },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Create an account (role defaults to student)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string", minLength: 8 } } } } },
        },
        responses: { 201: { description: "User + token", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, 400: { $ref: "#/components/responses/BadRequest" }, 409: { description: "Email already registered" } },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log in and receive a JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } },
        },
        responses: { 200: { description: "User + token", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, 401: { description: "Invalid email or password" } },
      },
    },
    "/api/users/me": {
      get: {
        summary: "Get the logged-in user's profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
      patch: {
        summary: "Update the logged-in user's name",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } } },
        responses: { 200: { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } },
      },
    },
    "/api/users": {
      get: {
        summary: "List all users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "All users", content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" }, users: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } } }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/api/items": {
      get: {
        summary: "List items — supports search, filters, pagination (public)",
        parameters: [
          { name: "title", in: "query", schema: { type: "string" } },
          { name: "description", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["lost", "found"] } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "RECOVERED"] } },
          { name: "from", in: "query", schema: { type: "string", format: "date" } },
          { name: "to", in: "query", schema: { type: "string", format: "date" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
        ],
        responses: { 200: { description: "Paginated items (newest first)", content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/Item" } }, page: { type: "integer" }, limit: { type: "integer" }, totalPages: { type: "integer" } } } } } } },
      },
      post: {
        summary: "Create an item report (type: lost or found)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "description", "type", "category", "location"], properties: { title: { type: "string" }, description: { type: "string" }, type: { type: "string", enum: ["lost", "found"] }, category: { type: "string" }, location: { type: "string" } } } } } },
        responses: { 201: { description: "Created item", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/api/items/{id}": {
      get: {
        summary: "Get one item (owner name/email populated)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Item", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 404: { description: "Item not found" } },
      },
      patch: {
        summary: "Update item details and/or status (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, category: { type: "string" }, location: { type: "string" }, status: { type: "string", enum: ["ACTIVE", "RECOVERED"] } } } } } },
        responses: { 200: { description: "Updated item", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { description: "Item not found" } },
      },
      delete: {
        summary: "Delete an item (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { description: "Item not found" } },
      },
    },
    "/api/items/{id}/images": {
      post: {
        summary: "Upload images to an item (owner only). Field name: images. Max 5 files, max 5MB each, JPG/PNG/WebP.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["images"], properties: { images: { type: "array", items: { type: "string", format: "binary" } } } } } } },
        responses: { 200: { description: "Item with updated images array", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 400: { description: "No files / bad type / too large / too many" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/api/items/{id}/images/{filename}": {
      delete: {
        summary: "Remove an image (owner only) — updates DB and deletes the file",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "filename", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Item without that image", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 404: { description: "Image not attached to the item" } },
      },
    },
    "/api/categories": {
      get: { summary: "List categories (public)", responses: { 200: { description: "All categories", content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" }, categories: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } } } } } },
      post: {
        summary: "Create a category (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } } },
        responses: { 201: { description: "Created category", content: { "application/json": { schema: { type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } } } } }, 409: { description: "Duplicate category name" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/api/categories/{id}": {
      patch: {
        summary: "Rename a category (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" } } } } } },
        responses: { 200: { description: "Updated category", content: { "application/json": { schema: { type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } } } } }, 404: { description: "Category not found" } },
      },
      delete: {
        summary: "Delete a category (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" }, 404: { description: "Category not found" } },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        summary: "View any user (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } }, 404: { description: "User not found" } },
      },
      delete: {
        summary: "Delete a user (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" }, 400: { description: "Cannot delete your own account" }, 404: { description: "User not found" } },
      },
    },
    "/api/admin/users/{id}/role": {
      patch: {
        summary: "Change a user's role (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["role"], properties: { role: { type: "string", enum: ["student", "admin"] } } } } } },
        responses: { 200: { description: "Updated user", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } }, 400: { description: "Bad role, or cannot change your own role" }, 404: { description: "User not found" } },
      },
    },
    "/api/admin/items/{id}": {
      delete: {
        summary: "Delete any item report (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 204: { description: "Deleted" }, 404: { description: "Item not found" } },
      },
    },
    "/api/admin/items/{id}/status": {
      patch: {
        summary: "Force-change an item's status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["ACTIVE", "RECOVERED"] } } } } } },
        responses: { 200: { description: "Updated item", content: { "application/json": { schema: { type: "object", properties: { item: { $ref: "#/components/schemas/Item" } } } } } }, 400: { description: "Bad status" }, 404: { description: "Item not found" } },
      },
    },
  },
  responses: {},
};

swaggerSpec.responses = {
  BadRequest: { description: "Invalid/missing input", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  Unauthorized: { description: "Missing or invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  Forbidden: { description: "Not enough permission (admin required)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
};

module.exports = { swaggerSpec };
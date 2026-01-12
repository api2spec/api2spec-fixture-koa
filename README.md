# api2spec-fixture-koa

A Koa TypeScript API fixture for testing api2spec.

## Installation

```bash
pnpm install
```

## Running

Development mode with hot reload:

```bash
pnpm dev
```

Production mode:

```bash
pnpm start
```

The server runs on http://localhost:8080

## Endpoints

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness check

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user
- `GET /users/:userId/posts` - Get posts by user

### Posts
- `GET /posts` - List all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create a post

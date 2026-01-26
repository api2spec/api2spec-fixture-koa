import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp, resetStores } from './app.js'

const app = createApp()

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return health status with ok', async () => {
      const response = await request(app.callback()).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
      expect(response.body.version).toBe('0.1.0')
    })
  })

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app.callback()).get('/health/ready')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ready')
      expect(response.body.version).toBe('0.1.0')
    })
  })
})

describe('Users API', () => {
  beforeEach(() => {
    resetStores()
  })

  describe('GET /users', () => {
    it('should return list of users', async () => {
      const response = await request(app.callback()).get('/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
      })
    })
  })

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const response = await request(app.callback()).get('/users/1')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
      })
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.callback()).get('/users/999')

      expect(response.status).toBe(404)
      expect(response.body.code).toBe('NOT_FOUND')
      expect(response.body.message).toBe('User not found')
    })

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app.callback()).get('/users/invalid')

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Invalid user ID format')
    })
  })

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app.callback())
        .post('/users')
        .send({ name: 'Charlie', email: 'charlie@example.com' })

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: 3,
        name: 'Charlie',
        email: 'charlie@example.com',
      })
    })

    it('should return 400 for missing name', async () => {
      const response = await request(app.callback())
        .post('/users')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Name and email are required')
    })

    it('should return 400 for missing email', async () => {
      const response = await request(app.callback())
        .post('/users')
        .send({ name: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Name and email are required')
    })

    it('should return 400 for empty body', async () => {
      const response = await request(app.callback())
        .post('/users')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /users/:id', () => {
    it('should update an existing user', async () => {
      const response = await request(app.callback())
        .put('/users/1')
        .send({ name: 'Alice Updated', email: 'alice.updated@example.com' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Alice Updated',
        email: 'alice.updated@example.com',
      })
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.callback())
        .put('/users/999')
        .send({ name: 'Test', email: 'test@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.code).toBe('NOT_FOUND')
      expect(response.body.message).toBe('User not found')
    })

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app.callback())
        .put('/users/invalid')
        .send({ name: 'Test', email: 'test@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Invalid user ID format')
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.callback())
        .put('/users/1')
        .send({ name: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Name and email are required')
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete an existing user', async () => {
      const response = await request(app.callback()).delete('/users/1')

      expect(response.status).toBe(204)

      // Verify user is deleted
      const getResponse = await request(app.callback()).get('/users/1')
      expect(getResponse.status).toBe(404)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.callback()).delete('/users/999')

      expect(response.status).toBe(404)
      expect(response.body.code).toBe('NOT_FOUND')
      expect(response.body.message).toBe('User not found')
    })

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app.callback()).delete('/users/invalid')

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Invalid user ID format')
    })
  })

  describe('GET /users/:userId/posts', () => {
    it('should return posts for a user', async () => {
      const response = await request(app.callback()).get('/users/1/posts')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        userId: 1,
        title: 'First Post',
      })
    })

    it('should return empty array for user with no posts', async () => {
      const response = await request(app.callback()).get('/users/2/posts')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.callback()).get('/users/999/posts')

      expect(response.status).toBe(404)
      expect(response.body.code).toBe('NOT_FOUND')
      expect(response.body.message).toBe('User not found')
    })

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app.callback()).get('/users/invalid/posts')

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Invalid user ID format')
    })
  })
})

describe('Posts API', () => {
  beforeEach(() => {
    resetStores()
  })

  describe('GET /posts', () => {
    it('should return list of posts', async () => {
      const response = await request(app.callback()).get('/posts')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        id: 1,
        userId: 1,
        title: 'First Post',
        body: 'Hello world',
      })
    })
  })

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const response = await request(app.callback()).get('/posts/1')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: 1,
        userId: 1,
        title: 'First Post',
        body: 'Hello world',
      })
    })

    it('should return 404 for non-existent post', async () => {
      const response = await request(app.callback()).get('/posts/999')

      expect(response.status).toBe(404)
      expect(response.body.code).toBe('NOT_FOUND')
      expect(response.body.message).toBe('Post not found')
    })

    it('should return 400 for invalid post ID format', async () => {
      const response = await request(app.callback()).get('/posts/invalid')

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Invalid post ID format')
    })
  })

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({ userId: 1, title: 'New Post', body: 'Post content' })

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: 3,
        userId: 1,
        title: 'New Post',
        body: 'Post content',
      })
    })

    it('should return 400 for missing userId', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({ title: 'New Post', body: 'Post content' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('userId, title, and body are required')
    })

    it('should return 400 for missing title', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({ userId: 1, body: 'Post content' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('userId, title, and body are required')
    })

    it('should return 400 for missing body', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({ userId: 1, title: 'New Post' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('userId, title, and body are required')
    })

    it('should return 400 for non-existent user', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({ userId: 999, title: 'New Post', body: 'Post content' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('User does not exist')
    })

    it('should return 400 for empty body', async () => {
      const response = await request(app.callback())
        .post('/posts')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
  })
})

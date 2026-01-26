import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  userId: number
  title: string
  body: string
}

// In-memory stores for testing
const users: Map<number, User> = new Map([
  [1, { id: 1, name: 'Alice', email: 'alice@example.com' }],
  [2, { id: 2, name: 'Bob', email: 'bob@example.com' }],
])

const posts: Map<number, Post> = new Map([
  [1, { id: 1, userId: 1, title: 'First Post', body: 'Hello world' }],
  [2, { id: 2, userId: 1, title: 'Second Post', body: 'Another post' }],
])

let nextUserId = 3
let nextPostId = 3

export function resetStores() {
  users.clear()
  users.set(1, { id: 1, name: 'Alice', email: 'alice@example.com' })
  users.set(2, { id: 2, name: 'Bob', email: 'bob@example.com' })
  posts.clear()
  posts.set(1, { id: 1, userId: 1, title: 'First Post', body: 'Hello world' })
  posts.set(2, { id: 2, userId: 1, title: 'Second Post', body: 'Another post' })
  nextUserId = 3
  nextPostId = 3
}

export function createApp() {
  const app = new Koa()
  const router = new Router()

  // Health routes
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', version: '0.1.0' }
  })

  router.get('/health/ready', (ctx) => {
    ctx.body = { status: 'ready', version: '0.1.0' }
  })

  // User routes
  router.get('/users', (ctx) => {
    ctx.body = Array.from(users.values())
  })

  router.get('/users/:id', (ctx) => {
    const id = parseInt(ctx.params.id)
    if (isNaN(id)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Invalid user ID format' }
      return
    }
    const user = users.get(id)
    if (!user) {
      ctx.status = 404
      ctx.body = { code: 'NOT_FOUND', message: 'User not found' }
      return
    }
    ctx.body = user
  })

  router.post('/users', (ctx) => {
    const body = ctx.request.body as Partial<User>
    if (!body.name || !body.email) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Name and email are required' }
      return
    }
    const user: User = {
      id: nextUserId++,
      name: body.name,
      email: body.email,
    }
    users.set(user.id, user)
    ctx.status = 201
    ctx.body = user
  })

  router.put('/users/:id', (ctx) => {
    const id = parseInt(ctx.params.id)
    if (isNaN(id)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Invalid user ID format' }
      return
    }
    const existingUser = users.get(id)
    if (!existingUser) {
      ctx.status = 404
      ctx.body = { code: 'NOT_FOUND', message: 'User not found' }
      return
    }
    const body = ctx.request.body as Partial<User>
    if (!body.name || !body.email) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Name and email are required' }
      return
    }
    const user: User = { ...existingUser, name: body.name, email: body.email }
    users.set(id, user)
    ctx.body = user
  })

  router.delete('/users/:id', (ctx) => {
    const id = parseInt(ctx.params.id)
    if (isNaN(id)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Invalid user ID format' }
      return
    }
    if (!users.has(id)) {
      ctx.status = 404
      ctx.body = { code: 'NOT_FOUND', message: 'User not found' }
      return
    }
    users.delete(id)
    ctx.status = 204
  })

  router.get('/users/:userId/posts', (ctx) => {
    const userId = parseInt(ctx.params.userId)
    if (isNaN(userId)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Invalid user ID format' }
      return
    }
    if (!users.has(userId)) {
      ctx.status = 404
      ctx.body = { code: 'NOT_FOUND', message: 'User not found' }
      return
    }
    const userPosts = Array.from(posts.values()).filter((p) => p.userId === userId)
    ctx.body = userPosts
  })

  // Post routes
  router.get('/posts', (ctx) => {
    ctx.body = Array.from(posts.values())
  })

  router.get('/posts/:id', (ctx) => {
    const id = parseInt(ctx.params.id)
    if (isNaN(id)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'Invalid post ID format' }
      return
    }
    const post = posts.get(id)
    if (!post) {
      ctx.status = 404
      ctx.body = { code: 'NOT_FOUND', message: 'Post not found' }
      return
    }
    ctx.body = post
  })

  router.post('/posts', (ctx) => {
    const body = ctx.request.body as Partial<Post>
    if (!body.userId || !body.title || !body.body) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'userId, title, and body are required' }
      return
    }
    if (!users.has(body.userId)) {
      ctx.status = 400
      ctx.body = { code: 'VALIDATION_ERROR', message: 'User does not exist' }
      return
    }
    const post: Post = {
      id: nextPostId++,
      userId: body.userId,
      title: body.title,
      body: body.body,
    }
    posts.set(post.id, post)
    ctx.status = 201
    ctx.body = post
  })

  app.use(bodyParser())
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}

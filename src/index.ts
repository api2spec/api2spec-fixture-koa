import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

const app = new Koa()
const router = new Router()

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

// Health routes
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok', version: '0.1.0' }
})

router.get('/health/ready', (ctx) => {
  ctx.body = { status: 'ready', version: '0.1.0' }
})

// User routes
router.get('/users', (ctx) => {
  ctx.body = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ]
})

router.get('/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id)
  ctx.body = { id, name: 'Sample User', email: 'user@example.com' }
})

router.post('/users', (ctx) => {
  const body = ctx.request.body as User
  ctx.status = 201
  ctx.body = { ...body, id: 1 }
})

router.put('/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id)
  const body = ctx.request.body as User
  ctx.body = { ...body, id }
})

router.delete('/users/:id', (ctx) => {
  ctx.status = 204
})

router.get('/users/:userId/posts', (ctx) => {
  const userId = parseInt(ctx.params.userId)
  ctx.body = [{ id: 1, userId, title: 'User Post', body: 'Content' }]
})

// Post routes
router.get('/posts', (ctx) => {
  ctx.body = [
    { id: 1, userId: 1, title: 'First Post', body: 'Hello world' },
    { id: 2, userId: 1, title: 'Second Post', body: 'Another post' },
  ]
})

router.get('/posts/:id', (ctx) => {
  const id = parseInt(ctx.params.id)
  ctx.body = { id, userId: 1, title: 'Sample Post', body: 'Post body' }
})

router.post('/posts', (ctx) => {
  const body = ctx.request.body as Post
  ctx.status = 201
  ctx.body = { ...body, id: 1 }
})

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8080, () => {
  console.log('Server running on http://localhost:8080')
})

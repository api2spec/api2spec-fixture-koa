import { createApp } from './app.js'

const app = createApp()

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})

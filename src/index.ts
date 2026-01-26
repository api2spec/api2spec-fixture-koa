import { createApp } from './app.js'

const app = createApp()

app.listen(8080, () => {
  console.log('Server running on http://localhost:8080')
})

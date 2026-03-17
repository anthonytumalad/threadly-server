import "dotenv/config"
import express from 'express'

const app = express()
const PORT = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello from Threadly server!')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
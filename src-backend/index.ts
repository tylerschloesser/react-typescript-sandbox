const express = require('express')
const app = express()
const port = 3000

const fs = require('fs')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

app.get('/api', async (req, res) => {
  try {
    const rss = await readFile('./src-backend/example-frontpage.rss')
    // simulate latency
    setTimeout(() => {
      res.send(rss)
    }, 100)
  } catch (error) {
    res.status(500).send('not good')
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
  console.log('test reload hi')
})

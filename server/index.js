const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pool = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,

});

pool.query('CREATE TABLE IF NOT EXISTS values (number INT)', (err, res) => {
  console.log(err, res)
  //pool.end()
})

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pool.query('SELECT * from values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  console.log('about to insert to pg'+index)
  const query = {
    text: 'INSERT INTO values(number) VALUES($1)',
    values: [index],
  }
  console.log('pool obj:'+pool)

  pool.query(query, (err, res) => {
    if (err) {
      console.log("Error:"+err.stack)
    } else {
      console.log("Rows[0]"+res.rows[0])
    }
  })

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Listening');
});

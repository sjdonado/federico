const express = require('express');
const cp = require('child_process');

const app = express();

const childProcess = cp.spawn('python3', ['transfer-learning-conv-ai/interact.py']);

const senderQueue = [];

childProcess.stdout.on('data', (data) => {
  console.log('LOG:', data.toString());
  if (senderQueue.length > 0) {
    senderQueue.shift().send(data.toString().replace('>>>', ''));
  }
});

app.get('/talk', function (req, res) {
  senderQueue.push(res);
  childProcess.stdin.write(req.query.text + '\n');
});

app.listen(3000, () => {
  console.log('Server running at localhost:3000')
});
const express = require('express');
const deploy = require('./deploy');
require('dotenv').config();

const app = express();
app.use(express.json());

const SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;

    // Optional: verify secret
    // const signature = req.headers['x-hub-signature-256'];

    // Only deploy for main branch
    console.log(payload)
    if (payload.ref === `refs/heads/${process.env.BRANCH}`) {
      console.log('Webhook received: deploying...');
      await deploy();
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Deployment failed');
  }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Webhook server listening on port ${PORT}`));

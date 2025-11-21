const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Bridge placeholder running'));

app.post('/send', (req, res) => {
  // expected from n8n: { to, message }
  console.log('Send request', req.body);
  res.json({ status: 'ok', sent: false, note: 'Placeholder - replace with real Venom logic' });
});

app.post('/receive', (req, res) => {
  // expected from WhatsApp provider; forward to n8n webhook if set
  const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL;
  if (N8N_WEBHOOK) {
    axios.post(N8N_WEBHOOK, req.body).catch(e => console.error('forward error', e.message));
  }
  res.json({ status: 'forwarded' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bridge placeholder listening on ${PORT}`));

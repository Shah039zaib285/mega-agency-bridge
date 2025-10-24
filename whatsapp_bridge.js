import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'
import qrcode from 'qrcode-terminal'

const app = express()
app.use(bodyParser.json())
const PORT = process.env.PORT || 3000
const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL

let sock

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  sock = makeWASocket({ auth: state })
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection } = update
    if (update.qr) {
      qrcode.generate(update.qr, { small: true })
      console.log('Scan QR from Railway logs')
    }
    if (connection === 'close') startSock()
  })

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0]
      if (!msg || msg.key.fromMe) return
      const remoteJid = msg.key.remoteJid
      let text = msg.message.conversation ||
                 msg.message.extendedTextMessage?.text || ''
      if (text) await axios.post(N8N_WEBHOOK, { from: remoteJid, text })
    } catch (e) { console.error('Upsert error', e) }
  })
}

startSock()

app.post('/send', async (req, res) => {
  try {
    const { to, text } = req.body
    await sock.sendMessage(to, { text })
    res.send({ success: true })
  } catch (e) {
    res.status(500).send({ success: false, message: e.message })
  }
})

app.get('/', (_, res) => res.send('Mega Agency Bridge Running'))
app.listen(PORT, () => console.log('Bridge running on', PORT))

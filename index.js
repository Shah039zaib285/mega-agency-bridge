const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint for UptimeRobot
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Mega Agency Bridge',
    timestamp: new Date().toISOString()
  });
});

// WhatsApp webhook endpoint
app.post('/webhook/bridge', async (req, res) => {
  try {
    const bridgeData = req.body;
    
    console.log('📱 WhatsApp message received:', {
      from: bridgeData.from,
      message: bridgeData.content?.text,
      timestamp: new Date().toISOString()
    });

    // Convert Bridge API format to n8n expected format
    const n8nPayload = {
      from: bridgeData.from || bridgeData.sender,
      body: bridgeData.content?.text || bridgeData.message,
      media: bridgeData.content?.media || null,
      messageType: bridgeData.type || 'text',
      timestamp: bridgeData.timestamp || new Date().toISOString()
    };

    // Forward to n8n webhook
    const n8nResponse = await axios.post(
      `${process.env.N8N_WEBHOOK_URL}/webhook`,
      n8nPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': process.env.BRIDGE_WEBHOOK_SECRET
        },
        timeout: 10000
      }
    );

    console.log('✅ Message forwarded to n8n');
    res.status(200).json({ status: 'processed', success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      success: false 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mega Agency Bridge running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
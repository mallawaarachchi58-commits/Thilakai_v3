require("dotenv").config();

const http = require("http");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const PORT = 3001;

const server = http.createServer((req, res) => {

  if (req.method === "GET" && req.url === "/") {

    fs.readFile("index.html", (err, data) => {

      if (err) {
        res.writeHead(500, {
          "Content-Type": "text/plain"
        });

        return res.end("Could not load Thilak AI");
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      res.end(data);
    });

    return;
  }

  if (req.method === "POST" && req.url === "/chat") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const { message } = JSON.parse(body);

        const result = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: message
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: result.text
        }));

      } catch (error) {

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: error.message
        }));

      }

    });

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/plain"
  });

  res.end("Not Found");

});

server.listen(PORT, () => {
  console.log(`🤖 Thilak AI v3 running on port ${PORT}`);
});

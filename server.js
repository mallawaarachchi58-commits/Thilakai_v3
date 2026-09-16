require("dotenv").config();

const http = require("http");
const fs = require("fs");
const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_TOKEN);

const server = http.createServer((req, res) => {

  if (req.url === "/") {
    fs.readFile("index.html", (err, data) => {
      res.writeHead(200, {
        "Content-Type": "text/html"
      });
      res.end(data);
    });
    return;
  }

  if (req.url === "/chat" && req.method === "POST") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const message = JSON.parse(body).message;

        const result = await hf.chatCompletion({

model: "deepseek-ai/DeepSeek-V4.1-Flash",provider: "novita",

          messages: [
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 200
        });

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: result.choices[0].message.content
        }));

      } catch(error) {

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

  res.writeHead(404);
  res.end("Not Found");

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🤖 Thilak AI running on port " + PORT);
});

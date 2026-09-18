require("dotenv").config();

const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {

  if (req.url === "/") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading page");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=UTF-8"
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

        console.log("AI REQUEST:", message);

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.GEMINI_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: message
                  }
                ]
              }
            ]
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || JSON.stringify(result));
        }

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "No response from Gemini."
        }));

      } catch (error) {
        console.error("===== HUGGING FACE ERROR =====");
        console.error(error);
        console.error("MESSAGE:", error.message);
        console.error("STATUS:", error.status);
        console.error("==============================");

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

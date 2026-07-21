console.log("server.ts loaded")
console.log("ALL ENV:", JSON.stringify(process.env, null, 2))

try {
  console.log("importing app...")
  const { app } = require("./app")
  console.log("app imported")
  
  const { Server } = require("http")
  const httpServer = new Server(app)
  const PORT = Number(process.env.PORT) || 5000
  console.log("listening on", PORT)
  httpServer.listen(PORT, () => {
    console.log("Server running on port", PORT)
  })
} catch (err) {
  console.error("CRASH DURING IMPORT:", err)
  process.exit(1)
}
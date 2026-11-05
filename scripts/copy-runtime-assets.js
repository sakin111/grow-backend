const fs = require("node:fs");
const path = require("node:path");

const source = path.join(__dirname, "..", "src", "app", "utils", "templates");
const destination = path.join(__dirname, "..", "dist", "src", "app", "utils", "templates");

fs.cpSync(source, destination, { recursive: true });

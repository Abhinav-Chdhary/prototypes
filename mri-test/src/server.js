import dotenv from "dotenv";
import { DEFAULT_PORT } from "./config/defaults.js";
import { createApp } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT || DEFAULT_PORT);
const app = createApp();

app.listen(port, () => {
  console.log(`Reporting pipeline API listening on http://localhost:${port}`);
});


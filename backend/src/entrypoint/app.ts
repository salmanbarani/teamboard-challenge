import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { CounterRouter } from "./routes/counters";
import { TeamRouter } from "./routes/teams";
import { setupSwagger } from "./swagger/swagger";



const app = express();



app.set('trust proxy', true);
app.use(json());


app.use(CounterRouter);
setupSwagger(app);
app.use(TeamRouter);


app.all('*', async (req, res) => {
    res.status(404).send("path not found")
  });

export {app};
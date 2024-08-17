const express = require("express");
require("dotenv").config({ path: "dot.env" });
require("./db/mongoose");
const userRouter = require("./routers/users.js");
const taskRouter = require("./routers/task.js");

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

/*
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.send("GET requests are disable");
  } else {
    next();
  }
});
*/

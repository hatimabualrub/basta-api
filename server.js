const express = require("express");
const dotenv = require("dotenv");
const productRouter = require("./routers/productRouter.js");
const userRouter = require("./routers/userRouter.js");
const orderRouter = require("./routers/orederRouter.js");
require("./db/mongoose");

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

port = process.env.PORT || 5000;

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || "sb")
);
app.get("/", (req, res) => res.send("Server is ready"));

app.listen(port, () => console.log(`Server is up and running on port ${port}`));

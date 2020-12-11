const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const data = require("../data");
const auth = require("../auth/auth");
const adminAuth = require("../auth/adminAuth");
const Product = require("../models/productModel");

const productRouter = express.Router();

productRouter.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.send(product._id);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

productRouter.get("/", async (req, res) => {
  try {
    let products = await Product.find({});
    if (req.query.name && req.query.category !== "All") {
      products = await Product.find({
        name: { $regex: req.query.name, $options: "i" },
        category: req.query.category,
      });
    } else if (req.query.name && req.query.category === "All") {
      products = await Product.find({
        name: { $regex: req.query.name, $options: "i" },
      });
    } else if (req.query.category !== "All" && req.query.category) {
      products = await Product.find({ category: req.query.category });
    }
    res.send(products);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

productRouter.get("/seed", async (req, res) => {
  try {
    // await Product.remove({});
    const createdProducts = await Product.insertMany(data.products);
    res.send(createdProducts);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product Not Found" });
    }
    res.send(product);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

const upload = multer({
  limits: {
    fileSize: 6000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

productRouter.post(
  "/images/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send({ message: "Product Not Found" });
      }
      const imageBuffer = await sharp(req.file.buffer).png().toBuffer();
      product.image = imageBuffer;
      product.save();
      res.send();
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  },
  (error, req, res, next) => res.status(400).send({ message: error.message })
);

productRouter.get("/images/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).send({ message: "Product Image Not Found" });
    }
    res.set("Content-Type", "image/png");
    res.send(product.image);
  } catch (e) {}
});

module.exports = productRouter;

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: Buffer },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

productSchema.methods.toJSON = function () {
  const product = this;
  const publicProduct = product.toObject();

  delete publicProduct.image;

  return publicProduct;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

const express = require("express");
const Order = require("../models/orderModel");
const auth = require("../auth/auth");
const adminAuth = require("../auth/adminAuth");
const orderRouter = express.Router();

orderRouter.get("/", auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name");
    res.send(orders);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.get("/mine", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.post("/", auth, async (req, res) => {
  if (req.body.orderItems.length === 0) {
    return res.status(400).send({ message: "Cart is empty" });
  }
  try {
    const order = new Order({
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    const createdOrder = await order.save();
    res.status(201).send({ message: "New Order Created", order: createdOrder });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order Not Found" });
    }
    res.send(order);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.put("/:id/pay", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order Not Found" });
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    const updatedOrder = await order.save();
    res.send({ message: "Order Paid", order: updatedOrder });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id });
    if (!order) {
      return res.status(404).send({ message: "Order Not Found" });
    }
    res.send({ message: "Order Deleted", deletedOrder: order });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

orderRouter.put("/:id/deliver", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ message: "Order Not Found" });
    }
    order.isDelivered = true;
    order.delivereAt = Date.now();
    const updatedOrder = await order.save();
    res.send({ message: "Order Delivered", order: updatedOrder });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = orderRouter;

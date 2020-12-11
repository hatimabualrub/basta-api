const adminAuth = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Inavalid Admin Token" });
  }
};

module.exports = adminAuth;

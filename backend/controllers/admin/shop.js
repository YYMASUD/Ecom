var { Shop } = require("../../models/shop");

// Shop Management ===================================================
async function listShop(req, res, next) {
  res.json(await Shop.find({}).populate("user", "username"));
}

async function showShop(req, res, next) {
  res.json(await Shop.findById(req.query.shopID));
}

async function deleteShop(req, res, next) {
  res.json(await Shop.findByIdAndDelete(req.query.id));
}

module.exports = {
  listShop,
  showShop,
  deleteShop,
};

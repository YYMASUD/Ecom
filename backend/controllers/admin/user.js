var { User, Role } = require("../../models/user");

// Role Management ==========================================================
async function listRole(req, res, next) {
  res.json(await Role.find({}));
}

async function createRole(req, res, next) {
  const newRole = new Role(req.body);
  await newRole.save();
  res.send(newRole);
}

async function updateRole(req, res, next) {
  res.json(await Role.findByIdAndUpdate(req.query.id, req.body, { new: true }));
}

async function showRole(req, res, next) {
  res.json(await Role.findById(req.query.id).populate("users"));
}

async function deleteRole(req, res, next) {
  res.json(await Role.findByIdAndDelete(req.query.id));
}

// User Management ==========================================================
async function listUser(req, res, next) {
  res.json(await User.find({}).populate("shop").populate("role", "name"));
}

async function updateUser(req, res, next) {
  // Admin can only change user's role

  // Remove the user from the old role
  const oldUser = await User.findById(req.query.id);
  await Role.findByIdAndUpdate(
    oldUser.role,
    { $pull: { users: oldUser._id } },
    { new: true },
  );

  const newRole = await Role.findOne({ name: req.body.role });
  if (!newRole) {
    return res
      .status(400)
      .json({ message: `Role '${req.body.role}' not found` });
  }

  // Update the user model
  const updatedUser = await User.findByIdAndUpdate(
    req.query.id,
    { role: newRole._id },
    { new: true },
  );

  // Add the user to the new role
  await Role.findOneAndUpdate(
    { name: req.body.role },
    { $push: { users: updatedUser._id } },
    { new: true },
  );

  res.json(updatedUser);
}

async function showUser(req, res, next) {
  res.json(
    await User.findById(req.query.userID)
      .populate("shop")
      .populate("role", "name"),
  );
}

async function deleteUser(req, res, next) {
  res.json(await User.findByIdAndDelete(req.query.userID));
}

module.exports = {
  listRole,
  createRole,
  updateRole,
  showRole,
  deleteRole,
  listUser,
  updateUser,
  showUser,
  deleteUser,
};

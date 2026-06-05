var { User, Role } = require("../models/user");
var { hashPass, authUser } = require("../auth");
const jwt = require("jsonwebtoken");

// User Registration
async function userRegister(req, res, next) {
  // Check if the user exist
  if ((await User.findOne({ email: req.body.email })) !== null) {
    return res.send("There is an existing account associated with this email.");
  }

  // Hash password
  const hashedPass = await hashPass(req.body.password);

  // Assign "user" role to the new user
  const userRole = await Role.findOne({ name: "user" });
  if (!userRole) {
    return res
      .status(500)
      .json({
        message: "Default 'user' role not found. Please seed roles first.",
      });
  }

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPass,
    role: userRole._id,
    name: "",
    avatar: "",
    phone: "",
    address: {
      country: "",
      province: "",
      city: "",
      postCode: "",
      street: "",
    },
  });

  await newUser.save();

  // Add the user to the "user" role
  await Role.findOneAndUpdate(
    { name: "user" },
    { $push: { users: newUser._id } },
    { new: true },
  );

  res.json(newUser);
}

// User Login
async function userLogin(req, res, next) {
  const user = await User.findOne({ email: req.body.email }).populate("role");
  if (!user) {
    return res.status(401).send("Username or password not correct.");
  }

  const match = await authUser(req.body.password, user.password);
  if (match === true) {
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role ? user.role.name : "user",
      },
      process.env.JWT_SECRET || "your-secret-key",
    );
    res.json(token);
  } else {
    res.status(401).send("Username or password not correct.");
  }
}

// Change user password
async function changePass(req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("User not found.");
  }

  const match = await authUser(req.body.oldPassword, user.password);
  if (match === true) {
    const hashedNewPass = await hashPass(req.body.newPassword);
    const updatedUser = await User.findOneAndUpdate(
      { email: req.body.email },
      { password: hashedNewPass },
      { new: true },
    );
    res.json(updatedUser);
  } else {
    res.status(401).send("Wrong password!");
  }
}

// Show user profile
async function showUser(req, res, next) {
  res.json(await User.findById(req.query.userID).select("-password -role"));
}

// Update user profile
async function updateUser(req, res, next) {
  try {
    // If there is a new avatar
    if (req.file) {
      const path = /(\/uploads)(.+)/g.exec(req.file.path)[0];
      await User.findByIdAndUpdate(
        req.query.userID,
        { avatar: path },
        { new: true },
      );
    }

    await User.findByIdAndUpdate(
      req.query.userID,
      {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        address: {
          country: req.body.country,
          province: req.body.province,
          city: req.body.city,
          postCode: req.body.postCode,
          street: req.body.street,
        },
      },
      { new: true },
    );

    res.send("User Updated!");
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error updating user" });
  }
}

module.exports = {
  userRegister,
  userLogin,
  changePass,
  showUser,
  updateUser,
};

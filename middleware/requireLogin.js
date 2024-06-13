const User = require("../models/User_signup");

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    req.session.user = user; // Add user data to session
  next();
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

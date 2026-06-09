const adminAuth = (req, res, next) => {
  // Authentication logic goes here
  next();
};

module.exports = { adminAuth };

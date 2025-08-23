const mongoose = require("mongoose");

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = isObjectIdValid;

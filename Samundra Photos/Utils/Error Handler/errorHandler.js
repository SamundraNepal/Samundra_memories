const handleError = function (res, statusCode, errorType, message) {
  return res.status(statusCode).json({ status: errorType, message });
};

module.exports = handleError;

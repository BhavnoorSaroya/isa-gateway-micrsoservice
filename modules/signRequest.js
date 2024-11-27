// middlewares/signRequest.js
const crypto = require('crypto');

module.exports = (privateKey) => {
  return (req, res, next) => {
    const payload = req.method + req.url;
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    req.headers['x-gateway-signature'] = signature;
    next();
  };
};

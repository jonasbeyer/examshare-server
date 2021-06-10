const moment = require("moment"),
  response = require("../utils/response"),
  urlencoded = "application/x-www-form-urlencoded",
  multipart = "multipart/form-data";

module.exports = (req, res, next) => {
  res.header("Content-Type", "application/json");

  // if (!isContentType(req, multipartURLs))
  //     return res.json(response.BAD_REQUEST);

  if (!isAppKeyValid(req)) return res.json({ response: response.BAD_VERSION });

  const timestamp = moment().format("DD.MM.YYYY HH:mm:ss");
  console.info(
    `[${timestamp}] [client ${req.headers["x-real-ip"]}] ${req.method} ${req.originalUrl}`,
  );

  next();
};

function isContentType(req, multipartURLs) {
  const contentType =
    multipartURLs.indexOf(req.originalUrl) !== -1 ? multipart : urlencoded;
  return req.method === "GET" || req.is(contentType);
}

function isAppKeyValid(req) {
  return req.get("app-key") === __config.appKey;
}

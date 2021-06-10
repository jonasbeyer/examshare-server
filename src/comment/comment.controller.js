const express = require("express");
const authentication = require("../shared/middleware/auth.middleware");
const validation = require("../shared/middleware/validation.middleware");
const rules = require("./comment.rules");

const commentService = require("./comment.service");
const response = require("../shared/utils/response");

const router = express.Router();

router.get("/", authentication(), validation(rules.get), (req, res) => {
  commentService
    .getCommments(req.userId, req.query)
    .then((comments) => res.json(comments))
    .catch((error) => res.json(error));
});

router.post("/", authentication(), validation(rules.add), (req, res) => {
  commentService
    .addComment(req.body, req.userId)
    .then((data) => res.json(data))
    .catch((error) => res.json(error));
});

router.put(
  "/:commentId/like_status",
  authentication(),
  validation(rules.updateLikeStatus),
  (req, res) => {
    commentService
      .setLikeStatus(req.params.commentId, req.body.likeStatus, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.put(
  "/:commentId",
  authentication(),
  validation(rules.update),
  (req, res) => {
    commentService
      .updateComment(req.body.commentId, req.body, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.delete(
  "/:commentId",
  authentication(),
  validation(rules.deleteComment),
  (req, res) => {
    commentService
      .deleteComment(req.params.commentId, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((response) => res.json(response));
  },
);

module.exports = router;

const express = require("express");
const router = express.Router();

const authentication = require("../shared/middleware/auth.middleware");
const validation = require("../shared/middleware/validation.middleware");
const { validationResult } = require("express-validator");
const rules = require("./tasks.rules");
const imageUtil = require("../shared/utils/image.util");
const response = require("../shared/utils/response");

const taskService = require("./task.service");

router.get("/", authentication(), validation(rules.getMany), (req, res) => {
  const query = taskService.buildListQuery(req.query);
  taskService
    .findUserTasks(
      query,
      req.userId,
      req.query.limit || __config.values.pageCount,
    )
    .then((tasks) => res.json(tasks));
});

router.get(
  "/search",
  authentication(),
  validation(rules.search),
  (req, res) => {
    const query = taskService.buildSearchQuery(req.query);
    const order = req.query.tasksOrder === "1" ? "-Rating" : undefined;

    taskService
      .findUserTasks(query, req.userId, undefined, true, order)
      .then((data) => res.json(data));
  },
);

router.get(
  "/:taskId",
  authentication(),
  validation(rules.getOne),
  (req, res) => {
    taskService
      .findUserTaskById(req.params.taskId, req.userId)
      .then((task) => res.json(task))
      .catch((error) => res.json(error));
  },
);

router.get(
  "/:taskId/images/:imageType/:imageId",
  authentication(),
  validation(rules.getImage),
  (req, res) => {
    taskService
      .getImageBuffer(
        req.params.taskId,
        req.params.imageType,
        req.params.imageId,
      )
      .then((buffer) => res.type("image/webp").send(buffer))
      .catch((error) => res.json(error));
  },
);

router.post(
  "/:taskId/rating",
  authentication(),
  validation(rules.rating),
  (req, res) => {
    taskService
      .rateTask(req.params.taskId, req.userId, req.body.rating)
      .then((rating) => res.json({ rating }))
      .catch((error) => res.json(error));
  },
);

router.put(
  "/:taskId/favorite",
  authentication(),
  validation(rules.favorite),
  (req, res) => {
    taskService
      .setFavorite(req.userId, { ...req.params, ...req.body })
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.put(
  "/:taskId",
  authentication(),
  validation(rules.createOrUpdate),
  (req, res) => {
    taskService
      .updateTask(req.params.taskId, req.body, req.userId)
      .then(() => res.json(response.SUCCESS))
      .catch((error) => res.json(error));
  },
);

router.delete(
  "/:taskId",
  authentication(),
  validation(rules.deleteOne),
  (req, res) => {
    taskService
      .deleteTask(req.params.taskId, req.userId)
      .then(() => res.json(response.DELETED_TASK))
      .catch((error) => console.log(error));
  },
);

const upload = imageUtil.getUploadMiddleware("tasks");
const fileUpload = upload.fields([
  { name: "taskImages", maxCount: 4 },
  { name: "solutionImages", maxCount: 6 },
]);
router.post(
  "/",
  authentication(),
  fileUpload,
  rules.createOrUpdate,
  (req, res) => {
    if (!validationResult(req).isEmpty() || !req.files.taskImages) {
      imageUtil.deleteRequestFiles(req.files);
      return res.json(response.BAD_REQUEST);
    }

    taskService
      .createTask(req.userId, req.body, req.files)
      .then((data) => res.json(data))
      .catch((error) => {
        res.json(error);
        imageUtil.deleteRequestFiles(req.files);
      });
  },
);

module.exports = router;

const Task = require("./task.model");
const QueryObject = require("../shared/utils/queryObject");
const response = require("../shared/utils/response");

const moment = require("moment");
const imageUtil = require("../shared/utils/image.util");

const subjectService = require("../subject/subject.service");
const firebaseService = require("../shared/firebase/firebase.service");

async function createTask(userId, createTaskDto, files) {
  const images = await imageUtil.storeImageFileArrays(files);
  if (images.taskImages.length === 0) {
    throw response.BAD_REQUEST;
  }

  const data = await new Task({
    ...createTaskDto,
    author: userId,
    subject: createTaskDto.subjectId,
    taskImages: images.taskImages,
    solutionImages: images.solutionImages,
  })
    .save()
    .then((task) => populateTaskFields(task));

  await firebaseService.sendTaskNotification(data);
  return data;
}

async function populateTaskFields(task) {
  const data = task.toObject();
  data.subject = await subjectService.getSubjectNameById(task.subject);
  data.subjectId = task.subject;

  data.author = await userService.getUsernameById(task.author);
  data.authorId = task.author;

  data.taskImagesCount = task.taskImages.length;
  data.solutionImagesCount = task.solutionImages.length;

  return data;
}

async function updateTask(taskId, updateTaskDto, userId) {
  const task = await findTaskById(taskId, { author: 1 });
  if (!canUserModifyTask(userId, task)) {
    throw response.UNAUTHORIZED;
  }

  return Task.updateOne({ _id: taskId }, updateTaskDto);
}

async function existsTask(taskId) {
  const count = await Task.countDocuments({ _id: taskId });
  return count > 0;
}

async function findUserTaskById(taskId, userId) {
  const result = await findUserTasks({ _id: taskId }, userId);
  if (result.length === 0) {
    throw response.NOT_FOUND;
  }

  return result[0];
}

async function findTaskById(taskId, projection) {
  const task = await Task.findById(taskId, projection);
  if (task == null) {
    throw response.NOT_FOUND;
  }

  return task;
}

async function deleteTask(taskId, userId) {
  const task = await findTaskById(taskId);
  if (!canUserModifyTask(userId, task)) {
    throw response.UNAUTHORIZED;
  }

  await Promise.all([
    task.deleteOne(),
    imageUtil.deleteImageIds(task.taskImages, task.solutionImages),
  ]);
}

async function findUserTasks(query, userId, limit, collation, sort) {
  const user = await userService.findUserById(userId, { favorites: 1 });
  const aggregation = Task.aggregate()
    .match(query)
    .lookup({
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author",
    })
    .unwind("$author")
    .lookup({
      from: "subjects",
      localField: "subject",
      foreignField: "_id",
      as: "subject",
    })
    .unwind("$subject")
    .addFields({
      id: "$_id",
      subject: "$subject.name",
      subjectId: "$subject._id",
      author: "$author.username",
      authorId: "$author._id",
      rating: {
        $cond: [
          { $eq: ["$rating", 0] },
          0,
          { $divide: ["$rating", { $size: "$ratedBy" }] },
        ],
      },
      isRated: { $in: [user._id, "$ratedBy"] },
      isFavorite: { $in: ["$_id", user.favorites] },
      ratingCount: { $size: "$ratedBy" },
      taskImagesCount: { $size: "$taskImages" },
      solutionImagesCount: { $size: "$solutionImages" },
    })
    .project({ _id: 0 })
    .sort(sort || "-id");

  if (limit) aggregation.limit(limit);
  if (collation) aggregation.collation({ locale: "de", strength: 2 });

  return aggregation;
}

async function getFilteredUserTask(query, user) {
  const conditions = { _id: { $exists: true } };
  const filterId = query.filter;
  const myProfile = !query.userId;
  const userId = myProfile ? user._id : query.userId;

  if (filterId === 5) {
    conditions._id = {
      $in: myProfile
        ? user.favorites
        : await userService.getUsersFavorites(userId),
    };
  }

  if (filterId !== 5) conditions.author = userId;
  if (filterId !== 5 && filterId !== 0) {
    conditions.createdAt = getDateQuery(filterId);
  }

  if (query.search) conditions.title = { $regex: query.search, $options: "i" };
  if (query.cursor) conditions._id.$lt = query.cursor;

  return findUserTasks(conditions, user._id, __config.values.pageCount);
}

function buildListQuery(query) {
  return new QueryObject({
    _id: query.cursor ? { $lt: query.cursor } : undefined,
    subject: query.subjectId,
  });
}

function buildSearchQuery(query) {
  const searchQuery = { $regex: query.search, $options: "i" };
  return new QueryObject({
    subject: query.subjectId,
    subjectId: undefined,
    $or: [{ title: searchQuery }, { keywords: searchQuery }],
    search: undefined,
    grade: getGradeRange(query.gradeRangeId),
    createdAt: getDateQuery(query.dateFilterId),
  });
}

function getGradeRange(gradeRangeId) {
  const range = (min, max) => ({ $gte: min, $lte: max });
  switch (gradeRangeId) {
    case 0:
      return range(1, 6);
    case 1:
      return range(7, 10);
    case 2:
      return range(11, 13);
    default:
      return undefined;
  }
}

async function getImageBuffer(taskId, imageType, imageId) {
  const project = {};
  project["_id"] = 0;
  project[imageType] = { $slice: ["$" + imageType, imageId, 1] };

  const result = await Task.aggregate([
    { $match: { _id: taskId } },
    { $project: project },
  ]);

  if (result[0] && result[0][imageType]) {
    const imageId = result[0][imageType][0];
    return imageUtil.getImageBuffer(imageId, "tasks");
  } else {
    throw response.NOT_FOUND;
  }
}

async function getRatingAverage(userId) {
  let rating = 0;
  let count = 0;
  const tasks = await getUsersTasks(userId, { rating: 1, ratedBy: 1 });

  tasks.forEach((task) => {
    if (task.rating.valueOf() === 0) return;
    count++;
    rating += task.Rating.valueOf() / task.ratedBy.length;
  });

  return count === 0 ? 0 : rating / count;
}

function getUsersTasks(userId, projection) {
  return Task.find({ author: userId }, projection);
}

function getTasksCount(userId) {
  return Task.countDocuments({ author: userId });
}

async function getTaskAuthor(taskId) {
  const task = await Task.findById(taskId, { author: 1 });
  return task ? task.author : undefined;
}

async function rateTask(taskId, userId, rating) {
  const task = await findTaskById(taskId, { ratedBy: 1, rating: 1, author: 1 });
  if (task.ratedBy.indexOf(userId) !== -1 || task.author === userId) {
    throw response.ALREADY_RATED;
  }

  task.ratedBy.push(userId);
  task.rating = task.rating.valueOf() + rating;

  await task.save();
  return task.rating / task.ratedBy.length;
}

async function setFavorite(userId, setFavoriteDto) {
  const { isFavorite, taskId } = setFavoriteDto;
  const query = isFavorite
    ? { $addToSet: { favorites: taskId } }
    : { $pull: { favorites: taskId } };

  const count = await Task.countDocuments({ _id: taskId });
  if (count !== 1) {
    throw response.NOT_FOUND;
  }

  await userService.updateUser(userId, query);
}

function getDateQuery(code) {
  const units = ["day", "isoWeek", "month", "year"];
  const selection = units[code - 1];
  return selection
    ? {
        $gte: moment().startOf(selection).valueOf(),
        $lt: moment().endOf(selection).valueOf(),
      }
    : undefined;
}

async function canUserModifyTask(userId, task) {
  return (
    task.author === userId || (await userService.isModerationAllowed(userId))
  );
}

module.exports = {
  createTask: createTask,
  existsTask: existsTask,
  findUserTasks: findUserTasks,
  findUserTaskById: findUserTaskById,
  setFavorite: setFavorite,
  rateTask: rateTask,
  updateTask: updateTask,
  deleteTask: deleteTask,
  getFilteredUserTask: getFilteredUserTask,
  buildListQuery: buildListQuery,
  buildSearchQuery: buildSearchQuery,
  getTasksCount: getTasksCount,
  getTaskAuthor: getTaskAuthor,
  getUsersTasks: getUsersTasks,
  getImageBuffer: getImageBuffer,
  getRatingAverage: getRatingAverage,
};

// Fix circular dependency
const userService = require("../user/user.service");

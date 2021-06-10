const Comment = require("./comment.model");
const response = require("../shared/utils/response");
const utilities = require("../shared/utils/utilities");

const userService = require("../user/user.service");
const taskService = require("../task/task.service");
const firebaseService = require("../shared/firebase/firebase.service");

async function addComment(createCommentDto, author) {
  const existsTask = await taskService.existsTask(createCommentDto.taskId);
  if (!existsTask) {
    throw response.NOT_FOUND;
  }

  const threadId = createCommentDto.threadId;
  const existsThread = threadId ? await existsComment(threadId) : true;
  if (!existsThread) {
    throw new response.Response(404, { comment: false });
  }

  const data = new Comment({ author, ...createCommentDto })
    .save()
    .then((comment) => populateCommentFields(comment));

  await notifyOnNewComment(createCommentDto.taskId, data);
  return data;
}

async function populateCommentFields(comment) {
  const data = comment.toObject();
  data.author = await userService.getUsernameById(comment.author);
  data.authorId = comment.author;

  return data;
}

async function getComments(userId, query) {
  const taskId = query.taskId;
  const conditions = {
    taskId: taskId,
    threadId: query.threadId || { $exists: false },
  };

  return Comment.aggregate()
    .match(conditions)
    .lookup({
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author",
    })
    .unwind("$author")
    .lookup({
      from: "comments",
      localField: "_id",
      foreignField: "threadId",
      as: "childComments",
    })
    .addFields({
      id: "$_id",
      author: "$author.username",
      authorId: "$author._id",
      liked: { $in: [userId, "$likedBy"] },
      disliked: { $in: [userId, "$dislikedBy"] },
      likeCount: { $size: "$likedBy" },
      dislikeCount: { $size: "$dislikedBy" },
      commentCount: { $size: "$childComments" },
    })
    .project({ _id: 0, likedBy: 0, dislikedBy: 0, childComments: 0 });
}

async function existsComment(commentId) {
  const count = await Comment.countDocuments({ _id: commentId });
  return count > 0;
}

async function isUsersComment(userId, commentId) {
  const comment = await Comment.findOne(commentId, { author: 1 });
  return !comment ? true : comment.author === userId;
}

async function setLikeStatus(commentId, status, userId) {
  let query;
  switch (status) {
    case 1:
      query = { $addToSet: { likedBy: userId }, $pull: { dislikedBy: userId } };
      break;
    case -1:
      query = { $addToSet: { dislikedBy: userId }, $pull: { likedBy: userId } };
      break;
    case 0:
      query = { $pull: { likedBy: userId, dislikedBy: userId } };
  }

  await Comment.updateOne({ _id: commentId }, query);
}

function notifyOnNewComment(taskId, comment) {
  let user;
  return (comment.threadId
    ? getCommentAuthor(comment.threadId)
    : taskService.getTaskAuthor(taskId)
  )
    .then((userId) => userService.findUserById(userId))
    .then((_user) => {
      user = _user;
      return utilities.isPropertyEnabled(user, "notifications", true)
        ? taskService.findUserTaskById(taskId, user)
        : Promise.reject();
    })
    .then((task) => {
      firebaseService.sendCommentNotification(user._id, task, comment);
      return comment._id;
    })
    .catch(() => Promise.resolve(comment._id));
}

async function updateComment(commentId, dto, userId) {
  const permitted = await canUserModifyComment(dto.commentId, userId);
  if (!permitted) {
    throw response.UNAUTHORIZED;
  }

  const updateResult = await Comment.updateOne(commentId, { $set: dto });
  if (updateResult.n === 0) {
    throw new response.Response(404, { comment: false });
  }
}

async function deleteComment(commentId, userId) {
  const permitted = await canUserModifyComment(commentId, userId);
  if (!permitted) {
    throw response.UNAUTHORIZED;
  }

  const condtions = { $or: [{ _id: commentId }, { threadId: commentId }] };
  const deletionResult = await Comment.deleteMany(condtions);

  if (deletionResult.n === 0) {
    throw new response.Response(404, { comment: false });
  }
}

function deleteCommentsByTaskId(taskId) {
  return Comment.deleteMany({ taskId: taskId });
}

function canUserModifyComment(commentId, userId) {
  return userService
    .isModerationAllowed(userId)
    .catch(async () =>
      (await isUsersComment(userId, commentId))
        ? Promise.resolve()
        : Promise.reject(response.UNAUTHORIZED),
    );
}

async function getCommentAuthor(commentId) {
  const comment = await Comment.findOne(commentId, { author: 1 });
  return comment.author;
}

module.exports = {
  addComment: addComment,
  existsComment: existsComment,
  getCommments: getComments,
  setLikeStatus: setLikeStatus,
  updateComment: updateComment,
  deleteComment: deleteComment,
  deleteCommentsByTaskId: deleteCommentsByTaskId,
};

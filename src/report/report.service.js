const Report = require("./report.model");
const taskService = require("../task/task.service");
const userService = require("../user/user.service");
const commentService = require("../comment/comment.service");

const response = require("../shared/utils/response");

async function addReport(createReportDto, authorId) {
  const itemAvailable = await (createReportDto.itemType === "task"
    ? taskService.existsTask(createReportDto.itemId)
    : commentService.existsComment(createReportDto.itemId));

  if (!itemAvailable) {
    throw response.NOT_FOUND;
  }

  const report = new Report({ authorId, ...createReportDto });
  return report.save();
}

async function deleteReport(reportId, userId) {
  const moderationAllowed = await userService.isModerationAllowed(userId);
  if (!moderationAllowed) {
    throw response.UNAUTHORIZED;
  }

  await Report.deleteOne({ _id: reportId });
}

function deleteReportsByUserId(userId) {
  return Report.deleteMany({ author: userId });
}

function loadReports(user, lastId, limit) {
  return Report.aggregate()
    .match({ _id: lastId ? { $lt: lastId } : { $ne: 0 } })
    .lookup({
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "task",
    })
    .unwind("$task")
    .lookup({
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author",
    })
    .unwind("$author")
    .lookup({
      from: "users",
      localField: "task.author",
      foreignField: "_id",
      as: "task.author",
    })
    .unwind("$task.author")
    .project({ taskId: 0 })
    .addFields({
      author: "$author.username",
      "task.author": "$task.author.username",
      "task.authorId": "$task.author._id",
      "task.rating": {
        $cond: [
          { $eq: ["$task.rating", 0] },
          0,
          { $divide: ["$task.rating", { $size: "$task.ratedBy" }] },
        ],
      },
      "task.ratingCount": { $size: "$task.ratedBy" },
      "task.isRated": { $in: [user._id, "$task.ratedBy"] },
      "task.isFavorite": { $in: ["$task._id", user.favorites] },
      "task.taskImagesCount": { $size: "$task.taskImages" },
      "task.solutionImagesCount": { $size: "$task.solutionImages" },
    })
    .sort("-_id")
    .limit(limit);
}

module.exports = {
  addReport: addReport,
  deleteReport: deleteReport,
  deleteReportsByUserId: deleteReportsByUserId,
  loadReports: loadReports,
};

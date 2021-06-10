const userService    = require("../../user/user.service"),
      sessionService = require("../../auth/auth.service"),
      tokenService   = require("../token/token.service"),
      taskService    = require("../../task/task.service"),
      reportService  = require("../../report/report.service"),
      commentService = require("../../comment/comment.service"),
      utilities      = require("./utilities"),
      day            = 24 * 60 * 60 * 1000,
      repetiton      = 30 * 60 * 1000;

function getQuery() {
    const now = Date.now();
    const deactivatedQuery = {Status: 3, Deactivated: {$lte: now - 7 * day}};
    const unverifiedQuery = {Status: 0, Registered: {$lte: now - 3 * day}};
    return {$or: [deactivatedQuery, unverifiedQuery]};
}

module.exports = setInterval(async () => {
    const tasks = [];
    const docs = await userService.findUsers(getQuery(), {_id: 1});
    await Promise.all(docs.map(async (doc) => Promise.all([
        doc.remove(),
        reportService.deleteReportsByUserId(doc._id),
        sessionService.deleteSessions(doc._id),
        tokenService.removeTokenByUserId(doc._id),
        tasks.push.apply(tasks, await taskService.getUsersTasks(doc._id, {TaskImages: 1, SolutionImages: 1}))
    ])));

    await Promise.all(tasks.map(async (task) => Promise.all([
        utilities.deleteImageIds(task.TaskImages, task.SolutionImages),
        commentService.deleteCommentsByTaskId(task._id),
        task.remove()
    ])));

    const count = docs.length;
    if (count !== 0) {
        console.info("Removed " + count + " user object" + (count === 1 ? "" : "s") + ".");
    }
}, repetiton);

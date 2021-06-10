const request = require("request");
const utilities = require("../utils/utilities");

const instanceURL = "https://iid.googleapis.com/iid/v1:";
const deleteURL = "https://iid.googleapis.com/v1/web/iid/";
const notificationURL = "https://fcm.googleapis.com/fcm/send";

function sendJSONRequst(uri, body, method) {
  request({
    uri: uri,
    method: method || "POST",
    headers: {
      Authorization: `key=${__config.firebaseSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function sendNotification(topic, data) {
  sendJSONRequst(notificationURL, {
    to: "/topics/" + topic,
    data: data,
    android: {
      ttl: "43200s", //12 hours
    },
  });
}

function sendTaskNotification(task) {
  sendNotification(task.subjectId, {
    body: `${task.subject} – „${task.title}“`,
    task: task,
  });
}

function sendCommentNotification(userId, task, comment) {
  sendNotification(userId, {
    task: task,
    comment: comment,
    body: utilities.truncate(comment.message, 200),
    profileImage:
      __config.baseUrl("https") +
      __config.apiUrl(`users/${comment.authorId}/profileImage`),
  });
}

function sendCustomNotification(title, message, userId) {
  sendNotification(userId || "ExamShare", { title: title, body: message });
}

function changeSubscription(tokens, topic, add) {
  sendJSONRequst(instanceURL + (add ? "batchAdd" : "batchRemove"), {
    to: `/topics/${topic}`,
    registration_tokens: tokens,
  });
}

function deleteFcmToken(token) {
  if (token) sendJSONRequst(deleteURL + token, {}, "DELETE");
}

module.exports = {
  sendTaskNotification: sendTaskNotification,
  sendCommentNotification: sendCommentNotification,
  sendCustomNotification: sendCustomNotification,
  changeSubscription: changeSubscription,
  deleteFcmToken: deleteFcmToken,
};

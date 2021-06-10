const { query, body, param } = require("express-validator");
const mongoose = require("mongoose");

const getOne = [
  param("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

const getMany = [
  query("subjectId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  query("limit").isInt().optional().toInt(),
  query("cursor").isMongoId().optional(),
];

const getImage = [
  param("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  param("imageType").isIn(["taskImages", "solutionImages"]),
  param("imageId").isInt().toInt(),
];

const search = [
  query("subjectId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  query("search").isString().trim(),
  query("gradeRangeId").isInt().optional().toInt(),
  query("dateFilterId").isInt().optional().toInt(),
];

const rating = [body("rating").isInt({ min: 1, max: 5 }).toInt()];

const favorite = [
  param("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("isFavorite").isBoolean().toBoolean(),
];

const createOrUpdate = [
  body("title").isString().trim().isLength({ min: 1, max: 45 }),
  body("subjectId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
  body("keywords").isArray({ min: 1, max: 4 }),
  body("keywords.*").isString().trim().isLength({ min: 1, max: 30 }),
  body("grade").isInt({ min: 1, max: 13 }),
  body("creator").isString().trim().isLength({ min: 1, max: 45 }).optional(),
  body("schoolForm").isString().trim().isLength({ min: 1, max: 20 }),
  body("federalState").isString().trim().isLength({ min: 1, max: 25 }),
];

const deleteOne = [
  param("taskId")
    .isMongoId()
    .customSanitizer((value) => mongoose.Types.ObjectId(value)),
];

module.exports = {
  getOne: getOne,
  getMany: getMany,
  getImage: getImage,
  search: search,
  rating: rating,
  favorite: favorite,
  createOrUpdate: createOrUpdate,
  deleteOne: deleteOne,
};

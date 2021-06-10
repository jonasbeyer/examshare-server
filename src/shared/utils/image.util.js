const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const IMAGE_EXTENSION = ".webp";
const IMAGE_PATH = `${__basePath}/uploads`;

function getTaskImagePath(fileName) {
  return `${IMAGE_PATH}/tasks/${fileName}${IMAGE_EXTENSION}`;
}

function getProfileImagePath(fileName) {
  return `${IMAGE_PATH}/profiles/${fileName}${IMAGE_EXTENSION}`;
}

async function storeImageFileArrays(fileArrays) {
  const images = { taskImages: [], solutionImages: [] };
  await Promise.all(
    Object.keys(fileArrays).map((key) =>
      Promise.all(
        fileArrays[key].map(async (file) => {
          images[key].push(file.filename);

          try {
            await storeImage(file.path);
          } catch {
            const index = images[key].indexOf(file.filename);
            images[key].splice(index, 1);
          }
        }),
      ),
    ),
  );

  return images;
}

function storeImage(path) {
  return sharp(path)
    .resize(1600, 1600, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .rotate()
    .webp({ quality: 87 })
    .toFile(path + IMAGE_EXTENSION)
    .then(() => fs.unlinkSync(path));
}

function getImageBuffer(fileName, directory) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${IMAGE_PATH}/${directory}/${fileName}${IMAGE_EXTENSION}`,
      (err, data) => {
        data ? resolve(data) : reject();
      },
    );
  });
}

function getProfileImageBuffer(imageId) {
  return new Promise((resolve, reject) =>
    fs.readFile(getProfileImagePath(imageId), (err, data) =>
      data ? resolve(data) : reject(),
    ),
  );
}

function deleteImage(path) {
  if (path && fs.existsSync(path)) fs.unlinkSync(path);
}

function deleteImageAsync(path) {
  return new Promise((resolve) => fs.unlink(path, (err) => resolve(!!err)));
}

function deleteProfileImage(imageId) {
  return deleteImageAsync(getProfileImagePath(imageId));
}

function deleteImageIds(...imageIdArrays) {
  return Promise.all(
    imageIdArrays.map((idArray) => {
      return idArray
        ? Promise.all(
            idArray.map((id) => deleteImageAsync(getTaskImagePath(id))),
          )
        : Promise.resolve();
    }),
  );
}

function deleteRequestFiles(files) {
  Object.keys(files).map((key) => {
    files[key].forEach((file) => deleteImage(file.path));
  });
}

function isFileTypeSupported(ext) {
  return ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp";
}

function getUploadMiddleware(localPath) {
  return multer({
    dest: `${IMAGE_PATH}/${localPath}`,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, callback) => {
      const ext = path.extname(file.originalname);
      return callback(null, isFileTypeSupported(ext));
    },
  });
}

module.exports = {
  getImageBuffer: getImageBuffer,
  getProfileImageBuffer: getProfileImageBuffer,
  deleteImageIds: deleteImageIds,
  deleteRequestFiles: deleteRequestFiles,
  deleteProfileImage: deleteProfileImage,
  storeImage: storeImage,
  storeImageFileArrays: storeImageFileArrays,
  getUploadMiddleware: getUploadMiddleware,
};

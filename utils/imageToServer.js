const { default: axios } = require("axios");
const FormData = require('form-data');
const { STORAGE_API_URL, STORAGE_API_TOKEN } = process.env;

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
async function imageToServer(req, res, next) {
    try {
        const files = [];
        req.file && files.push(req.file);

        if (Array.isArray(req.files) && req.files.length > 0) {
            files.push(...req.files);
        }
        else if (typeof req.files == "object" && Object.keys(req.files).length) {
            Object.keys(req.files).forEach(key => {
                const obj = req.files[key];

                // check this
                if (Array.isArray(obj) && obj.length > 0) {
                    files.push(...obj);
                } else {
                    files.push(obj);
                }
            });
        }

        const formData = new FormData();
        files.forEach(file => {
            const filename = Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop();

            formData.append('file', file.buffer, {
                filename: filename,
                contentType: file.mimetype
            });

            file.filename = filename;
        });

        if (files.length) {
            const response = await axios.post(`${STORAGE_API_URL}/api/v2/storage`, formData, {
                headers: {
                    Authorization: `Bearer ${STORAGE_API_TOKEN}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            /** @type {Express.Multer.File[]} */
            const savedFiles = response.data.data;
            if (savedFiles.length != files.length) {
                throw new Error("Storage Error");
            }

            files.forEach((file, index) => {
                const { filename, path } = savedFiles[index];

                file.filename = filename;
                file.path = path;
            });
        }

        next();
    } catch (error) {
        console.log(`error.response`, error.response?.data);
        next(error);
    }
};

module.exports = imageToServer;
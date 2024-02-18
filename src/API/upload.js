var express = require("express");
var app = express.Router();
var multer = require("multer");
var path = require("path");
var fs = require("fs");
var dicomParser = require("dicom-parser");
const cors = require('cors');
const jpeg = require('jpeg-js');


// 建立 multer 
const upload = multer({ dest: "uploads/" });

// 使用CORS中介來允許跨域請求
app.use(cors());

let fileCount = 0;

// 處理檔案上傳
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("未上傳檔案");
    }

    // 將上傳的檔案存成 .dcm 
    const oldPath = path.join(__dirname, req.file.path);

    // 修改上傳的檔案名稱
    const newFileName = `${(fileCount + 1).toString().padStart(2, '0')}.dcm`;
    const newPath = path.join(__dirname, "uploads", newFileName);
    // 檔名遞增+1
    fileCount++;

    fs.rename(oldPath, newPath, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        await convertDicomToJpeg(newPath, fileCount);

        try {
            // 使用 dicom-parser 解析 DICOM 檔案
            const dicomFileData = fs.readFileSync(newPath);
            const dataSet = dicomParser.parseDicom(dicomFileData);

            // 獲得病患資訊
            const patientName = dataSet.string("x00100010");
            const patientBirthdate = dataSet.string("x00100030");
            const patientAge = dataSet.string("x00101010");
            const patientSex = dataSet.string("x00100040");
            const bodyPart = dataSet.string("x00180015");

            console.log("我想知道", dataSet);
            console.log("患者姓名:", patientName);
            console.log("生日:", patientBirthdate);
            console.log("年齡:", patientAge);
            console.log("性別:", patientSex);
            console.log("檢查部位：", bodyPart);

            // 回傳病患資訊
            res.status(200).json({
                patientName,
                patientBirthdate,
                patientAge,
                patientSex,
                bodyPart,
                imageUrl: `/images/${newFileName.replace(".dcm", "")}.jpeg`
            });

            console.log("我我我", dataSet)

        } catch (err) {
            console.error("解析DICOM錯誤:", err);
            res.status(500).send("解析DICOM錯誤");
        }

        //將 DICOM 轉成 JPEG
        async function convertDicomToJpeg(filePath, fileCount) {
            try {
                // 使用 dicom-parser 解析 DICOM 檔案
                const dicomFileData = fs.readFileSync(filePath);
                const dataSet = dicomParser.parseDicom(dicomFileData);

                // 轉成 JPEG
                // 影像的總列數，列解析度
                const width = dataSet.uint16("x00280011");
                // 影像的總行數，行解析度
                const height = dataSet.uint16("x00280010");
                const pixelData = new Uint8Array(dicomFileData, dataSet.elements.x7fe00010.dataOffset);
                const rawImageData = {
                    data: pixelData,
                    width: width,
                    height: height,
                };

                // 100 是 JPEG 品質
                const jpegImageData = jpeg.encode(rawImageData, 100);

                // 將JPEG圖片保存到正確的目錄
                const newFileName = `${(fileCount).toString().padStart(2, '0')}.jpeg`;
                const imagePath = path.join(__dirname, "../../public/images/", newFileName);
                fs.writeFileSync(imagePath, jpegImageData.data);

            } catch (err) {
                console.error("解析DICOM錯誤:", err);
            }
        }
    });
});
app.use('/images', express.static(path.join(__dirname, '../../public/images')));

module.exports = app;
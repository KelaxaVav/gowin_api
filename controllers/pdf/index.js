const routeHandler = require("../../utils/routeHandler");
const pdf = require('pdf-parse');
const { STATUS_CODE } = require("../../utils/utility");
const { UnitedIndiaInsurance, CholamandalamGeneralInsurance, UNITED_PVT_CAR_0, UNITED_PVT_CAR_PACKAGE, SHRIRAM_TAXI_CAR_PACKAGE } = require("./extract");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EXTRACT_PROMPT } = require("./constants");
const PDFService = require("./service");

const genAI = new GoogleGenerativeAI('AIzaSyD8V9gB9BrtGC4itn0pcFOtISQcV7YwsN8');

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const extractData = routeHandler(async (req, res, extras) => {
    const { pdf_type } = req.query

    try {
        const dataBuffer = req.file.buffer;
        const pdfData = await pdf(dataBuffer);
        const pdfText = pdfData.text;

        let prompt = '';

        if (pdf_type === 'TW_BIKE_PACKAGE') {
            prompt = EXTRACT_PROMPT.TW_BIKE_PACKAGE;
        }
        if (pdf_type === 'TW_BIKE_BUNDLED') {
            prompt = EXTRACT_PROMPT.TW_BIKE_BUNDLED;
        }

        const image = {
            inlineData: {
                data: dataBuffer.toString("base64"),
                mimeType: 'application/pdf',
            },
        };

        const result = await model.generateContent([prompt, image]);
        const responseText = result.response.text();
        let stripped = responseText.trim();
        if (stripped.startsWith('"') && stripped.endsWith('"')) {
            stripped = stripped.slice(1, -1);
        }

        // Step 4: Unescape characters
        let unescaped = stripped.replace(/\\n/g, '\n').replace(/\\"/g, '"');

        // Optional: Log this to debug formatting
        console.log("Unescaped:", unescaped);

        // Step 5: Remove ```json\n and \n``` markdown-style markers
        let cleaned = unescaped
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '')
            .trim();

        const jsonObject = JSON.parse(cleaned);
        return res.sendRes(jsonObject, { message: 'PDF parsed successfully', status: STATUS_CODE.OK });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Error processing PDF" });
    }
}, false);

const extractPDF = routeHandler(async (req, res, extras) => {
    const { product_id } = req.body;

    const data = await PDFService.extractPDF({
        product_id,
        file: req.file,
    });

    return res.sendRes(data, { message: 'PDF extracted successfully', status: STATUS_CODE.OK });

}, false);

const getFormValues = async (text) => {
    // console.log(text);

    if (text.includes('UNITED INDIA INSURANCE COMPANY LIMITED')) {
        return UnitedIndiaInsurance(text);
    } else if (text.includes('United India Insurance Company') && text.includes('MOTOR INSURANCE ‐ PRIVATE CAR PACKAGE POLICY SCHEDULE')) {
        return UNITED_PVT_CAR_PACKAGE(text);
    } else if (text.includes('United India Insurance Company')) {
        return UNITED_PVT_CAR_0(text);
    } else if (text.includes('SHRIRAM GENERAL INSURANCE COMPANY LIMITED')) {
        return SHRIRAM_TAXI_CAR_PACKAGE(text);
    } else if (text.includes('CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD')) {
        return CholamandalamGeneralInsurance(text);
    } else {

    }
    return null
}


module.exports = {
    extractData,
    extractPDF,
};

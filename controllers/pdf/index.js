const routeHandler = require("../../utils/routeHandler");
const fs = require('fs');
const pdf = require('pdf-parse');
const { STATUS_CODE } = require("../../utils/utility");
const { UnitedIndiaInsurance, CholamandalamGeneralInsurance, UNITED_PVT_CAR_0, UNITED_PVT_CAR_PACKAGE, SHRIRAM_TAXI_CAR_PACKAGE } = require("./extract");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EXTRACT_PROMPT } = require("./constants");

const genAI = new GoogleGenerativeAI('AIzaSyD8V9gB9BrtGC4itn0pcFOtISQcV7YwsN8');

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const extractData = routeHandler(async (req, res, extras) => {
    const { pdf_type } = req.query
    // console.log('test');
    
    // try {
    //     if (!req.file) {
    //         return res.status(400).send('No file uploaded.');
    //     }
    //     const data = await pdf(req.file.buffer);
    //     const response = await openai.chat.completions.create({
    //         model: "gpt-4o",
    //         messages: [{ role: "user", content: `Extract meaningful insights from the following text: \n\n${data.text}` }],
    //     });

    //     // res.json({ text: pdfText, insights: response.choices[0].message.content });
    //     // const pdfData = await getFormValues(data.text)
    //     res.sendRes({ text: data.text, insights: response.choices[0].message.content }, { message: 'Data Extracted successfully', status: STATUS_CODE.OK });

    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Error processing the PDF file.');
    // }

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
        // const prompt = EXTRACT_PROMPT.TW_BIKE_PACKAGE;
        const image = {
        inlineData: {
            data: dataBuffer.toString("base64"),
            mimeType: 'application/pdf',
        },
        };

        // const response = await axios.post(
        //     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        //     {
        //         contents: [{ parts: [{ text: `Extract meaningful insights from the following text: \n\n${pdfText}` }] }]
        //     },
        //     {
        //         headers: { "Content-Type": "application/json" },
        //         params: { key: 'AIzaSyD8V9gB9BrtGC4itn0pcFOtISQcV7YwsN8' }
        //     }
        // );
        // const response = await GoogleGenerativeAI.models.generateContent({
        //     model: "gemini-2.0-flash",
        //     contents: [{ parts: [{ text: `Extract meaningful insights from the following text: \n\n${pdfText}` }] }]
        //   });

        // const image = {
        //     inlineData: {
        //       data: fs.readFileSync(req.file.buffer),
        //       mimeType: "application/pdf",
        //     },
        //   };
        //   const response = await ai.models.generateContenst({
        //     model: "gemini-2.0-flash",
        //     contents: "Explain how AI works",
        //   });
        //   console.log(response.text);
        const result = await model.generateContent([prompt, image]);
        const responseText  = result.response.text();
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
        res.json({ text: pdfText, insights: result.response.text(),data :jsonObject });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Error processing PDF" });
    } 
}, false);

const getFormValues = async (text) =>{
    // console.log(text);
    
    if(text.includes('UNITED INDIA INSURANCE COMPANY LIMITED') ){
       return UnitedIndiaInsurance(text);
    }else if(text.includes('United India Insurance Company') && text.includes('MOTOR INSURANCE ‐ PRIVATE CAR PACKAGE POLICY SCHEDULE')){
       return UNITED_PVT_CAR_PACKAGE(text);
    }else if(text.includes('United India Insurance Company')){
       return UNITED_PVT_CAR_0(text);
    }else if(text.includes('SHRIRAM GENERAL INSURANCE COMPANY LIMITED')){
       return SHRIRAM_TAXI_CAR_PACKAGE(text);
    }else if (text.includes('CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD')){
        return CholamandalamGeneralInsurance(text);
    }else{
        
    }
    return null
}


module.exports = {
    extractData,
};

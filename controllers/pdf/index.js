const routeHandler = require("../../utils/routeHandler");
const fs = require('fs');
const pdf = require('pdf-parse');
const { STATUS_CODE } = require("../../utils/utility");
const { UnitedIndiaInsurance, CholamandalamGeneralInsurance, UNITED_PVT_CAR_0, UNITED_PVT_CAR_PACKAGE, SHRIRAM_TAXI_CAR_PACKAGE } = require("./extract");


const extractData = routeHandler(async (req, res, extras) => {
    // console.log('test');
    
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const data = await pdf(req.file.buffer);
        const pdfData = await getFormValues(data.text)
        res.sendRes({ text: pdfData  }, { message: 'Data Extracted successfully', status: STATUS_CODE.OK });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the PDF file.');
    }
}, false);

const getFormValues = async (text) =>{
    console.log(text);
    
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

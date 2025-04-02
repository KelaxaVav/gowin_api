//Missing Captures
//Make Model YOM ChassisNo CC
const UNITED_PVT_CAR_0 = (text) =>{
    
    const receiptDate = /Receipt Date\s+(\d{2}\/\d{2}\/\d{4})/;
    const receiptDateVal = text.match(receiptDate);
    
    const nameOfTheInsured = /Name\s*([^\n]*)/;
    const nameOfTheInsuredVal = text.match(nameOfTheInsured);
    
    const policyNo = /Policy\s*No\.\s*([\w\d]+)/  ;
    const policyNoVal = text.match(policyNo);
    
    const mobileNo = /Mobile:\s*(\*{6}\d{4})/
    const mobileNoVal = text.match(mobileNo);
    
    const email = /Email\s([*]+@[A-Z0-9.-]+\.[A-Z]{2,})/;
    const emailVal = text.match(email);

    const poi = /Period of InsuranceFrom\s[\d:]+\sHrs\sof\s(\d{2}\/\d{2}\/\d{4})\sTo\sMidnight\sof\s(\d{2}\/\d{2}\/\d{4})/;
    const poiVal = text.match(poi);

    const regAuthority = /(?<=Registration\s+Authority\s+)(.*?)(?=\s*Geographical\s+AreaExtension)/;
    const regAuthorityVal = text.match(regAuthority)

    const regNo = /(?<=Trailer\s*\(.*?\)\s*)([A-Z]+\s*-\s*\d+\s*-\s*[A-Z]+\s*-\s*\d+)/;
    const regNoVal = text.match(regNo);

    const tpp =  /Total Liability Premium\s*([\d,]+\.\d{2})/;
    const tppVal = text.match(tpp);

    const netPremium = /Premium:\s*([\d,]+\.\d{2})/;
    const netPremiumVal = text.match(netPremium);

    const totalRoundOff = /Total \(Rounded\s*Off\):\s*([\d,]+\.\d{2})/;
    const totalRoundOffVal = text.match(totalRoundOff);
    
    return {
        type:'UNITED_PVT_CAR_0',
        issuanceData:receiptDateVal[1],
        insuredName:nameOfTheInsuredVal[1],
        policyNo:policyNoVal[1],
        mobileNo:mobileNoVal[1],
        email:emailVal[1],
        poiFrom:poiVal[1],
        poiTo:poiVal[5],
        regAuthority:regAuthorityVal[1],
        regNo:regNoVal[1],
        tpp:tppVal[1],
        netPremium:netPremiumVal[1],
        grossPremium:totalRoundOffVal[1],
    }
}

//Missing Captures
//Chassis Number Vehicle Make/Model YOM ChassisNo CC
const UNITED_PVT_CAR_PACKAGE = (text) =>{
    const receiptDate = /Receipt Date\s*(\d{2}\/\d{2}\/\d{4})/;
    const receiptDateVal = text.match(receiptDate);
    
    const nameOfTheInsured = /Insured Name:\s*(.*)/;
    const nameOfTheInsuredVal = text.match(nameOfTheInsured);
    
    const policyNo = /^Policy Number:\s*(\S+)/m  ;
    const policyNoVal = text.match(policyNo);
    
    const mobileNo = /Mobile No:(\d{10})/
    const mobileNoVal = text.match(mobileNo);
    
    const email = /Email:([\w.-]+@[\w.-]+\.\w+)/;
    const emailVal = text.match(email);

    const poiFrom = /Insurance Start Date & Time:\s*(\d{2}[‐-]\d{2}[‐-]\d{4}\s+\d{2}:\d{2})/;
    const poiFromVal = text.match(poiFrom);

    const regNo = /Registration Number\s*([A-Z]{2}[‐-]\d{2}[‐-][A-Z]{1,2}[‐-]\d{1,4})/i;
    const regNoVal = text.match(regNo)

    const regDate = /Registration Date\s*(\d{2}\/\d{2}\/\d{4})/i;
    const regDateVal = text.match(regDate)

    const rtaName = /RTA Name\s*([\w\s]+)Chassis Number/i;
    const rtaNameVal = text.match(rtaName)

    const yom = /Year of Manufacture Vehicle\s*Weight﴾kg.﴿\s*(\d{4})/i;
    const yomVal = text.match(yom)

    const cc = /Cubic Capacity \/ GVW\s*(\d+)/i;
    const ccVal = text.match(cc)

    const odp = /Total\s*([\d,]+\.\d{2})\s*Basic TP Liability/;
    const odpVal = text.match(odp)

    const tpp = /Basic TP Liability[\d,]+\.\d{2}[\s\S]*?Total\s*([\d,]+\.\d{2})/;
    const tppVal = text.match(tpp)

    const netPremium = /TOTAL PAYABLE PREMIUM\s*([\d,]+\.\d{2})/;
    const netPremiumVal = text.match(netPremium)

    const grossPremium = /Package Premium\s*([\d,]+\.\d{2})\s*GST @\d+\.\d+%/;
    const grossPremiumVal = text.match(grossPremium)


    return {
        type:'UNITED_PVT_CAR_PACKAGE',
        issuanceData:receiptDateVal[1],
        insuredName:nameOfTheInsuredVal[1],
        policyNo:policyNoVal[1],
        mobileNo:mobileNoVal[1],
        email:emailVal[1],
        poiFrom:poiFromVal[1],
        odFrom:poiFromVal[1],
        regNo:regNoVal[1],
        regDate:regDateVal[1],
        rtaName:rtaNameVal[1],
        yom:yomVal[1],
        cc:ccVal[1],
        odp:odpVal[1],
        tpp:tppVal[1],
        netPremium:netPremiumVal[1],
        grossPremium:grossPremiumVal[1],
}
}

//Missing Captures
//Chassis Number Vehicle Make/Model YOM ChassisNo CC
const SHRIRAM_TAXI_CAR_PACKAGE = (text) =>{
    const insuredCodeName = /Insured's Code\/ Name\s*([\w-]+)\s*\/\s*(.+)/;
    const insuredCodeNameVal = text.match(insuredCodeName);
    
    const policyNo = /Policy No\.\s*([\d/]+)/  ;
    const policyNoVal = text.match(policyNo);
    
    const tpOdStartEnd = /Liability Policy Period([\s\S]*?)From Date & Time\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})\s*Hrs\s*To Date & Time\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})\s*Hrs([\s\S]*?)From Date & Time\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})\s*Hrs\s*To Date & Time\s*(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})\s*Hrs/
    const tpOdStartEndVal = text.match(tpOdStartEnd);
    
    const rtoName = /\b([A-Z]{2}\s*-\s*\d{1,2}\s*-\s*[A-Z]{1,2}\s*-\s*\d{4})\b\s*&(.*?)\n/;
    const rtoNameVal = text.match(rtoName);

    const nameOfTheInsured = /Insured Name:\s*(.*)/;
    const nameOfTheInsuredVal = text.match(nameOfTheInsured);
    
    const poiFrom = /Insurance Start Date & Time:\s*(\d{2}[‐-]\d{2}[‐-]\d{4}\s+\d{2}:\d{2})/;
    const poiFromVal = text.match(poiFrom);

    const regNo = /Registration Number\s*([A-Z]{2}[‐-]\d{2}[‐-][A-Z]{1,2}[‐-]\d{1,4})/i;
    const regNoVal = text.match(regNo)

    const regDate = /Registration Date\s*(\d{2}\/\d{2}\/\d{4})/i;
    const regDateVal = text.match(regDate)

    const rtaName = /RTA Name\s*([\w\s]+)Chassis Number/i;
    const rtaNameVal = text.match(rtaName)

    const yom = /Year of Manufacture Vehicle\s*Weight﴾kg.﴿\s*(\d{4})/i;
    const yomVal = text.match(yom)

    const cc = /Cubic Capacity \/ GVW\s*(\d+)/i;
    const ccVal = text.match(cc)

    const odp = /Total\s*([\d,]+\.\d{2})\s*Basic TP Liability/;
    const odpVal = text.match(odp)

    const tpp = /Basic TP Liability[\d,]+\.\d{2}[\s\S]*?Total\s*([\d,]+\.\d{2})/;
    const tppVal = text.match(tpp)

    const netPremium = /TOTAL PAYABLE PREMIUM\s*([\d,]+\.\d{2})/;
    const netPremiumVal = text.match(netPremium)

    const grossPremium = /Package Premium\s*([\d,]+\.\d{2})\s*GST @\d+\.\d+%/;
    const grossPremiumVal = text.match(grossPremium)


    return {
        type:'UNITED_PVT_CAR_PACKAGE',
        insuredCodeName:insuredCodeNameVal[1],
        policyNo:policyNoVal[1],
        tpStart:new Date(tpOdStartEndVal[7]+' '+tpOdStartEndVal[8]),
        tpEnd:new Date(tpOdStartEndVal[9]+' '+tpOdStartEndVal[10]),
        odStart:new Date(tpOdStartEndVal[2]+' '+tpOdStartEndVal[3]),
        odEnd:new Date(tpOdStartEndVal[4]+' '+tpOdStartEndVal[5]),
        rtoName:rtoNameVal[1],

        insuredName:nameOfTheInsuredVal[1],
        mobileNo:mobileNoVal[1],
        email:emailVal[1],
        poiFrom:poiFromVal[1],
        odFrom:poiFromVal[1],
        regNo:regNoVal[1],
        regDate:regDateVal[1],
        rtaName:rtaNameVal[1],
        yom:yomVal[1],
        cc:ccVal[1],
        odp:odpVal[1],
        tpp:tppVal[1],
        netPremium:netPremiumVal[1],
        grossPremium:grossPremiumVal[1],
}
}


const UnitedIndiaInsurance = (text) =>{
    console.log('United India Insurance Company Limited');
    
    const receiptDate = /Receipt Date:\s*(\d{2}\/\d{2}\/\d{4})/;
    const receiptDateVal = text.match(receiptDate);

    const agentName = /Agent Name:\s*([^\n]*)/;
    const agentNameVal = text.match(agentName);

    const nameOfTheInsured = /Name of the Insured\s*([^\n]*)/;
    const nameOfTheInsuredVal = text.match(nameOfTheInsured);
    
    const mobileNo = /Mobile\s*No\.?-?\s*(\d{10}|\*+\d{4})/;
    const mobileNoVal = text.match(mobileNo);

    const policyNo = /Policy\s*No\.?-?\s*([\w\d]+)/  ;
    const policyNoVal = text.match(policyNo);

    const rtaName = /RTA\s*Name\s*([^\n]*)\s*Chassis\s*Number/;
    const rtaNameVal = text.match(rtaName);

    const registrationNumber = /Registration\s*Number\s*([^\n]*)\s*([^\n]*)/;
    const registrationNumberVal = text.match(registrationNumber);

    const registrationDate = /Registration\s*Date(\d{2}\/\d{2}\/\d{4})/;
    const registrationDateVal = text.match(registrationDate);
    const [day, month, year] = registrationDateVal[1].split('/');

    const make = /Vehicle\s*Make\s*&\s*Model\s*([^\n]*)/;
    const makeVal = text.match(make);

    const model = /Make\s*&\s*Model[^&]*&\s*([^\n&]*)/;
    const modelVal = text.match(model);

    const yom = /Year\s*of\s*Mfg[\s\S]*?\b(\d{4})\b[\s\S]*?Registration\s*AuthorityGeographical/;
    const yomVal = text.match(yom);
    
    const engineNo = /\(if any\)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/;
    const engineNoVal = text.match(engineNo);
    
    const cc = /Year\s*of\s*Mfg[\s\S]*?\b(\d{4})\b[\s\S]*?(\d+)/;
    const ccVal = text.match(cc);

    const insuredDeclared = /Insured's\s+Declared\s+Value\s+(\d+)/;
    const insuredDeclaredVal = text.match(insuredDeclared);

    const grossODA = /Gross\s*OD\(\w\)\s*(\d{1,3}(?:,\d{3})*\.\d{2})/;
    const grossODAVal = text.match(grossODA);

    const grossTPB = /Gross\s*TP\(\w\)\s*(\d{1,3}(?:,\d{3})*\.\d{2})/;
    const grossTPBVal = text.match(grossTPB);
    
    const grossODTP = /([\d,]+\.\d{2})(?=\s*Premium\(A\+B\))/;
    const grossODTPVal = text.match(grossODTP);

    const TotalPayablePremium = /TOTAL\sPAYABLE\sPREMIUM\s([\d,]+\.\d{2})/;
    const TotalPayablePremiumVal = text.match(TotalPayablePremium);
    return {
        type:0,
        receiptDate:receiptDateVal[1],
        agentName:agentNameVal[1],
        nameOfTheInsured:nameOfTheInsuredVal[1],
        mobileNo:mobileNoVal[1],
        policyNo:policyNoVal[1],
        rtaName:rtaNameVal[1],
        registrationNumber:registrationNumberVal[1],
        registrationDate:registrationDateVal[1],
        make:makeVal[1],
        model:modelVal[1],
        yom:yomVal[1],
        engineNo:engineNoVal[3],
        cc:ccVal[2],
        age:calculateAge(parseInt(year)),
        insuredDeclared:insuredDeclaredVal[1],
        grossODA:grossODAVal[1],
        grossTPB:grossTPBVal[1],
        grossODTP:grossODTPVal[1],
        TotalPayablePremium:TotalPayablePremiumVal[1],
    }
}


const CholamandalamGeneralInsurance = (text)=>{
    const receiptDate = /DATE:\s*(\d{2}\/\d{2}\/\d{4})/;
    const receiptDateVal = text.match(receiptDate);
    
    const intermediaryName = /Intermediary\sName:\s*([^\n,]+)/;
    const intermediaryNameVal = text.match(intermediaryName);
    
    const nameAndCommunicationAddress = /Name\s*&\s*Communication\s*Address:\s*([\s\S]+?)\n(?:Mobile|Name\s*and\s*Registration\s*Address)/;
    const nameAndCommunicationAddressVal = text.match(nameAndCommunicationAddress);
    
    const policyNo = /Policy\s*Number:\s*([\d\/]+)/;
    const policyNoVal = text.match(policyNo);

    const placeOfRegistration = /Place\s*of\s*Registration:\s*([^\r\n]+?)(?=\s*Registration\s*Mark:)/;
    const placeOfRegistrationVal = text.match(placeOfRegistration);

    const registrationMark = /Registration\s*Mark:\s*(\S+)/;
    const registrationMarkVal = text.match(registrationMark);

    const registrationDate = /Date\s*of\s*Registration:\s*(\d{2}\/\d{2}\/\d{4})/;
    const registrationDateVal = text.match(registrationDate);
    const [day, month, year] = registrationDateVal[1].split('/');
    
    const make = /(?<=Make:\s*)(\w+)/;
    const makeVal = text.match(make);

    const model = /(?<=Model:\s*)(\w+ \d+)/;
    const modelVal = text.match(model);

    const yom = /Year of Mfg:\s*(\d{4})/;
    const yomVal = text.match(yom);
    
    const engineNo = /(?<=Engine No:\s*)\w+/;
    const engineNoVal = text.match(engineNo);
    
    const chassisNo = /Chassis No:\s*(\w+)/;
    const chassisNoVal = text.match(chassisNo);

    const cc = /Cubic Capacity:\s*(\d+)/;
    const ccVal = text.match(cc);

    const firstYear = /1st\s*Y\s*ear?:\s*(\d+)/;
    const firstYearVal = text.match(firstYear);

    return {
        type:'CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD',
        receiptDate:receiptDateVal[1],
        intermediaryName:intermediaryNameVal[1],
        nameAndCommunicationAddress:nameAndCommunicationAddressVal[1],
        policyNo:policyNoVal[1],
        placeOfRegistration:placeOfRegistrationVal[1],
        registrationMark:registrationMarkVal[1],
        registrationDate:registrationDateVal[1],
        make:makeVal[1],
        model:modelVal[1],
        yom:yomVal[1],
        engineNo:engineNoVal[0],
        chassisNo:chassisNoVal[1],
        cc:ccVal[1],
        age:calculateAge(parseInt(year)),
        firstYear:firstYearVal[1],
    }
    
}

const calculateAge = (yom)=>{
    let currentYear = new Date().getFullYear();
    return currentYear - yom
}


module.exports = {
    UNITED_PVT_CAR_0,
    UNITED_PVT_CAR_PACKAGE,
    SHRIRAM_TAXI_CAR_PACKAGE,
    UnitedIndiaInsurance,
    CholamandalamGeneralInsurance
};

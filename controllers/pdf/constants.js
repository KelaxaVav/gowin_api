const EXTRACT_PROMPT = {
    TW_BIKE_PACKAGE: "Extract the mentioned data as json object not text. Policy No as policy_no,Name Of the Insured as name_of_the_insured,Mobile No as mobile_no, Period of Insurance From as poi_from, Period of Insurance To as poi_to ,Registration No as reg_no, Chassis No as chassis_no, Make/Model as make_and_model,Year of Mfg as yom, Cubic Capacity/KW as cc, Registration Authority as reg_authority, Receipt Date as receipt_date,Gross OD(A) as ODP, Gross TP(B) as gtp, Gross OD & TP (A) + (B) as god_tp_a_b,Total (Rounded Off) as total_round_off ? return only json object",
    TW_BIKE_BUNDLED: `Extract the mentioned data as json object not text. 
    Receipt Date as receipt_date,
    Insured Name / ID as name_of_the_insured & name_of_the_insured_id,
    Policy Number as policy_no,
    Mobile as mobile_no,
    Period of Insurance(Liability) as tp_start_date & tp_end_date,
    Period of Insurance(Own Damage) as od_start_date & od_end_date,
    Vehicle Make / Model the first part before ambersand symbol as make,
    Registration Date as reg_date,
    year different between today to Registration Date as age,
    RTA Name as rto_name,
    Registration No as reg_no,
    Year of Manufacture as yom,
    Chassis Number as chassis_no,
    Cubic Capacity /Kw as cc,
    Gross Od(A) as ODP,
    Total Liability Premium as tpp,
    Premium(A+B) as net_premium,
    TOTAL PAYABLE PREMIUM as gross_premium
    ? return only json object`,
}

module.exports.EXTRACT_PROMPT = EXTRACT_PROMPT

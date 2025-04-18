const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Product, Make, RTOCategory, RTO, Insurer, MakeModal } = require('../../models');
const { Validation, findModelOrThrow } = require('../../utils/validation');
const AppError = require('../../utils/appError');
const { STATUS_CODE } = require('../../utils/utility');
const { Op } = require('sequelize');

const genAI = new GoogleGenerativeAI('AIzaSyD8V9gB9BrtGC4itn0pcFOtISQcV7YwsN8');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class PDFService {
    /**
     * 
     * @param {{
     * product_id:string
     * file:Express.Multer.File
     * }} param0 
     * @returns 
     */
    static async extractPDF({ product_id, file }) {
        Validation.nullParameters([product_id, file.buffer]);

        const product = await findModelOrThrow({ product_id }, Product, {
            include: [
                {
                    model: Insurer,
                    as: 'insurer',
                    include: [
                        {
                            model: RTOCategory,
                            as: 'rtoCategories',
                            include: [
                                {
                                    model: RTO,
                                    as: 'rtos',
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const pdfConfig = require('../../data/pdfConfig.json');
        const prompt = pdfConfig[product.pdf_type];
        // const prompt = {
        //     "query": "Extract the mentioned data as json object not text.",
        //     "data": {
        //         "receipt_date": "Receipt Date as receipt_date",
        //         "name_of_the_insured": "Insured Name",
        //         "name_of_the_insured_id": "Insured ID",
        //         "policy_no": "Policy Number as policy_no",
        //         "mobile_no": "Mobile as mobile_no",
        //         "tp_start_date": "Period of Insurance(Liability) start",
        //         "tp_end_date": "Period of Insurance(Liability) end",
        //         "od_start_date": "Period of Insurance(Own Damage) start",
        //         "od_end_date": "Period of Insurance(Own Damage) end",
        //         "make": "Vehicle Make / Model the first part before ambersand symbol as make",
        //         "reg_date": "Registration Date as reg_date",
        //         "age": "year different between today to Registration Date as age",
        //         "rto_name": "RTA Name as rto_name",
        //         "reg_no": "Registration No as reg_no",
        //         "yom": "Year of Manufacture as yom",
        //         "chassis_no": "Chassis Number as chassis_no",
        //         "cc": "Cubic Capacity /Kw as cc",
        //         "ODP": "Gross Od(A) as ODP",
        //         "tpp": "Total Liability Premium as tpp",
        //         "net_premium": "Premium(A+B) as net_premium",
        //         "gross_premium": "TOTAL PAYABLE PREMIUM"
        //     },
        //     "return_type": "json only"
        // };

        Validation.isTrue(!!prompt, {
            message: "Product not configured to capture from pdf",
        });

        try {
            const image = {
                inlineData: {
                    data: file.buffer.toString("base64"),
                    mimeType: 'application/pdf',
                },
            };

            let promptText = `Extract the mentioned data as json object not text. ${Object.keys(prompt.data).reduce((acc, key) => {
                const label = prompt.data[key];

                return acc += `${label} as ${key}, `;
            })} return json object`;

            const result = await model.generateContent([promptText, image]);
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

            const raw = JSON.parse(cleaned);

            const regDate = new Date(raw.reg_date);

            if (regDate instanceof Date && !isNaN(regDate.valueOf())) {
                const currentDate = new Date();
                raw.age = currentDate.getFullYear() - regDate.getFullYear();
            }

            let make = null;
            if (raw.make) {
                make = await Make.findOne({
                    include: [
                        {
                            model: MakeModal,
                            as: 'makeModals',
                        },
                    ],
                    where: {
                        name: {
                            [Op.like]: `%${raw.make}%`,
                        }
                    },
                });
            }

            let rto = null;
            if (raw.rto_name) {
                rto = await RTO.findOne({
                    include: [
                        {
                            model: RTOCategory,
                            as: 'rtoCategories',
                            where: {
                                insurer_id: product.insurer_id,
                            },
                        },
                    ],
                    where: {
                        name: {
                            [Op.like]: `%${raw.rto_name}%`,
                        }
                    },
                });
            }

            return {
                raw,
                make,
                rto,
                data: {
                    product,
                }
            };
        } catch (error) {
            console.log(error);

            throw new AppError('Error processing PDF', STATUS_CODE.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = PDFService;
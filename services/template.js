const { Op } = require("sequelize");
const { Template } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const { TEMPLATE_TYPES } = require("../data/constants");
const Handlebars = require("handlebars");

class TemplateService {
    /**
     * 
     * @param {{
     * branch_id:string
     * name:string
     * type:string
     * data:any
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createTemplate({ branch_id, name, type, data }, extras) {
        Validation.nullParameters([name, type, data]);
        Validation.isTrue(TEMPLATE_TYPES[type]);

        await findModelAndThrow({
            branch_id,
            name,
            type,
        }, Template, { throwOnDeleted: true });

        const template = await Template.create({
            name,
            type,
            data,
            branch_id,
        }, { transaction: extras.transaction });

        return template;
    }

    /**
     * 
     * @param {{
     * template_id:string
     * branch_id:string
     * name:string
     * type:string
     * status:bool
     * data:any
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async updateTemplate({ template_id, branch_id, name, type, status, data }, extras) {
        Validation.nullParameters([name, type, data]);
        Validation.isTrue(TEMPLATE_TYPES[type]);

        const template = await findModelOrThrow({ template_id }, Template);
        template.branch_id && Validation.authority(branch_id, template.branch_id);

        await findModelAndThrow({
            template_id: {
                [Op.not]: template_id,
            },
            branch_id,
            name,
            type,
        }, Template, { throwOnDeleted: true });

        await template.update({
            name,
            type,
            status,
            data,
        }, { transaction: extras.transaction });

        return template;
    }

    /**
     * 
     * @param {{
     * template_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteTemplate({ template_id, branch_id }, extras) {
        const template = await findModelOrThrow({ template_id }, Template, {
            throwOnDeleted: true,
            messageOnDeleted: "Template is already deleted",
        });
        Validation.authority(branch_id, template.branch_id);

        await template.destroy({ transaction: extras.transaction });
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {string} type 
     * @returns {Promise<{[key:string]:any}>}
     */
    static async findTemplatesByType(branch_id, type) {
        /** @type {TTemplate[]} */
        const templates = await Template.findAll({
            where: {
                type,
                [Op.or]: [
                    {
                        branch_id,
                    },
                    {
                        branch_id: null,
                    },
                ]
            },
        });

        const data = templates.reduce((obj, template) => {
            obj[template.name] = template.data;
            return obj;
        }, {});

        return data;
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {string} type 
     * @param {string} name 
     * @returns {Promise<any>}
     */
    static async findTemplateByName(branch_id, type, name) {
        /** @type {TTemplate} */
        const template = await findModelOrThrow({
            name,
            type,
            [Op.or]: [
                {
                    branch_id,
                },
                {
                    branch_id: null,
                },
            ]
        }, Template);

        if (!template.status) {
            return;
        }

        return template.data;
    }

    /**
     * 
     * @param {any} template 
     * @param {{[key:string]:string|number}} variables 
     * @returns 
     */
    static setTemplateVariables(template, variables) {
        const renderTemplate = Handlebars.compile(JSON.stringify(template));
        const templateString = renderTemplate(variables);

        return JSON.parse(templateString);
    }

    static async renderVariables(template, entities, replacerCb) {
        return entities.map(entity => {
            const { variables, data } = replacerCb(entity);

            const renderedData = this.setTemplateVariables(template, variables);
            renderedData.data = data;
            return renderedData;
        });
    }

    static async setTemplateWithUsers(template, entities, replacerCb, { propertyKey }) {
        entities.forEach(entity => {
            const { variables, data } = replacerCb(entity);
            const renderedData = this.setTemplateVariables(template, variables);
            renderedData.data = data;
            entity[propertyKey] = renderedData;
        });
    }
}

// sample
// await TemplateService.setTemplateWithUsers(template, users, (user) => ({
//     variables: {
//         USERNAME: user.last_name,
//         AMOUNT_LKR: user.mobile,
//     },
//     data: {
//         key: "value",
//     }
// }), {
//     propertyKey: 'notification',
// });

module.exports = TemplateService;

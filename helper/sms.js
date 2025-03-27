const SettingService = require("../services/setting");
const TemplateService = require("../services/template");
const { sendSMS } = require("../utils/utility");

module.exports.sendInvoicePlacedSMS = async ({ branch_id, invoice, reward, customer }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_INVOICE_PLACED');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        REWARD: reward.toFixed(2),
        TOTAL_REWARDS: customer.rewards.toFixed(2),
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}

module.exports.sendInvoiceDeliveredSMS = async ({ branch_id, invoice }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_INVOICE_DELIVERED');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}

module.exports.sendOrderPlacedSMS = async ({ branch_id, invoice, kitchenOrder }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_ORDER_PLACED');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
        CUSTOM_ORDER_NO: kitchenOrder.order_no,
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}

module.exports.sendOrderProcessingSMS = async ({ branch_id, invoice, kitchenOrder }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_ORDER_PROCESSING');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
        CUSTOM_ORDER_NO: kitchenOrder.order_no,
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}

module.exports.sendOrderCompletedSMS = async ({ branch_id, invoice, kitchenOrder }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_ORDER_COMPLETED');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
        CUSTOM_ORDER_NO: kitchenOrder.order_no,
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}

module.exports.sendOrderDeliveredSMS = async ({ branch_id, invoice, kitchenOrder }) => {
    const companySettings = await SettingService.findSettingsByType('COMPANY');
    const template = await TemplateService.findTemplateByName(branch_id, 'SMS', 'CUSTOMER_ORDER_DELIVERED');
    if (!template) {
        return;
    }

    const message = TemplateService.setTemplateVariables(template.ENGLISH.body, {
        CUSTOMER_NAME: invoice.customer.name,
        INVOICE_NO: invoice.invoice_no,
        COMPANY_NAME: companySettings.GENERAL.name,
        BRANCH: invoice.branch.name,
        CONTACT: invoice.branch.contact[0],
        CUSTOM_ORDER_NO: kitchenOrder.order_no,
    });
    await sendSMS(invoice.customer.mobile, message).catch(console.log);
}
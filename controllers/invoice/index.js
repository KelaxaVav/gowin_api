const { Invoice, Customer, Vendor, Branch, InvoiceItem, Batch, Item, Category, Transaction } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const InvoiceService = require("../../services/invoice");
const TransactionService = require("../../services/transaction");
const CustomerService = require("../../services/customer");
const { INVOICE_TYPES, TRANSACTION_REASONS, TRANSACTION_METHODS } = require("../../data/constants");
const { sendInvoicePlacedSMS, sendOrderPlacedSMS } = require("../../helper/sms");

const create = routeHandler(async (req, res, extras) => {
	const { date, type, party_id, mobile, name, discount_type, discount_value, delivery_at, status, invoiceItems, amount, reason, used_rewards, data } = req.body;
	const { branch_id } = req.branch;

	const invoice = await InvoiceService.createInvoice({
		date,
		party_id,
		mobile,
		name,
		discount_type,
		discount_value,
		delivery_at,
		type,
		branch_id,
		invoiceItems,
		status,
		data,
	}, extras);

	await InvoiceService.updateInvoiceStatus({
		status,
		branch_id,
		invoice_id: invoice.invoice_id,
		isServiceCall: true,
	}, extras);

	if (amount && reason) {
		await TransactionService.createTransaction({
			entity_id: invoice.invoice_id,
			entity_type: "INVOICE",
			branch_id,
			date,
			amount,
			reason,
		}, extras);
	}

	if (used_rewards && type == INVOICE_TYPES.CUSTOMER) {
		await CustomerService.useRewards({
			branch_id,
			customer_id: invoice.party_id,
			amount: used_rewards,
		}, extras);

		await TransactionService.createTransaction({
			entity_id: invoice.invoice_id,
			entity_type: "INVOICE",
			branch_id,
			date,
			amount: used_rewards,
			method: TRANSACTION_METHODS.REWARD,
			reason: TRANSACTION_REASONS.INVOICE_PAYMENT,
		}, extras);
	}

	await invoice.reload({
		include: [
			{
				model: InvoiceItem,
				as: 'invoiceItems',
				include: [
					{
						model: Batch,
						as: 'batch',
						include: [
							{
								model: Item,
								as: 'item',
							}
						],
					},
				],
			},
			{
				model: Customer,
				as: 'customer',
			},
			{
				model: Branch,
				as: 'branch',
			},
			{
				model: Transaction,
				as: 'transactions',
			},
		],
		transaction: extras.transaction,
	});

	let invoiceSmsData;
	if (type == INVOICE_TYPES.CUSTOMER && (mobile || party_id)) {
		const invoiceReward = await CustomerService.addRewards({
			branch_id,
			customer_id: invoice.party_id,
			total: invoice.dataValues.total,
		}, extras);

		if (invoiceReward) {
			const { reward, customer } = invoiceReward;
			invoiceSmsData = { branch_id, invoice, reward, customer };
		}
	}

	await extras.transaction.commit();

	if (invoiceSmsData) {
		await sendInvoicePlacedSMS(invoiceSmsData);
	}

	return res.sendRes(invoice, { message: 'Invoice created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Invoice, req.query, { defaultFilterObject: { branch_id } });

	const includeModels = [
		{
			model: Customer,
			as: 'customer',
			paranoid: false,
		},
		{
			model: Vendor,
			as: 'vendor',
			paranoid: false,
		},
		{
			model: Branch,
			as: 'branch',
			paranoid: false,
		},
		{
			model: InvoiceItem,
			as: 'invoiceItems',
			attributes: ['price', 'quantity', 'return_quantity', 'discount_type', 'discount_value'],
		},
		{
			model: Transaction,
			as: 'transactions',
		},
	];

	const invoices = await Invoice.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: includeModels,
		where: whereOption,
	});

	invoices.forEach(invoice => {
		delete invoice.dataValues.invoiceItems;
		delete invoice.dataValues.transactions;
	})

	return res.sendRes(invoices, {
		message: 'Invoices loaded successfully',
		total: await Invoice.count({ where: whereOption }),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { invoice_id } = req.params;

	/** @type {TInvoice} */
	const invoice = await findModelOrThrow({ invoice_id }, Invoice, {
		include: [
			{
				model: Customer,
				as: 'customer',
				paranoid: false,
			},
			{
				model: Vendor,
				as: 'vendor',
				paranoid: false,
			},
			{
				model: Branch,
				as: 'branch',
				paranoid: false,
			},
			{
				model: InvoiceItem,
				as: 'invoiceItems',
				include: [
					{
						model: Batch,
						as: 'batch',
						paranoid: false,
						include: [
							{
								model: Item,
								as: 'item',
								paranoid: false,
								include: [
									{
										model: Batch,
										as: 'batches',
									},
								],
							},
						],
					},
				],
			},
			{
				model: Transaction,
				as: 'transactions',
			},
		],
		order: [['transactions', 'date', 'DESC']],
	});

	invoice.invoiceItems.forEach(iItem => {
		iItem.batch.item.dataValues.quantity = iItem.batch.item.batches.reduce((acc, batch) => acc + batch.quantity, 0);
	});

	return res.sendRes(invoice, { message: 'Invoice loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { invoice_id } = req.params;
	const { branch_id } = req.branch;
	const { party_id, mobile, name, date, discount_type, discount_value, delivery_at, invoiceItems } = req.body;

	const invoice = await InvoiceService.updateInvoice({
		invoice_id,
		branch_id,
		date,
		party_id,
		mobile,
		name,
		discount_type,
		discount_value,
		delivery_at,
		invoiceItems,
	}, extras);

	await invoice.reload({
		include: [
			{
				model: InvoiceItem,
				as: 'invoiceItems',
				include: [
					{
						model: Batch,
						as: 'batch',
					},
				],
			},
		],
		transaction: extras.transaction,
	});


	await extras.transaction.commit();
	return res.sendRes(invoice, { message: 'Invoice updated successfully', status: STATUS_CODE.OK });
});

const updateStatus = routeHandler(async (req, res, extras) => {
	const { invoice_id, status } = req.params;
	const { branch_id } = req.branch;

	const { invoice, orderPlacedSmses } = await InvoiceService.updateInvoiceStatus({
		branch_id,
		invoice_id,
		status,
	}, extras);

	await extras.transaction.commit();

	await Promise.all(orderPlacedSmses.map(async data => await sendOrderPlacedSMS(data)));

	return res.sendRes(invoice, { message: 'Invoice status updated successfully', status: STATUS_CODE.OK });
});

const returnInvoice = routeHandler(async (req, res, extras) => {
	const { invoice_id } = req.params;
	const { branch_id } = req.branch;
	const { invoiceItems } = req.body;

	const invoice = await InvoiceService.returnInvoice({
		invoice_id,
		branch_id,
		invoiceItems,
	}, extras);

	await invoice.reload({
		include: [
			{
				model: InvoiceItem,
				as: 'invoiceItems',
				include: [
					{
						model: Batch,
						as: 'batch',
					},
				],
			},
		],
		transaction: extras.transaction,
	});


	await extras.transaction.commit();
	return res.sendRes(invoice, { message: 'Invoice return updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { invoice_id } = req.params;
	const { branch_id } = req.branch;

	await InvoiceService.deleteInvoice({ invoice_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Invoice deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	updateStatus,
	returnInvoice,
	deleteById,
};
const { KITCHEN_ORDER_TYPES, KITCHEN_ORDER_STATUSES, INVOICE_STATUSES } = require("../data/constants");
const { sendOrderProcessingSMS, sendOrderCompletedSMS, sendOrderDeliveredSMS } = require("../helper/sms");
const { KitchenOrder, KitchenOrderItem, Item, InvoiceItem, Batch, Invoice, Branch, Customer } = require("../models");
const { firstLetterCapital } = require("../utils/utility");
const { Validation, findModelOrThrow } = require("../utils/validation");
const ItemService = require("./item");

class KitchenService {
    /**
     * Create kitchen orders
     * @param {{
     * type:TKitchenOrderType
     * branch_id:string
     * }}  
     * @param {(TInvoiceItem|TKitchenOrderItem)[]} items 
     * @param {Extras} extras 
     */
    static async createKitchenOrders({ type, branch_id }, items, extras) {
        if (!items.length) {
            return [];
        }

        /** @type {TKitchenOrder[]} */
        let kitchenOrderData;
        if (type == KITCHEN_ORDER_TYPES.INVOICE) {
            /** @type {TKitchenOrder[]} */
            const findKitchenOrders = await KitchenOrder.findAll({
                where: {
                    entity_id: items.map(iItem => iItem.invoice_item_id),
                }
            });
            const kitchenOrders = findKitchenOrders.reduce((data, ko) => {
                data[ko.entity_id] = ko;
                return data;
            }, {});

            /** @type {TInvoiceItem[]} */
            const invoiceItems = items;
            kitchenOrderData = [];

            invoiceItems.forEach(item => {
                const { invoice_item_id } = item;

                if (!kitchenOrders[invoice_item_id]) {
                    kitchenOrderData.push({
                        type: KITCHEN_ORDER_TYPES.INVOICE,
                        entity_id: invoice_item_id,
                    });
                }
            });

            await Promise.all(findKitchenOrders.map(async ko => {
                await ko.update({ status: KITCHEN_ORDER_STATUSES.PENDING }, { transaction: extras.transaction });
            }));
        } else if (type == KITCHEN_ORDER_TYPES.STOCK) {
            await ItemService.validateExistingItemsWithBranch(branch_id, items, extras);

            /** @type {TKitchenOrderItem[]} */
            const kitchenOrderItems = items;
            kitchenOrderData = kitchenOrderItems.map(item => {
                const { item_id, price, quantity, delivery_at } = item;
                Validation.isTrue(quantity > 0);
                Validation.isTrue(price > 0);

                /** @type {TKitchenOrder} */
                const newItem = {
                    type: KITCHEN_ORDER_TYPES.STOCK,
                    kitchenOrderItem: {
                        branch_id,
                        item_id,
                        price,
                        quantity,
                        delivery_at,
                    },
                }
                return newItem;
            });
        }

        const kitchenOrders = await KitchenOrder.bulkCreate(kitchenOrderData, {
            include: [
                {
                    model: KitchenOrderItem,
                    as: 'kitchenOrderItem',
                }
            ],
            transaction: extras.transaction,
        });

        return kitchenOrders;
    }

    /**
    * Update stock orders
    * @param {{
    * kitchen_order_id:string
    * branch_id:string
    * item_id:string
    * price:number
    * quantity:number
    * delivery_at:Date
    * }}  
    * @param {Extras} extras 
    */
    static async updateStockOrder({ kitchen_order_id, branch_id, item_id, price, quantity, delivery_at }, extras) {
        Validation.nullParameters([
            item_id,
            quantity,
            price,
        ]);

        /** @type {TKitchenOrder} */
        const kitchenOrder = await findModelOrThrow({
            kitchen_order_id,
            type: KITCHEN_ORDER_TYPES.STOCK,
        }, KitchenOrder, {
            include: [
                {
                    model: KitchenOrderItem,
                    as: 'kitchenOrderItem',
                }
            ],
        });

        if (kitchenOrder.status != KITCHEN_ORDER_STATUSES.PENDING) {
            Validation.isTrue(quantity == kitchenOrder.kitchenOrderItem.quantity, {
                message: `Can't update quantity of ${kitchenOrder.status.toLowerCase()} kitchen order`,
            });
            Validation.isTrue(delivery_at == kitchenOrder.kitchenOrderItem.delivery_at, {
                message: `Can't update delivery date of ${kitchenOrder.status.toLowerCase()} kitchen order`,
            });
        }

        Validation.isTrue(quantity > 0);
        Validation.isTrue(price > 0);
        Validation.authority(branch_id, kitchenOrder.kitchenOrderItem.branch_id);

        await kitchenOrder.kitchenOrderItem.update({
            item_id,
            price,
            quantity,
            delivery_at,
        }, { transaction: extras.transaction });

        return kitchenOrder;
    }

    /**
    * Update order status
    * @param {{
    * kitchen_order_id:string
    * branch_id:string
    * status:TKitchenOrderStatus
    * }}  
    * @param {Extras} extras 
    */
    static async updateOrderStatus({ kitchen_order_id, branch_id, status }, extras) {
        /** @type {TKitchenOrder} */
        const kitchenOrder = await findModelOrThrow({ kitchen_order_id, }, KitchenOrder, {
            include: [
                {
                    model: KitchenOrderItem,
                    as: 'kitchenOrderItem',
                    include: [
                        {
                            model: Item,
                            as: 'item',
                        },
                    ],
                },
                {
                    model: InvoiceItem,
                    as: 'invoiceItem',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                        },
                        {
                            model: Invoice,
                            as: 'invoice',
                            include: [
                                {
                                    model: Branch,
                                    as: 'branch',
                                },
                                {
                                    model: Customer,
                                    as: 'customer',
                                }
                            ],
                        },
                    ],
                },
            ],
        });

        if (kitchenOrder.type == KITCHEN_ORDER_TYPES.STOCK) {
            Validation.authority(branch_id, kitchenOrder.kitchenOrderItem.branch_id);
        } else if (kitchenOrder.type == KITCHEN_ORDER_TYPES.INVOICE) {
            Validation.authority(branch_id, kitchenOrder.invoiceItem.invoice.branch_id);
        }

        Validation.isTrue(status != kitchenOrder.status, {
            message: `Kitchen order already ${status.toLowerCase()}`,
        });

        if (status == KITCHEN_ORDER_STATUSES.PENDING) {
            Validation.isTrue([KITCHEN_ORDER_STATUSES.CANCELLED, KITCHEN_ORDER_STATUSES.PROCESSING].includes(kitchenOrder.status), {
                message: `${firstLetterCapital(kitchenOrder.status)} kitchen order cannot be changed to ${status.toLowerCase()}`,
            });
        } else if (status == KITCHEN_ORDER_STATUSES.CANCELLED) {
            Validation.isTrue([KITCHEN_ORDER_STATUSES.PENDING, KITCHEN_ORDER_STATUSES.PROCESSING].includes(kitchenOrder.status), {
                message: `${firstLetterCapital(kitchenOrder.status)} kitchen order cannot be changed to ${status.toLowerCase()}`,
            });
        } else if (status == KITCHEN_ORDER_STATUSES.PROCESSING) {
            Validation.isTrue(kitchenOrder.status == KITCHEN_ORDER_STATUSES.PENDING, {
                message: `${firstLetterCapital(kitchenOrder.status)} kitchen order cannot be changed to ${status.toLowerCase()}`,
            });

            if (kitchenOrder.type == KITCHEN_ORDER_TYPES.INVOICE) {
                Validation.isTrue(kitchenOrder.invoiceItem.invoice.status == INVOICE_STATUSES.CONFIRMED, {
                    message: `Invoice must be confirmed before change kitchen order to ${status.toLowerCase()}`,
                });

                await sendOrderProcessingSMS({
                    branch_id,
                    kitchenOrder,
                    invoice: kitchenOrder.invoiceItem.invoice,
                });
            }
        } else if (status == KITCHEN_ORDER_STATUSES.COMPLETED) {
            Validation.isTrue(kitchenOrder.status == KITCHEN_ORDER_STATUSES.PROCESSING, {
                message: `${firstLetterCapital(kitchenOrder.status)} kitchen order cannot be changed to ${status.toLowerCase()}`,
            });

            if (kitchenOrder.type == KITCHEN_ORDER_TYPES.INVOICE) {
                await sendOrderCompletedSMS({
                    branch_id,
                    kitchenOrder,
                    invoice: kitchenOrder.invoiceItem.invoice,
                });
            }
        } else if (status == KITCHEN_ORDER_STATUSES.DELIVERED) {
            Validation.isTrue(kitchenOrder.status == KITCHEN_ORDER_STATUSES.COMPLETED, {
                message: `Kitchen order must be confirmed before change kitchen order to ${status.toLowerCase()}`,
            });

            if (kitchenOrder.type == KITCHEN_ORDER_TYPES.INVOICE) {
                await sendOrderDeliveredSMS({
                    branch_id,
                    kitchenOrder,
                    invoice: kitchenOrder.invoiceItem.invoice,
                });
            }
        } else {
            Validation.isTrue(false);
        }

        await kitchenOrder.update({ status }, { transaction: extras.transaction });

        if (status != KITCHEN_ORDER_STATUSES.COMPLETED) {
            return kitchenOrder;
        }

        if (kitchenOrder.type == KITCHEN_ORDER_TYPES.INVOICE) {
            await kitchenOrder.invoiceItem.batch.update({
                quantity: 0,
            }, { transaction: extras.transaction });
        } else if (kitchenOrder.type == KITCHEN_ORDER_TYPES.STOCK) {
            const { item_id, quantity, price } = kitchenOrder.kitchenOrderItem;

            await Batch.create({
                item_id,
                quantity,
                price,
            }, { transaction: extras.transaction });
        }
        return kitchenOrder;
    }


}

module.exports = KitchenService;
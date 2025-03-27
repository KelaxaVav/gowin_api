/** @param {TItem[]} items */
const itemAfterFind = (items) => {
    items.forEach(item => {
        if (item.batches) {
            item.dataValues.quantity = item.batches.reduce((acc, batch) => acc + batch.quantity, 0);
        }
    });
}

module.exports = {
    itemAfterFind,
};
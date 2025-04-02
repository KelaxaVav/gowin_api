/** @param {TStaff[]} staffs */
const staffAfterFind = (staffs) => {
    staffs.forEach(staff => {
        const role = staff.role?.name;

        if (role) {
            staff.dataValues.role = role;
            staff.role = role;
        }
    });
}

module.exports = {
    staffAfterFind,
};
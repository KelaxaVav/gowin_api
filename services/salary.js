const { Op } = require("sequelize");
const { Salary, User, Role, Transaction } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const UserService = require("./user");
const { ConvertTime } = require("../utils/utility");
const { v4 } = require('uuid');
const { TRANSACTION_REASONS, TRANSACTION_STATUSES, TRANSACTION_ENTITY_TYPES } = require("../data/constants");

class SalaryService {
    /**
     * 
     * @param {{
     * branch_id:string
     * month:Date
     * date:Date
     * salaries:TSalary[]
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async addBulkSalary({ branch_id, month, date, salaries }, extras) {
        Validation.emptyArrayParameters(salaries);
        Validation.timeParameters([month, date]);
        const yearMonth = ConvertTime.toYearMonth(month);

        await UserService.validateUsersWithBranch(branch_id, salaries);
        await findModelAndThrow({
            [Op.or]: salaries.map(att => ({
                month: yearMonth,
                user_id: att.user_id,
            })),
        }, Salary);

        const salaryData = salaries.map((salary) => {
            const { user_id, amount, note, data } = salary;
            const salary_id = v4();

            Validation.isTrue(amount > 0);

            /** @type {TSalary} */
            const newSalary = {
                salary_id,
                user_id,
                month: yearMonth,
                note,
                data,
                transaction: {
                    branch_id,
                    entity_id: salary_id,
                    entity_type: TRANSACTION_ENTITY_TYPES.SALARY,
                    reason: TRANSACTION_REASONS.SALARY,
                    amount,
                    date,
                    status: TRANSACTION_STATUSES.COMPLETED,
                }
            };

            return newSalary;
        });

        const newSalaries = await Salary.bulkCreate(salaryData, {
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                },
            ],
            transaction: extras.transaction,
        });

        return newSalaries;
    }

    /**
     * 
     * @param {{
     * salary_id:string
     * branch_id:string
     * user_id:string
     * date:Date
     * month:Date
     * amount:number
     * note:string
     * data:Object
     * }} param0 
     * @param {*} extras 
     * @returns 
     */
    static async updateSalary({ salary_id, branch_id, user_id, date, month, amount, note, data }, extras) {
        Validation.nullParameters([amount]);
        Validation.timeParameters([date, month]);
        Validation.isTrue(amount > 0);

        const yearMonth = ConvertTime.toYearMonth(month);

        /** @type {TSalary} */
        const salary = await findModelOrThrow({ salary_id }, Salary, {
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: Transaction,
                    as: 'transaction',
                },
            ],
        });
        Validation.authority(branch_id, salary.user.role.branch_id);

        await UserService.validateUsersWithBranch(branch_id, [{ user_id }]);

        await findModelAndThrow({
            month: yearMonth,
            user_id,
            salary_id: {
                [Op.not]: salary_id,
            },
        }, Salary);

        await salary.transaction.update({
            date,
            amount,
        }, { transaction: extras.transaction });

        await salary.update({
            user_id,
            month: yearMonth,
            note,
            data,
        }, { transaction: extras.transaction });

        delete salary.dataValues.user;

        return salary;
    }

    /**
     * 
     * @param {{
     *  salary_id:string
     *  branch_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteSalary({ salary_id, branch_id }, extras) {
        /** @type {TSalary} */
        const salary = await findModelOrThrow({ salary_id }, Salary, {
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: Transaction,
                    as: 'transaction',
                },
            ],
        });
        Validation.authority(branch_id, salary.user.role.branch_id);

        await salary.transaction.destroy({ transaction: extras.transaction });
        await salary.destroy({ transaction: extras.transaction });
    }
}

module.exports = SalaryService;
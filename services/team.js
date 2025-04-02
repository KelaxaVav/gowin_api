const { Op } = require("sequelize");
const { Team, Staff, Role, Partner } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");
const { ROLES } = require("../data/constants");

class TeamService {
    /**
     * 
     * @param {{
     * name:string
     * branch_id:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createTeam({ name, branch_id, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await Team.create({
            name,
            branch_id,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * team_id:string
    * staff_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
    static async updateTeam({ team_id, staff_id, name, is_active }, extras) {
        Validation.nullParameters([team_id]);

        const team = await findModelOrThrow({ team_id }, Team);

        staff_id && await findModelOrThrow({
            staff_id,
            branch_id: team.branch_id,
            role: ROLES.BRANCH_MANAGER,
        }, Staff, {
            messageOnNotFound: 'Branch manager not found',
        });

        // if (team.staff_id && team.staff_id != staff_id && staff_id) {
        //     const team = await findModelOrThrow({ team_id }, Team, {
        //         include: [
        //             {
        //                 model: Staff,
        //                 as: 'branchManager',
        //                 include: [
        //                     {
        //                         model: Staff,
        //                         as: 'relationshipManagers',
        //                     }
        //                 ]
        //             }
        //         ]
        //     });

        //     k
        // }

        await team.update({
            name,
            staff_id,
            is_active,
        }, { transaction: extras.transaction });

        return team;
    }

    /**
     * 
     * @param {{
    * team_id:string
    * managers:string[]
    * }} param0 
    * @param {Extras} extras
    */
    static async updateBranchManagers({ team_id, managers }, extras) {
        Validation.nullParameters([team_id]);
        Validation.emptyArrayParameters([managers]);

        /**@type {TTeam} */
        const team = await findModelOrThrow({ team_id }, Team, {
            include: [
                {
                    model: Staff,
                    as: 'staffs',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        }
                    ],
                },
            ],
        });

        const staffs = await Staff.findAll({
            where: {
                [Op.or]: managers.map(staff_id => ({
                    staff_id,
                    '$role.name$': ROLES.BRANCH_MANAGER,
                })),
            },
            include: [
                {
                    model: Role,
                    as: 'role',
                },
            ]
        });

        Validation.isTrue(staffs.length == managers.length);

        staffs.forEach(staff => Validation.isTrue(!staff.team_id || staff.team_id == team_id, {
            message: `Staff already mapped to another team`,
            data: staff,
        }));

        const removedManagers = [];
        team.staffs.forEach(staff => {
            if (!managers.includes(staff.staff_id)) {
                removedManagers.push(staff);
            }
        });

        removedManagers.length && await Promise.all(removedManagers
            .map(staff => staff.update({ team_id: null, branch_manager_id: null },
                { transaction: extras.transaction })));

        await Promise.all(staffs.map(staff => staff.update({ team_id },
            { transaction: extras.transaction })));

        await team.reload({ transaction: extras.transaction });

        return team;
    }

    /**
     * 
     * @param {{
     * team_id:string
     * managers:string[]
     * }} param0 
     * @param {Extras} extras
     */
    static async updateRelationshipManagers({ team_id, managers }, extras) {
        Validation.nullParameters([team_id]);
        Validation.emptyArrayParameters([managers]);

        /**@type {TTeam} */
        const team = await findModelOrThrow({ team_id }, Team, {
            include: [
                {
                    model: Staff,
                    as: 'relationshipManagers',
                },
            ],
        });

        const staffs = await Staff.findAll({
            where: {
                [Op.or]: managers.map(staff_id => ({
                    staff_id,
                    role: ROLES.RELATIONSHIP_MANAGER,
                })),
            },
        });

        Validation.isTrue(staffs.length == managers.length);

        staffs.forEach(staff => Validation.isTrue(!staff.branch_manager_id || staff.branch_manager_id == team.staff_id, {
            message: `Staff already mapped to another branch Manager`,
            data: staff.dataValues,
        }));

        const removedManagers = [];
        team.relationshipManagers.forEach(staff => {
            if (!managers.includes(staff.staff_id)) {
                removedManagers.push(staff);
            }
        });

        removedManagers.length && await Promise.all(removedManagers
            .map(staff => staff.update({ team_id: null },
                { transaction: extras.transaction })));

        await Promise.all(staffs.map(staff => staff.update({ team_id },
            { transaction: extras.transaction })));

        await team.reload({ transaction: extras.transaction });

        return team;
    }

    /**
     * 
     * @param {{
     * team_id:string
     * relationship_manager_id:string
     * partners:string[]
     * }} param0 
     * @param {Extras} extras
     */
    static async updatePartners({ team_id, relationship_manager_id, partners }, extras) {
        Validation.nullParameters([team_id, relationship_manager_id]);
        Validation.emptyArrayParameters([partners]);

        /**@type {TTeam} */
        const team = await findModelOrThrow({ team_id }, Team);

        /**@type {TStaff} */
        const staff = await findModelOrThrow({
            branch_id: team.branch_id,
            staff_id: relationship_manager_id,
            role: ROLES.RELATIONSHIP_MANAGER,
        }, Staff, {
            include: [
                {
                    model: Partner,
                    as: 'partners',
                },
            ],
        });

        const findPartners = await Partner.findAll({
            where: {
                [Op.or]: partners.map(partner_id => ({
                    partner_id,
                })),
            },
        });

        Validation.isTrue(findPartners.length == partners.length);

        findPartners.forEach(staff => Validation.isTrue(!staff.staff_id || staff.staff_id == relationship_manager_id, {
            message: `Partner already mapped to another relationship manager`,
            data: staff
        }));

        const removedPartners = [];
        staff.partners.forEach(partner => {
            if (!partners.includes(partner.partner_id)) {
                removedPartners.push(partner);
            }
        });

        removedPartners.length && await Promise.all(removedPartners
            .map(partner => partner.update({ staff_id: null },
                { transaction: extras.transaction })));

        await Promise.all(findPartners.map(partner => partner.update({ staff_id: relationship_manager_id },
            { transaction: extras.transaction })));

        await staff.reload({ transaction: extras.transaction });

        return staff;
    }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteTeam({ team_id }, extras) {
        const team = await findModelOrThrow({ team_id }, Team);

        await team.destroy({ transaction: extras.transaction });
    }
}

module.exports = TeamService;
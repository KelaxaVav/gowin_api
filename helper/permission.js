const parsePermissions = (permissions, initData = {}) => {
    return permissions.reduce((data, permission) => {
        const parts = permission.name.split('_');
        const action = parts.pop();
        const module = parts.join('_');

        if (['CREATE', 'UPDATE', 'VIEW', 'DELETE'].includes(action)) {
            if (data[module]) {
                data[module].actions[action] = {
                    name: permission.name,
                    permission_id: permission.permission_id,
                };
            }
            else {
                data[module] = {
                    name: module,
                    actions: {
                        [action]: {
                            name: permission.name,
                            permission_id: permission.permission_id,
                        },
                    },
                };
            }
        }
        else {

        }

        return data;
    }, { ...initData });
}

module.exports = {
    parsePermissions,
}
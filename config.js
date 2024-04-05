module.exports = {
    client: {
        token: '',
        id: ''
    },
    handler: {
        prefix: '*',
        logChannel: '',
        deploy: true,
        commands: {
            prefix: true,
            slash: true,
            user: true,
            message: true
        },
        mongodb: {
            uri: ''
        }
    }
};

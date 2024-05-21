const { Client, Partials, Collection } = require("discord.js");
const config = require('../../config');
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const mongoose = require("../handlers/mongoose");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

module.exports = class extends Client {
    collection = {
        interactioncommands: new Collection(),
        prefixcommands: new Collection(),
        aliases: new Collection()
    };
    applicationcommandsArray = [];

    constructor() {
        super({
            intents: [
                'Guilds',
                'GuildMessages',
                'GuildMembers',
                'GuildVoiceStates',
                'MessageContent'
            ],
            partials: [
                Partials.Channel,
                Partials.User,
                Partials.Message
            ],
            presence: {
                status: 'idle',
                activities: [{
                    name: 'Observing the Moon',
                    type: 'CUSTOM'
                }]
            }
        });

        this.distube = new DisTube(this, {
            plugins: [new SpotifyPlugin()]
        });
    };

    start = async () => {
        await this.login(process.env.CLIENT_TOKEN || config.client.token);

        commands(this);
        events(this);
        mongoose();

        if (config.handler.deploy) deploy(this, config);
    };
};
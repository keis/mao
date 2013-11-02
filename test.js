var mao = require('./mao'),
    config,
    app,
    ctx;

app = {
    use: function (route, app) {
        console.log('application on ' + route);
        app();
    }
};

config = {
    application: [
        'gris.Storage',
        'fisk',
        {
            name: 'gris',
            route: '/gris'
        }
    ]
};

ctx = mao(config, {app: app, config: {setting: 123}});

ctx.orchestrate()

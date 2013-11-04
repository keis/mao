var Module = require('module'),
    path = require('path'),
    loading = {};

function parseComponent(str) {
    var component = {name: str},
        parts = str.split('.');

    if (parts.length > 1) {
        component.module = parts[0];
        component.attribute = parts.slice(1).join('.');
    }

    return component;
}

function mao(config, context) {
    var parentModule = new Module('mao-context'),
        root = config.path || path.dirname(module.parent.filename),
        application = {},
        self;

    parentModule.paths = module.parent.paths.slice()
    parentModule.paths.unshift(root);

    context = context || {};

    config.application.forEach(function (component) {
        if (typeof component == 'string') {
            component = parseComponent(component);
        }

        application[component.name] = component;
    });

    function loader(target, component, args) {
        var obj = target.exports,
            inst;

        console.log('loader - component', component);
        console.log('loader - args', args);

        if (component.attribute) {
            component.attribute.split('.').forEach(function (k) {
                obj = obj[k];
            });
        }

        if (typeof obj === 'function') {
            inst = Object.create(obj.prototype);
            obj.apply(inst, args);
            return inst;
        }

        if (typeof obj.app === 'function') {
            inst = obj.app.apply(obj, args);
            context.app.use(component.route, inst);
            return inst;
        }

        return target.exports;
    }

    return self = {
        module: parentModule,

        require: function (request) {
            if (context.hasOwnProperty(request)) {
                if (context[request] === loading) {
                    throw new Error('Circular dependency: ' + request);
                }
                return context[request];
            }

            var component = application[request],
                moduleName = component.module || component.name,
                targetPath = Module._resolveFilename(moduleName, parentModule),
                target = new Module(targetPath, parentModule),
                args = [],
                options,
                dependencies;

            target.load(target.id);
            context[request] = loading;

            options = target.orchestration;

            if (options && component.attribute) {
                options = options[component.attribute]
            }

            if (options) {
                dependencies = options.dependencies || [];
                dependencies.forEach(function (dep) {
                    args.push(self.require(dep))
                });
            }

            return context[request] = loader(target, component, args);
        },

        orchestrate: function (callback) {
            Object.keys(application).forEach(function (key) {
                self.require(key);
            });

            process.nextTick(function () {
                callback && callback();
            });
        }
    };
}

module.exports = mao;

module.exports = {
    Storage: function () {
        this.message = 'hello';
    },

    app: function (storage, fisk) {
        return function () {
            console.log(storage.message, fisk.message);
        }
    }
};

module.orchestration = {
    dependencies: ['gris.Storage', 'fisk'],
    Storage: {
        dependencies: ['config']
    }
};

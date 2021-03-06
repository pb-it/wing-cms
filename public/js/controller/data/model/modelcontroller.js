class ModelController {

    static MODELS_IDENT = 'models';

    _configController;

    _models;

    constructor(configController) {
        this._configController = configController;
    }

    async init() {
        this._models = [];
        var url = app.controller.getConfigController().getApiOrigin();
        var infoUrl = url + "/system/info";
        var info = await WebClient.fetchJson(infoUrl);
        var appVersion = app.controller.getVersionController().getAppVersion();
        if (appVersion != info['version'])
            alert('API version does not match client version. Consider updating!')
        var modelsUrl = url + "/models";
        var apiModels = await WebClient.fetchJson(modelsUrl);
        var model;
        for (var data of apiModels) {
            model = new XModel(data);
            model.init();
            this._models.push(model);
        }
        return Promise.resolve();
    }

    isModelDefined(name) {
        for (var model of this._models) {
            if (model.getData().name === name)
                return true;
        }
        return false;
    }

    getModels() {
        return this._models.filter(function (x) { return x.getData()['name'].charAt(0) !== '_' });
    }

    getModel(name) {
        return this._models.filter(function (x) { return x.getData()['name'] === name })[0];
    }
}
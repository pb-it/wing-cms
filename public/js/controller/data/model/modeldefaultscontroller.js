class ModelDefaultsController {

    static DEFAULTS_IDENT = "defaults";
    static SORT_IDENT = "sort";
    static TITLE_IDENT = "title";
    static THUMBNAIL_IDENT = "thumbnail";
    static COLLECTION_MODEL_IDENT = "collectionModel";
    static COLLECTION_MODEL_PROPERTY_IDENT = "collectionModelProperty";
    static COLLECTION_IDENT = "collection";
    static PANEL_TYPE_IDENT = 'paneltype';
    static VIEW_IDENT = 'view';

    _model;

    constructor(model) {
        this._model = model;
    }

    async setDefaults(defaults) {
        var data = this._model.getData();
        data[ModelDefaultsController.DEFAULTS_IDENT] = defaults;
        await this._model.setData(data);
        return Promise.resolve();
    }

    getDefaultSort() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.SORT_IDENT];
        return res;
    }

    async setDefaultSort(sort) {
        var data = this._model.getData();
        var defaults = data[ModelDefaultsController.DEFAULTS_IDENT];
        if (!defaults) {
            defaults = {};
            data[ModelDefaultsController.DEFAULTS_IDENT] = defaults;
        }
        defaults[ModelDefaultsController.SORT_IDENT] = sort;
        await this._model.setData(data);
        return Promise.resolve();
    }

    getDefaultTitleProperty(bFallback = true) {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.TITLE_IDENT];
        if (!res && bFallback) {
            var name;
            var str;
            var attribues = this._model.getModelAttributesController().getAttributes();
            for (var attr of attribues) {
                name = attr['name'];
                str = name.toLowerCase();
                if (str == 'name' || str == 'title') {
                    res = name;
                    break;
                }
            }
        }
        return res;
    }

    getDefaultThumbnailProperty() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.THUMBNAIL_IDENT];
        return res;
    }

    getDefaultCollectionModel() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.COLLECTION_MODEL_IDENT];
        return res;
    }

    getDefaultCollectionModelProperty() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.COLLECTION_MODEL_PROPERTY_IDENT];
        return res;
    }

    getDefaultCollectionProperty() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.COLLECTION_IDENT];
        return res;
    }

    getDefaultPanelName() {
        var res;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            res = defaults[ModelDefaultsController.PANEL_TYPE_IDENT];
        return res;
    }

    getDefaultPanelConfig() {
        var config;
        var defaults = this._model.getData()[ModelDefaultsController.DEFAULTS_IDENT];
        if (defaults)
            config = defaults[ModelDefaultsController.VIEW_IDENT];
        return config;
    }

    async setDefaultPanelConfig(config) {
        var data = this._model.getData();
        var defaults = data[ModelDefaultsController.DEFAULTS_IDENT];
        if (!defaults) {
            defaults = {};
            data[ModelDefaultsController.DEFAULTS_IDENT] = defaults;
        }
        defaults[ModelDefaultsController.VIEW_IDENT] = config;
        await this._model.setData(data);
        return Promise.resolve();
    }
}
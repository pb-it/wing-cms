class EditViewPanel extends TabPanel {

    static getPanelViewForm(data) {
        var skeleton = [
            {
                name: 'paneltype',
                label: 'panelType',
                dataType: 'enumeration',
                options: [{ 'value': 'CrudPanel' }, { 'value': 'MediaPanel' }, { 'value': 'CollectionPanel' }, { 'value': 'NotePanel' }, { 'value': 'WikiPanel' }],
                view: 'select'
            },
            {
                name: "details",
                dataType: "enumeration",
                options: [{ 'value': 'none' }, { 'value': 'title' }, { 'value': 'all' }],
                view: 'select'
            },
            {
                name: "display",
                dataType: "enumeration",
                options: [{ 'value': 'block' }, { 'value': 'inline-block' }],
                view: 'select'
            },
            {
                name: "float",
                dataType: "enumeration",
                options: [{ 'value': 'none' }, { 'value': 'left' }],
                view: 'select'
            }
        ];
        return new Form(skeleton, data);
    }

    static getThumbnailViewForm(data) {
        var skeleton = [
            {
                name: "format",
                dataType: "enumeration",
                options: [{ 'value': 'custom' }, { 'value': '16/9' }, { 'value': '4/3' }],
                view: 'select'
            },
            {
                name: "width",
                dataType: "integer"
            },
            {
                name: "height",
                dataType: "integer"
            },
            {
                name: "autoplay",
                dataType: "boolean"
            }
        ];
        return new Form(skeleton, data);
    }

    _model;

    _$viewPanel;
    _$jsonPanel;

    _thumbnailViewForm;
    _panelViewForm;

    _jsonForm;

    constructor(config, model) {
        super(config);

        this._model = model;
    }

    async _init() {
        await super._init();

        this._$viewPanel = await this._createViewPanel();
        this._panels.push(this._$viewPanel);

        if (app.controller.isInDebugMode()) {
            this._$jsonPanel = await this._createJsonPanel();
            this._panels.push(this._$jsonPanel);
        }

        await this.openTab(this._$viewPanel);

        return Promise.resolve();
    }

    async _createViewPanel() {
        var panel = new Panel({ 'title': 'View' });
        panel._renderContent = async function () {
            var $div = $('<div/>')
                .css({ 'padding': '10' });

            var state = app.controller.getStateController().getState();
            var mpcc = this._model.getModelPanelConfigController();

            var panelConfig;
            if (state.panelConfig)
                panelConfig = state.panelConfig;
            else
                panelConfig = mpcc.getPanelConfig(state.action);
            var Cp = panelConfig.getPanelClass();

            if (panelConfig.details) {
                switch (panelConfig.details) {
                    case DetailsEnum.none:
                        panelConfig.details = "none";
                        break;
                    case DetailsEnum.title:
                        panelConfig.details = "title";
                        break;
                    case DetailsEnum.all:
                        panelConfig.details = "all";
                        break;
                    default:
                }
            }

            this._panelViewForm = EditViewPanel.getPanelViewForm(panelConfig);
            var $form = await this._panelViewForm.renderForm();
            $div.append($form);
            $div.append('<br/>');

            if (true || Cp == MediaPanel) {
                this._thumbnailViewForm = EditViewPanel.getThumbnailViewForm(panelConfig);
                $form = await this._thumbnailViewForm.renderForm();
                $div.append($form);
                $div.append('<br/>');
            }

            $div.append($('<button/>')
                .html("Set as default")
                .click(async function (event) {
                    event.stopPropagation();

                    var data = await this._read();

                    try {
                        await this._model.getModelDefaultsController().setDefaultPanelConfig(data);
                    } catch (error) {
                        app.controller.showError(error);
                    }
                    return Promise.resolve();
                }.bind(this))
            );
            $div.append($('<button/>')
                .css({ 'float': 'right' })
                .text("Apply")
                .click(async function (event) {
                    event.preventDefault();

                    var data = await this._read();

                    var state = app.controller.getStateController().getState();

                    var panelConfig = new MediaPanelConfig();
                    panelConfig.init(this._model, state.action, data);

                    state.panelConfig = panelConfig;
                    //app.controller.updateCanvas();
                    app.controller.loadState(state, true);

                    this.dispose();
                    return Promise.resolve();
                }.bind(this)));
            return Promise.resolve($div);
        }.bind(this);

        return Promise.resolve(panel);
    }

    async _read() {
        var data;
        if (this._thumbnailViewForm)
            data = { ...await this._panelViewForm.readForm(), ...await this._thumbnailViewForm.readForm() };
        else
            data = await this._panelViewForm.readForm();

        switch (data.format) {
            case "16/9":
                if (data.height && !data.width)
                    data.width = data.height / 9 * 16;
                else if (data.width)
                    data.height = data.width / 16 * 9;
                break;
            case "4/3":
                if (data.height && !data.width)
                    data.width = data.height / 3 * 4;
                else if (data.width)
                    data.height = data.width / 4 * 3;
                break;
            default:
        }
        if (data.details == true)
            data.details = DetailsEnum.all;

        return Promise.resolve(data);
    }

    async _createJsonPanel() {
        var panel = new Dialog({ 'title': 'JSON' });
        panel._renderDialog = async function () {
            var $div = $('<div/>')
                .css({ 'padding': '10' });

            var skeleton = [
                { name: "json", dataType: "json" }
            ];
            var data = { "json": JSON.stringify(await this._read(), null, '\t') };

            this._jsonForm = new Form(skeleton, data);
            var $form = await this._jsonForm.renderForm();

            $div.append($form);
            return Promise.resolve($div);
        }.bind(this);
        panel.setApplyAction(async function () {
            var fData = await this._jsonForm.readForm();
            var pc = JSON.parse(fData['json']);

            var state = app.controller.getStateController().getState();

            var panelConfig = new MediaPanelConfig();
            panelConfig.init(this._model, null, pc);

            state.panelConfig = panelConfig;
            //app.controller.updateCanvas();
            app.controller.loadState(state, true);

            this.dispose();
            return Promise.resolve(true);
        }.bind(this));

        return Promise.resolve(panel);
    }
}
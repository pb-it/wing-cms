class Controller {

    _model;
    _view;

    _logger;

    _configController;
    _stateController;

    _bLoading = false;
    _selected;

    _dataservice;

    _data;

    _modelController;
    _profileController;
    _bookmarkController;

    _panelController;
    _modalController;

    constructor(model, view) {
        this._model = model;
        this._view = view;

        this._selected = [];
    }

    getLogger() {
        return this._logger;
    }

    getView() {
        return this._view;
    }

    getConfigController() {
        return this._configController;
    }

    getStateController() {
        return this._stateController;
    }

    getModelController() {
        return this._modelController;
    }

    getProfileController() {
        return this._profileController;
    }

    getBookmarkController() {
        return this._bookmarkController;
    }

    getDataService() {
        return this._dataservice;
    }

    getPanelController() {
        return this._panelController;
    }

    getModalController() {
        return this._modalController;
    }

    async initController() {
        var bInitDone = false;
        this.setLoadingState(true);

        this._configController = new ConfigController();
        await this._configController.initConfigController();

        this._logger = new Logger();

        this._stateController = new StateController();
        this._view.init(); //TODO: untidy/unlovely that view depends on parsed state

        this._panelController = new PanelController();
        this._modalController = new ModalController();

        try {
            this._modelController = new ModelController(this._configController);
            await this._modelController.init();

            this._dataservice = new DataService();

            this._profileController = new ProfileController();
            await this._profileController.init();

            this._bookmarkController = new BookmarkController();
            await this._bookmarkController.init();

            bInitDone = true;
        } catch (error) {
            this.showError(error, "Connection to API failed");
        } finally {
            this.setLoadingState(false);
        }
        return Promise.resolve(bInitDone);
    }

    async loadState(state, push, replace) {
        this._data = null;
        try {
            this._modalController.closeAll();

            this.setLoadingState(true);

            this._stateController.setState(state, push, replace);
            this.clearSelected();
            this._view.init();

            var typeString;
            var bSpecial = false;
            if (state) {
                typeString = state.typeString;
                if (typeString) {
                    var mc = app.controller.getModelController();
                    if (mc.isModelDefined(typeString)) {
                        var action = state.action;
                        if (!action || action != ActionEnum.create)
                            this._data = await this._dataservice.fetchDataByState(state);
                    } else {
                        bSpecial = true;
                        throw new Error("Unknown model '" + typeString + "'");
                    }
                }
            }
            if (typeString) {
                if (!bSpecial)
                    await this.updateCanvas();
            } else {
                var homePanels = [];
                /*var panel = new Panel();
                panel.setContent(`TODO:<br/>
                Allow customizing 'Home' page with panels/shortcuts - see following panels for examles`);
                homePanels.push(panel);

                panel = new Panel();
                panel.setContent(`common tasks:<br/>
                <a href="#" onclick=\"event.stopPropagation();ModelSelect.openCreateModelModal();return false;\">create model</a><br/>...`);
                homePanels.push(panel);

                panel = new Panel();
                panel.setContent(`recently created models/entries:</br>...`);
                homePanels.push(panel);

                panel = new Panel();
                panel.setContent(`recently / most used / favourite states:</br>...`);
                homePanels.push(panel);*/

                await this._view.getCanvas().showPanels(homePanels);
            }
        } catch (error) {
            this.showError(error);
        } finally {
            state.bIgnoreCache = false;
            this.setLoadingState(false);
        }
    }

    showError(error, msg) {
        if (!msg) {
            if (error.status && error.statusText) {
                if (error.response)
                    msg = error.status + ": " + error.response;
                else
                    msg = error.status + ": " + error.statusText;
            } else if (error.message)
                msg = error.message;
            else
                msg = "An error has occurred";
        }

        console.log(error);
        this.showErrorMessage(msg);
    }

    showErrorMessage(msg) {
        alert(msg);
    }

    async updateCanvas() {
        var state = this._stateController.getState();
        await this._view.getCanvas().showData(this._data, state.typeString, state.action);
        return Promise.resolve();
    }

    async select(ctrl, shift, panel) {
        if (ctrl == true) {
            if (panel.isSelected()) {
                this._selected.splice(this._selected.indexOf(panel), 1);
                await panel.select(false);
            } else {
                this._selected.push(panel);
                await panel.select(true);
            }
        } else if (shift == true) {
            var last = this._selected[this._selected.length - 1];
            this._selected = [];
            var panels = this._view.getCanvas().getPanels();
            var p;
            var bSelect = false;
            var bSecondMatch = false;
            for (var i = 0; i < panels.length; i++) {
                p = panels[i];
                if (!bSecondMatch && (p == last || p == panel)) {
                    if (bSelect)
                        bSecondMatch = true;
                    else
                        bSelect = true;
                }

                if (bSelect)
                    this._selected.push(p);
                if (p.isSelected() != bSelect)
                    await p.select(bSelect);

                if (bSelect && bSecondMatch)
                    bSelect = false;
            }
        } else {
            await this.clearSelected();
            this._selected.push(panel);
            await panel.select(true);
        }
        return Promise.resolve();
    }

    async clearSelected() {
        var item;
        for (var i = 0; i < this._selected.length; i++) {
            item = this._selected[i];
            await item.select(false);
        }
        this._selected = [];
        return Promise.resolve();
    }

    async selectAll() {
        this._selected = [];
        var item;
        var panels = this._view.getCanvas().getPanels();
        for (var i = 0; i < panels.length; i++) {
            item = panels[i];
            await item.select(true);
            this._selected.push(item);
        }
        return Promise.resolve();
    }

    getSelected() {
        return this._selected;
    }

    getSelectedObjects() {
        var items;
        if (this._selected.length > 0) {
            items = this._selected.map(function (panel) {
                return panel.getObject();
            });
        }
        return items;
    }

    setLoadingState(b) {
        var changed = false;
        if (this._bLoading != b) {
            if (b) {
                document.body.style.cursor = 'wait';
                Overlay.open();
                this._bLoading = true;
            } else {
                Overlay.close();
                document.body.style.cursor = 'default';
                this._bLoading = false;
            }
            changed = true;
        }
        return changed;
    }

    async restartApi() {
        this.setLoadingState(true);
        var api = this._configController.getApi();
        var url = api.substring(0, api.length - 3) + "system/restart";
        await Ajax.request("GET", url);
        //TODO: sleep?
        this.setLoadingState(false);
        return Promise.resolve();
    }

    async reloadModels() {
        this.setLoadingState(true);
        var api = this._configController.getApi();
        var url = api.substring(0, api.length - 3) + "system/reload";
        await Ajax.request("GET", url);
        this.setLoadingState(false);
        return Promise.resolve();
    }

    reload() {
        this.setLoadingState(true);
        location.reload();
    }
}
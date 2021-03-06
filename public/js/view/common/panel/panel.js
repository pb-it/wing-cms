class Panel {

    _config;

    _bRendered;

    _$panel;
    _$content;

    constructor(config) {
        this._config = config;

        this._bRendered = false;

        this._$panel = $('<div/>')
            .addClass('panel')
            .hide();
    }

    getClass() {
        return Panel;
    }

    getConfig() {
        return this._config;
    }

    setContent(content) {
        this._$content = content;
    }

    /**
    * Function which renders the panel
    * @return   {jQuery object}         Panel
    */
    async render() {
        this._$panel.hide();
        this._$panel.empty();

        await this._init();

        try {
            var content = await this._renderContent();
            this._$panel.append(content);
        } catch (error) {
            app.controller.showError(error, "Rendering panel failed");
        }

        await this._teardown();

        this._$panel.show();
        return Promise.resolve(this._$panel);
    }

    async _init() {
        if (this._config) {
            if (this._config.display) {
                this._$panel.css({ 'display': this._config.display });
            } else
                this._$panel.css({ 'display': 'block' }); //block is default because of collection

            if (this._config.float && this._config.float === 'left') {
                this._$panel.css({ 'float': 'left' });
            } else {
                //this._$panel.css({ 'float': 'none' });
                this._$panel.css({ 'clear': 'both' });
            }

            /*if (this._config.width)
                this._$panel.css({ "width": this._config.width })
            if (this._config.height)
                this._$panel.css({ "height": this._config.height })*/
            if (this._config.minWidth)
                this._$panel.css({ 'min-width': this._config.minWidth })
        }
        return Promise.resolve();
    }

    async _renderContent() {
        return Promise.resolve(this._$content);
    }

    async _teardown() {
        this._bRendered = true;
        return Promise.resolve();
    }

    /**
     * Modal listens on dispose of its content
     */
    dispose() {
        this._$panel.trigger("dispose");
    }
}
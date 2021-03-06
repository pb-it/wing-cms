class Breadcrumb {

    _$breadcrumb;

    constructor() {
    }

    initBreadcrumb() {
        this._$breadcrumb = $('<div/>')
            .css({ 'float': 'left' });

        return this._$breadcrumb;
    }

    renderBreadcrumb() {
        this._$breadcrumb.empty();

        var state = app.controller.getStateController().getState();

        var stateName;
        if (state && state.typeString) {
            stateName = state.typeString;
            if (state.name || state.where) {
                var str;
                if (state.name)
                    str = state.name;
                else
                    str = 'undefined';
                if (state.where)
                    str += ':' + state.where;
                stateName += '(' + str + ')';
            }
        }

        //TODO: show state.limit

        if (stateName) {
            this._renderModelMenu(stateName);
            this._renderModelIconBar();

            if (state.id)
                this._renderId(state.id);

            if (state.filters && state.filters.length > 0)
                this._renderFilters(state.filters);

            this._renderFilterIconBar();
        }
    }

    _renderModelMenu(name) {
        var conf = {
            'icon': "map-marker",
            'name': name,
            'root': true
        };
        var menuItem = new MenuItem(conf);

        var subMenuGroup = new SubMenuGroup('down', 'left');

        conf = {
            'icon': "edit",
            'name': "Edit",
            'click': async function (event) {
                return app.controller.getModalController().openPanelInModal(new CrudStatePanel(ActionEnum.update, app.controller.getStateController().getState()));
            }
        };
        subMenuGroup.addMenuItem(new MenuItem(conf));

        conf = {
            'icon': "remove",
            'name': "Remove",
            'click': function (event) {
                app.controller.loadState(new State(), true);
            }
        };
        subMenuGroup.addMenuItem(new MenuItem(conf));

        menuItem.addSubMenuGroup(subMenuGroup);
        var $div = menuItem.renderMenuItem();
        $div.css({ 'margin': '0 1 0 0' });

        this._$breadcrumb.append($div);
    }

    _renderModelIconBar() {
        var state = app.controller.getStateController().getState();
        if (!state.action || state.action == ActionEnum.read) {
            var $div = $('<div/>')
                .css({
                    'display': 'inline-block',
                    'vertical-align': 'top'
                });

            var conf = {
                'icon': "plus",
                'root': true,
                'click': async function (event, icon) {
                    var state = new State();
                    state.typeString = app.controller.getStateController().getState().typeString;
                    state.action = ActionEnum.create;
                    app.controller.loadState(state, true);
                }.bind(this)
            };
            var $d = new MenuItem(conf).renderMenuItem();
            $d.css({ 'margin': '0 1 0 1' });
            $div.append($d);

            this._$breadcrumb.append($div);
        }
    }

    _renderFilterIconBar() {
        var state = app.controller.getStateController().getState();
        if (!state.action || state.action == ActionEnum.read || state.action == ActionEnum.update) {
            var $div = $('<div/>')
                .css({
                    'display': 'inline-block',
                    'vertical-align': 'top'
                });

            var conf = {
                'icon': "filter",
                'root': true,
                'click': async function (event, icon) {
                    var panel = new SelectFilterPanel(app.controller.getStateController().getState().typeString);
                    panel.setApplyAction(function (data) {
                        var filters = this.getSelected();
                        if (filters) {
                            var f;
                            if (state.filters)
                                f = state.filters;
                            else
                                f = [];
                            for (var filter of filters) {
                                f.push(filter);
                            }
                            state.filters = f;
                        }
                        panel.dispose();
                        return app.controller.loadState(state, true);
                    }.bind(panel));
                    return app.controller.getModalController().openPanelInModal(panel);
                }.bind(this)
            };
            var $d = new MenuItem(conf).renderMenuItem();
            $d.css({ 'margin': '0 1 0 1' });
            $div.append($d);

            conf = {
                'icon': "sort",
                'root': true,
                'click': async function (event, icon) {
                    event.preventDefault();

                    return app.controller.getModalController().openPanelInModal(new EditSortPanel());
                }.bind(this)
            };
            $d = new MenuItem(conf).renderMenuItem();
            $d.css({ 'margin': '0 1 0 1' });
            $div.append($d);

            conf = {
                'icon': "th",
                'root': true,
                'click': async function (event, icon) {
                    event.preventDefault();

                    var model = app.controller.getStateController().getState().getModel();
                    return app.controller.getModalController().openPanelInModal(new EditViewPanel(null, model));
                }.bind(this)
            };
            $d = new MenuItem(conf).renderMenuItem();
            $d.css({ 'margin': '0 1 0 1' });
            $div.append($d);

            this._$breadcrumb.append($div);
        }
    }

    _renderId(id) {
        var $button = $('<button/>')
            .text('id:' + id)
            .css({ 'margin': '0 1 0 1' })
            .click(function (event) {
                event.stopPropagation();
                var state = app.controller.getStateController().getState();
                delete state.id;
                app.controller.loadState(state, true);
            });
        this._$breadcrumb.append($button);
    }

    _renderFilters(filters) {
        var name;
        var conf;
        var menuItem;
        var subMenuGroup;
        for (let filter of filters) {
            if (filter.name)
                name = filter.name;
            else
                name = "undefined";

            conf = {
                'name': name,
                'root': true
            };
            menuItem = new MenuItem(conf);

            subMenuGroup = new SubMenuGroup('down', 'left');

            conf = {
                'icon': "edit",
                'name': "Edit",
                'click': async function (event) {
                    return app.controller.getModalController().openPanelInModal(new CreateFilterPanel(app.controller.getStateController().getState().getModel(), filter));
                }
            };
            subMenuGroup.addMenuItem(new MenuItem(conf));

            conf = {
                'icon': "remove",
                'name': "Remove",
                'click': function (event) {
                    var state = app.controller.getStateController().getState();
                    state.filters = state.filters.filter(function (x) { return x != filter; });
                    app.controller.loadState(state, true);
                }
            };
            subMenuGroup.addMenuItem(new MenuItem(conf));

            menuItem.addSubMenuGroup(subMenuGroup);
            var $div = menuItem.renderMenuItem();
            $div.css({ 'margin': '0 1 0 1' });

            this._$breadcrumb.append($div);
        }
    }
}
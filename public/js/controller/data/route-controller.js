class RouteController {

    static CONFIG_ROUTES_IDENT = 'routes';

    _url;
    _routes;

    constructor() {
    }

    async init() {
        var api = app.controller.getConfigController().getApi();
        this._url = api.substring(0, api.length - 3) + "routes";
        this._routes = await WebClient.fetchJson(this._url);
        return Promise.resolve();
    }

    async setRoutes(routes) {
        this._routes = routes;
        return WebClient.request("PUT", this._url, this._routes);
    }

    getRoutes() {
        return this._routes;
    }

    getRoute(name) {
        var res;
        if (this._routes)
            res = this._routes.filter(function (x) { return x.name === name })[0];
        return res;
    }
}
const FilterEnum = Object.freeze({ "equals": 1, "contains": 2 });

class Filter {

    static replaceType(type, str) {
        var path;
        var index = str.indexOf('.');
        if (index >= 0) {
            var typeString = str.substring(0, index);
            if (typeString == "$")
                path = str;
            else if (typeString == type)
                path = "$." + str.substring(index + 1);
        }
        return path;
    }

    static filterStr(items, str) {
        var filtered_items;
        if (items) {
            var state = app.controller.getStateController().getState();
            var path = Filter.replaceType(state.typeString, str)
            if (path) {
                filtered_items = jPath(items, path);
            } else {
                if (state.typeString) {
                    var model = app.controller.getModelController().getModel(state.typeString);
                    var prop = model.getModelDefaultsController().getDefaultTitleProperty();
                    if (prop) {
                        var obj = {};
                        obj[prop] = str;
                        filtered_items = Filter.filterString(items, obj, prop, FilterEnum.contains);
                    } else {
                        var name = Filter.filterString(items, { name: str }, "name", FilterEnum.contains);
                        var title = Filter.filterString(items, { title: str }, "title", FilterEnum.contains);
                        var comment = Filter.filterString(items, { comment: str }, "comment", FilterEnum.contains);
                        filtered_items = [...new Set([...name, ...title, ...comment])];
                    }
                }
            }
        }
        return filtered_items;
    }

    static filterObj(items, obj) {
        var filtered_items = items;

        var skeleton = obj.getSkeleton();
        var data = obj.getData();

        var field;
        var name;

        for (var i = 0; i < skeleton.length; i++) {
            field = skeleton[i];
            name = field.name;
            if (field['dataType']) {
                switch (field['dataType']) {
                    case "boolean":
                        filtered_items = Filter.filterBoolean(filtered_items, data, name);
                        break;
                    case "integer":
                    case "decimal":
                    case "double":
                        filtered_items = Filter.filterNumber(filtered_items, data, name);
                        break;
                    case "datetime":
                    case "string":
                    case "url":
                    case "text":
                        filtered_items = Filter.filterString(filtered_items, data, name, FilterEnum.contains);
                        break;
                    case "enumeration":
                        filtered_items = Filter.filterString(filtered_items, data, name, FilterEnum.equals);
                        break;
                    case "relation":
                        if (field.multiple)
                            filtered_items = Filter.filterArray(filtered_items, data, name);
                        else
                            filtered_items = Filter.filterObject(filtered_items, data, name);
                        break;
                    default:
                }
            }
        }
        return filtered_items;
    }

    static filterBoolean(items, config, propertyName) {
        var filtered;
        var val = config[propertyName];
        if (val != null) {
            filtered = [];
            if (val) {
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item[propertyName]) {
                        filtered.push(item);
                    }
                }
            } else
                filtered = items;
        } else
            filtered = items;
        return filtered;
    }

    static filterNumber(items, config, propertyName) {
        var filtered;
        var str = config[propertyName];
        if (str) {
            filtered = [];
            if (str == "<defined>") {
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item[propertyName]) {
                        filtered.push(item);
                    }
                }
            } else if (str == "<undefined>") {
                filtered = [];
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (!item[propertyName]) {
                        filtered.push(item);
                    }
                }
            } else if (str.includes("-")) {
                var parts = str.split("-");
                if (parts.length == 2) {
                    var min = parseInt(parts[0], 10);
                    var max = parseInt(parts[1], 10);
                    var item;
                    var act;
                    for (var i = 0; i < items.length; i++) {
                        item = items[i];
                        act = item[propertyName];
                        if (act && act >= min && act <= max) {
                            filtered.push(item);
                        }
                    }
                }
            } else if (str.includes("<")) {
                var eq;
                if (str.includes("=")) {
                    eq = true;
                    parts = str.split("=");
                } else {
                    eq = false;
                    parts = str.split("<");
                }
                if (parts.length == 2) {
                    var val = parseInt(parts[1], 10);
                    var item;
                    var act;
                    for (var i = 0; i < items.length; i++) {
                        item = items[i];
                        act = item[propertyName];
                        if (act && (act < val || (eq && act == val))) {
                            filtered.push(item);
                        }
                    }
                }
            } else if (str.includes(">")) {
                var eq;
                if (str.includes("=")) {
                    eq = true;
                    parts = str.split("=");
                } else {
                    eq = false;
                    parts = str.split(">");
                }
                if (parts.length == 2) {
                    var val = parseInt(parts[1], 10);
                    var item;
                    var act;
                    for (var i = 0; i < items.length; i++) {
                        item = items[i];
                        act = item[propertyName];
                        if (act && (act > val || (eq && act == val))) {
                            filtered.push(item);
                        }
                    }
                }
            } else {
                var search = parseInt(str, 10);
                var item;
                var act;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    act = item[propertyName];
                    if (act && act == search) {
                        filtered.push(item);
                    }
                }
            }
        } else
            filtered = items;
        return filtered;
    }

    static filterString(items, config, propertyName, filter) {
        var filtered;
        var str = config[propertyName];
        if (str) {
            if (str == "<defined>") {
                filtered = [];
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item[propertyName]) {
                        filtered.push(item);
                    }
                }
            } else if (str == "<undefined>") {
                filtered = [];
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    if (!item[propertyName]) {
                        filtered.push(item);
                    }
                }
            } else if (str !== "") {
                filtered = [];
                var item;
                var act;
                switch (filter) {
                    case FilterEnum.equals:
                        for (var i = 0; i < items.length; i++) {
                            item = items[i];
                            act = item[propertyName];
                            if (act && act == str) {
                                filtered.push(item);
                            }
                        }
                        break;
                    case FilterEnum.contains:
                        if (str.startsWith("^")) {
                            var start = str.substring(1).toLowerCase();
                            for (var i = 0; i < items.length; i++) {
                                item = items[i];
                                act = item[propertyName];
                                if (act && act.toLowerCase().startsWith(start)) {
                                    filtered.push(item);
                                }
                            }
                        } else {
                            str = str.toLowerCase();
                            if (str.startsWith("\"") && str.endsWith("\"")) {
                                str = str.substring(1, str.length - 1);
                                for (var i = 0; i < items.length; i++) {
                                    item = items[i];
                                    act = item[propertyName];
                                    if (act && act.toLowerCase().indexOf(str) > -1) {
                                        filtered.push(item);
                                    }
                                }
                            } else {
                                var parts = str.split(/\s+/);
                                var bMatch;
                                for (var i = 0; i < items.length; i++) {
                                    item = items[i];
                                    act = item[propertyName];
                                    if (act) {
                                        act = act.toLowerCase();
                                        bMatch = true;
                                        for (var str of parts) {
                                            if (act.indexOf(str) == -1) {
                                                bMatch = false;
                                                break;
                                            }
                                        }
                                        if (bMatch)
                                            filtered.push(item);
                                    }
                                }
                            }
                        }
                }
            } else
                filtered = items;
        } else
            filtered = items;
        return filtered;
    }

    static filterObject(items, config, propertyName) {
        var filtered;
        var obj = config[propertyName];
        if (obj) {
            filtered = [];
            var item;
            var act;
            for (var i = 0; i < items.length; i++) {
                item = items[i];
                act = item[propertyName];
                if (act && act.id == obj.id) {
                    filtered.push(item);
                }
            }
        } else
            filtered = items;
        return filtered;
    }

    static filterArray(items, config, propertyName) {
        var filtered;
        var arr = config[propertyName];
        if (arr && arr.length > 0) {
            filtered = [];
            var item;
            var search;
            var ok;
            for (var i = 0; i < items.length; i++) {
                item = items[i];
                //console.log(obj.id);
                ok = true;
                for (var j = 0; j < arr.length; j++) {
                    search = arr[j];
                    ok = Filter.contains(item[propertyName], search);
                    if (!ok) break;
                }
                if (ok) filtered.push(item);
            }
        } else
            filtered = items;
        return filtered;
    }

    static contains(arr, needle) {
        var item;
        var found = false;
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                item = arr[i];
                if (item.id === needle.id) {
                    found = true;
                    break;
                }
            }
        }
        return found;
    }
}

class ModalController {

    static async changeIds(obj, property, addIds, removeIds) {
        var oldList;
        var data = obj.getData()[property];
        if (data) {
            oldList = data.map(function (x) {
                return x.id;
            });
        } else
            oldList = [];

        var newList;
        var changed = false;
        if (removeIds) {
            newList = [];
            for (var id of oldList) {
                if (removeIds.indexOf(id) == -1)
                    newList.push(id);
                else
                    changed = true;
            }
        } else
            newList = oldList;
        for (var newId of addIds) {
            if (newList.indexOf(newId) == -1) {
                newList.push(newId);
                changed = true;
            }
        }
        if (changed) {
            var data = {};
            data[property] = newList;
            await obj.update(data);
        }
        return Promise.resolve();
    }

    _stack;

    constructor() {
        this._stack = [];
    }

    isModalOpen() {
        return this._stack.length > 0;
    }

    addModal() {
        var modal = new Modal();
        modal.setCloseCallback(function (data) {
            this._stack.pop();
        }.bind(this));
        this._stack.push(modal);
        return modal;
    }

    closeAll() {
        var modal;
        while (this._stack.length > 0) {
            modal = this._stack.pop();
            modal.close();
        }
    }

    async openPanelInModal(panel) {
        app.controller.setLoadingState(true);
        var modal = this.addModal();

        try {
            await modal.openPanel(panel);
        } catch (error) {
            app.controller.showError(error);
        }

        app.controller.setLoadingState(false);
        return Promise.resolve();
    }

    async openConfirmModal(msg, callback) {
        var modal = app.controller.getModalController().addModal();



        var $d = $('<div/>')
            .html("<br/>" + msg + "<br/><br/>");

        $d.append($('<button/>')
            .text("No")
            .click(async function (event) {
                event.preventDefault();
                callback(false);
                modal.close();
            }.bind(this)));

        $d.append(SPACE);

        $d.append($('<button/>')
            .text("Yes")
            .css({ 'float': 'right' })
            .click(async function (event) {
                event.preventDefault();
                callback(true);
                modal.close();
            }.bind(this)));

        modal.open($d);
        return Promise.resolve();
    }
}
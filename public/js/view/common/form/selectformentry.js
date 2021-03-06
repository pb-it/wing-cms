class SelectFormEntry extends FormEntry {

    _select;
    _value;

    constructor(form, attribute) {
        super(form, attribute);
    }

    async renderValue(value) {
        var $div = $('<div/>').addClass('value');

        if (this._attribute['readonly']) {
            this._value = value;
            $div.append(JSON.stringify(value)); //TODO: reuse rendering of select from dataview
        } else {
            this._select = new Select(this._id, this._attribute['model'], this._form.getCallback());

            if (value) {
                if (!this._attribute['multiple'])
                    value = [value];
            } else
                value = [];

            await this._select.initSelect(null, value);
            $div.append(await this._select.render());
        }

        return Promise.resolve($div);
    }

    async readValue() {
        var data;
        if (this._attribute['readonly']) {
            data = this._value;
        } else if (this._select) {
            var selected = this._select.getSelectedIds();
            if (selected) {
                if (this._attribute['multiple'])
                    data = selected;
                else {
                    if (selected.length > 0)
                        data = selected[0];
                }
            }
        }
        return Promise.resolve(data);
    }
}
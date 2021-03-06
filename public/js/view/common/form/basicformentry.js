class BasicFormEntry extends FormEntry {

    _$input;

    constructor(form, attribute) {
        super(form, attribute);
    }

    getInput() {
        return this._$input;
    }

    async renderValue(value) {
        var name = this._attribute.name;

        var size;

        if (this._attribute['dataType']) {
            if (!value) {
                if (this._attribute.hasOwnProperty('defaultValue'))
                    value = this._attribute['defaultValue'];
                else
                    value = '';
            }

            switch (this._attribute['dataType']) {
                case "boolean":
                    if (this._attribute['required'] && (value === true || value === false)) {
                        this._$input = $('<fieldset/>')
                            .css({
                                'border': 0,
                                'padding': 0
                            });
                        this._$input.append($('<input/>')
                            .attr('type', 'checkbox')
                            .attr('name', name)
                            .attr('id', this._id)
                            .prop('checked', (value == true)));
                        if (this._attribute['view'] === 'labelRight') {
                            var $label = $('<label/>')
                                .attr('for', this._id)
                                .text(' ' + this.getLabel());
                            this._$input.append($label);
                        }
                    } else {
                        this._$input = $('<select/>')
                            .attr('name', name)
                            .attr('id', this._id);

                        var $option = $('<option/>', { value: '' }).text('undefined');
                        if (this._attribute.required)
                            $option.attr('hidden', true);
                        if (value === '')
                            $option.prop('selected', true);
                        this._$input.append($option);

                        $option = $('<option/>', { value: 'true' }).text('true');
                        if (value === true)
                            $option.prop('selected', true);
                        this._$input.append($option);

                        $option = $('<option/>', { value: 'false' }).text('false');
                        if (value === false)
                            $option.prop('selected', true);
                        this._$input.append($option);
                    }
                    break;
                case "integer":
                case "decimal":
                case "double":
                    if (this._attribute.size)
                        size = this._attribute.size
                    else
                        size = "10";

                    this._$input = $('<input/>')
                        .attr('type', 'text')
                        .attr('size', size)
                        .attr('name', name)
                        .attr('id', this._id)
                        .val(value);
                    break;
                case "date":
                    if (this._attribute.size)
                        size = this._attribute.size
                    else
                        size = "25";

                    if (value) {
                        var index = value.indexOf('T');
                        if (index >= 0)
                            value = value.substring(0, index);
                    }

                    this._$input = $('<input/>')
                        .attr('size', size)
                        .attr('name', name)
                        .attr('id', this._id)
                        .val(value);
                    this._$input.datepicker({
                        dateFormat: "yy-mm-dd"
                    }); // ISO_8601
                    //$input.datepicker($.datepicker.regional["de"]);
                    break;
                case "datetime":
                case "timestamp":
                    if (this._attribute.size)
                        size = this._attribute.size
                    else
                        size = "25";

                    this._$input = $('<input/>')
                        .attr('size', size)
                        .attr('name', name)
                        .attr('id', this._id)
                        .val(value);
                    this._$input.datetimepicker({
                        dateFormat: 'yy-mm-dd',
                        timeFormat: 'HH:mm:ss'
                    });
                    break;
                case "time":
                    if (this._attribute.size)
                        size = this._attribute.size
                    else
                        size = "25";

                    this._$input = $('<input/>')
                        .attr('size', size)
                        .attr('name', name)
                        .attr('id', this._id)
                        .val(value);
                    this._$input.timepicker();
                    break;
                case "string":
                case "url":
                    if (this._attribute.size)
                        size = this._attribute.size
                    else
                        size = "100";

                    this._$input = $('<input/>')
                        .attr('type', 'text')
                        .attr('size', size)
                        .attr('name', name)
                        .attr('id', this._id)
                        .val(value);
                    break;
                case "enumeration":
                    var options = this._attribute['options'];
                    if (this._attribute['view'] === 'radio') {
                        this._$input = $('<fieldset/>')
                            .attr('name', name);

                        this._$input.append($('<legend/>').text(this.getLabel()));

                        var $input;
                        var $label;
                        var v;
                        for (var o of options) {
                            v = o['value'];
                            $input = $('<input/>')
                                .attr('type', 'radio')
                                .attr('name', this._id)
                                .attr('id', v)
                                .val(v)
                                .prop('disabled', o['disabled'])
                                .prop('checked', (value === v));
                            this._$input.append($input);

                            $label = $('<label/>')
                                .attr('for', v)
                                .text(v);
                            this._$input.append($label);
                        }
                    } else if (this._attribute['view'] === 'select') {
                        this._$input = $('<select/>')
                            .attr('name', name)
                            .attr('id', name);

                        var $option = $('<option/>', { value: '' }).text('undefined');
                        if (this._attribute.required)
                            $option.attr('hidden', true);
                        else if (value === '')
                            $option.prop('selected', true);
                        this._$input.append($option);

                        var v;
                        for (var o of options) {
                            v = o['value'];
                            $option = $('<option/>', { value: v }).text(v);
                            $option.prop('disabled', o['disabled'])
                            if (value === v)
                                $option.prop('selected', true);
                            this._$input.append($option);
                        }
                    }
                    break;
                case "text":
                case "json":
                    var rows;
                    var cols;
                    if (this._attribute['size']) {
                        var parts = this._attribute.size.split(',');
                        if (parts.length > 0) {
                            rows = parts[0];
                        }
                        if (parts.length > 1) {
                            cols = parts[1];
                        }
                    }
                    if (!rows)
                        rows = 5;
                    if (!cols)
                        cols = 80;

                    this._$input = $('<textarea/>')
                        .attr('name', name)
                        .attr('id', this._id)
                        .attr('type', 'text')
                        .attr('rows', rows)
                        .attr('cols', cols)
                        .val(value);
                    this._$input.keydown(function (e) {
                        if (e.keyCode == 9) { // TAB
                            e.preventDefault();
                            //TODO: ident selection
                            var input = this[0];
                            if (input.selectionStart != undefined && input.selectionStart >= '0') {
                                var cursorPosition = input.selectionStart;
                                var txt = this.val();
                                this.val(txt.slice(0, cursorPosition) + '\t' + txt.slice(cursorPosition));
                                cursorPosition++;
                                input.selectionStart = cursorPosition;
                                input.selectionEnd = cursorPosition;
                                input.focus();
                            }
                            return false;
                        }
                    }.bind(this._$input));
                    break;
                default:
                    this._$input = $('<div/>')
                        .addClass('value')
                        .html("&lt;" + this._attribute['dataType'] + "&gt;");
            }
        }
        if (this._attribute['readonly']) //editable
            this._$input.attr('disabled', true);
        return Promise.resolve(this._$input);
    }

    async readValue(bValidate = true) {
        var data;
        if (this._$input && this._attribute['dataType']) {
            if (this._attribute['dataType'] === "enumeration" && this._attribute['view'] === "radio")
                data = $("input[type='radio'][name='" + this._id + "']:checked").val();
            else if (this._attribute['dataType'] === "boolean" && this._$input.prop('type') === 'fieldset')
                data = this._$input.children().first().prop('checked');
            else {
                var value = this._$input.val();
                if (value) {
                    switch (this._attribute['dataType']) {
                        case "boolean":
                            if (value === 'true')
                                data = true;
                            else if (value === 'false')
                                data = false;
                            break;
                        case "integer":
                            if (bValidate) {
                                if (!isNaN(value))
                                    data = parseInt(value);
                                else {
                                    this._$input.focus();
                                    throw new Error("Field '" + this._attribute['name'] + "' is not an valid integer");
                                }
                            } else
                                data = value;
                            break;
                        case "decimal":
                        case "double":
                            if (bValidate) {
                                if (!isNaN(value))
                                    data = parseFloat(value);
                                else {
                                    this._$input.focus();
                                    throw new Error("Field '" + this._attribute['name'] + "' is not an valid " + this._attribute['dataType']);
                                }
                            } else
                                data = value;
                            break;
                        default:
                            data = value;
                    }
                }
            }

            if (bValidate && this._attribute['required'] && !(this._attribute['readonly'])) {
                var bMissing = false;
                if (this._attribute['dataType'] === 'boolean')
                    bMissing = !(data === true || data === false);
                else
                    bMissing = !data
                if (bMissing) {
                    if (this._$input.prop('type') === 'fieldset') {
                        var input = this._$input.find('input:first');
                        if (input)
                            input.focus(); //seems not to work for type checkbox and radio
                    } else
                        this._$input.focus();
                    throw new Error("Field '" + this._attribute['name'] + "' is required");
                }
            }
        }
        return Promise.resolve(data);
    }
}
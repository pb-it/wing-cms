class FileCreator {

    static createFile(file) {
        var filename = file.name;
        /*if (file.name === "undefined" && file.type)
            filename = FileCreator.createFilenameByDateTime() + '.' + file.type.split('/')[1];*/
        FileCreator.createFileFromObject(file, filename);
    }

    static createFileFromObject(obj, filename) {
        const oUrl = URL.createObjectURL(obj);
        FileCreator.createFileFromUrl(oUrl, filename);
        URL.revokeObjectURL(oUrl);
    }

    static createFileFromText(text, filename) {
        //const url = Base64.encodeText(text);
        const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);

        FileCreator.createFileFromUrl(url, filename);

        /*const blob = new Blob([text], { type: "text/plain" });
        FileCreator.createFileFromObject(blob, filename);*/
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download
     * download only works for same-origin URLs, or the blob: and data: schemes.
     * -> blob needs to be provided as url
     * @param {*} url 
     * @param {*} filename 
     */
    static createFileFromUrl(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }

    static createFilenameByDateTime() {
        const date = new Date(); //new Date().toUTCString(); //new Date().toLocaleTimeString()
        const seconds = `${date.getSeconds()}`.padStart(2, '0');
        const minutes = `${date.getMinutes()}`.padStart(2, '0');
        const hours = `${date.getHours()}`.padStart(2, '0');
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${hours}-${minutes}-${seconds}_${day}-${month}-${year}`;
    }
}
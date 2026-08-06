const Importer = {

    async importFile(file) {

        const text = await file.text();

        const start = text.indexOf("<!DOCTYPE html");

        alert("DOCTYPE starts at: " + start);

        if (start > -1) {

            alert(text.substring(start, start + 500));

        } else {

            alert("DOCTYPE not found");

        }

    }

};

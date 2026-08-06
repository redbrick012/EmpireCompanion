document.addEventListener("DOMContentLoaded", () => {

    alert("App loaded");

    const button = document.getElementById("importButton");
    const fileInput = document.getElementById("characterFile");

    if (!button) {
        alert("No import button!");
        return;
    }

    if (!fileInput) {
        alert("No file input!");
        return;
    }

    button.onclick = () => {
        alert("Button works!");
        fileInput.click();
    };

    fileInput.onchange = () => {
        alert("File selected!");
    };

});

document.addEventListener("DOMContentLoaded", () => {

    alert("App Loaded");

    const importButton = document.getElementById("importButton");
    const fileInput = document.getElementById("characterFile");

    importButton.addEventListener("click", () => {
        alert("Opening file picker");
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        alert("File selected!");
    });

});
    

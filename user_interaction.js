function addButtonOncClick() {
    const leftSelect = document.getElementById("all-shaders");
    const rightSelect = document.getElementById("selected-shaders");

    var option = leftSelect.selectedOptions[0];
    rightSelect.appendChild(option);
    selectedShadersSelectionChanged();
    allShadersSelectionChanged();
}

function removeButtonOncClick() {
    const leftSelect = document.getElementById("all-shaders");
    const rightSelect = document.getElementById("selected-shaders");

    var option = rightSelect.selectedOptions[0];
    leftSelect.appendChild(option);
    selectedShadersSelectionChanged();
    allShadersSelectionChanged();
}

function upButtonOncClick() {
    var select = document.getElementById("selected-shaders");
    var idx = select.selectedIndex;

    var selVal = select.options.item(idx).value;
    var selText = select.options.item(idx).text;

    select.options.item(idx).text = select.options.item(idx - 1).text;
    select.options.item(idx).value = select.options.item(idx - 1).value;

    select.options.item(idx - 1).text = selText;
    select.options.item(idx - 1).value = selVal;
    
    selectedShadersSelectionChanged();
}

function downButtonOncClick() {
    var select = document.getElementById("selected-shaders");
    var idx = select.selectedIndex;

    var selVal = select.options.item(idx).value;
    var selText = select.options.item(idx).text;

    select.options.item(idx).text = select.options.item(idx + 1).text;
    select.options.item(idx).value = select.options.item(idx + 1).value;

    select.options.item(idx + 1).text = selText;
    select.options.item(idx + 1).value = selVal;
    
    selectedShadersSelectionChanged();
}

function allShadersSelectionChanged() {
    const select = document.getElementById("all-shaders");
    const addButton = document.getElementById("add-button");
    //console.log(select.selectedOptions[0]);
    var options = select.selectedOptions;
    if (options.length != 1) addButton.disabled = true;
    else addButton.disabled = false;
}

function selectedShadersSelectionChanged() {
    const select = document.getElementById("selected-shaders");
    const removeButton = document.getElementById("remove-button");
    const upButton = document.getElementById("up-button");
    const downButton = document.getElementById("down-button");
    //console.log(select.selectedOptions[0]);
    
    var selectedIndex = select.selectedIndex;
    var listLength = select.length;
    if (listLength <= 1) {
        removeButton.disabled = listLength == 0 ? true : false;
        upButton.disabled = true;
        downButton.disabled = true;
    } 
    else {
        removeButton.disabled = false;
        upButton.disabled = listLength > 1 && selectedIndex != 0 ? false : true;
        downButton.disabled = listLength > 1 && listLength - 1 != selectedIndex ? false : true;
    }
}
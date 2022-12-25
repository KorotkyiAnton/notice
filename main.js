const scriptUrl = 'https://script.google.com/macros/s/AKfycbxMsD70AQkUrQrpwavw34Fgst6vAgEMhY74JeFC81ZJ3MWFxC_s3ZkLihAEdK5J-TVvMQ/exec'; // Ссылка на развернутое веб-приложение gas
let dataOnSite = "";

window.onload = () => {
    showAllNotes();
}

// Функция для вывода формы добавления контакта
function AdderSettings() {
    let singleNotice = document.getElementById("singleNotice");

    singleNotice.innerHTML = "<div id=\"contactForm\" class=\"ms-3 me-3\">" +
        "<div class=\"mb-2\">" +
        "<label for=\"title\" class=\"form-label\">Title<sup>*</sup></label>" +
        "<input type=\"text\" class=\"form-control\" id=\"title\" aria-describedby=\"emailHelp\" required>" +
        "<div id=\"emptyTitle\" class=\"invalid-feedback collapse\">" +
        "This field is required." +
        "</div>" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"dateTime\" class=\"form-label\">Date Time</label>" +
        "<input type=\"datetime-local\" class=\"form-control\" id=\"dateTime\" aria-describedby=\"emailHelp\">" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"description\" class=\"form-label\">Description</label>" +
        "<input type=\"text\" class=\"form-control\" id=\"description\" aria-describedby=\"emailHelp\" >" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"attached\">Choose file to attach:</label>"+
        "<input type=\"text\" class=\"form-control\" id=\"attached\" aria-describedby=\"emailHelp\" >" +
        "</div>" +
        "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnSubmit\" onclick=\"SubmitBtn();\">Submit</button>" +
        "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnCancel\" onclick=\"CancelBtn();\">Cancel</button>" +
        "</div>";
}

// Функция для обработки нажатия на кнопку добавления/изменения контакта
function SubmitBtn() {
    const titleInput = document.getElementById("title");
    const oldTitleInput = document.getElementById("oldTitle");

    if (titleInput.value === "") {
        document.getElementById("title").classList.add("is-invalid");
        document.getElementById("emptyTitle").classList.remove("collapse");
        window.location.href = "index.html#title";
        return;
    }

    // Установка полей
    const dateTimeInput = document.getElementById("dateTime");
    const descriptionInput = document.getElementById("description");
    const attachedInput = document.getElementById("attached");
    // Вызов функции добавления/изменения
    addPostData(oldTitleInput, titleInput, dateTimeInput, descriptionInput, attachedInput);
}

function CancelBtn() {
    window.location.href = "index.html";
}

// Функция добавления/изменения контакта
function addPostData(oldTitleInput, titleInput, dateTimeInput, descriptionInput, attachedInput) {
    const formData = new FormData();
    let dataOnSite = JSON.parse(localStorage.getItem("dataOnSite"));
    let length = dataOnSite.length;
    let attached = "<iframe src=\""+ attachedInput.value.split(/view|edit/)[0] +"/preview\" allow=\"autoplay\"></iframe>"

    if ("index" in localStorage) {
        console.log(localStorage.getItem("index"));
        dataOnSite[localStorage.getItem("index")] = {
            "title": titleInput.value,
            "oldTitle": oldTitleInput.value,
            "dateTime": dateTimeInput.value.toString(),
            "description": descriptionInput.value,
            "attached": attached
        };
        localStorage.removeItem("index")
        localStorage.setItem("dataOnSite", JSON.stringify(dataOnSite));
    } else {
        console.log(length);
        dataOnSite.unshift({
            "title": titleInput.value,
            "dateTime": dateTimeInput.value.toString(),
            "description": descriptionInput.value,
            "attached": attached
        });
        localStorage.setItem("dataOnSite", JSON.stringify(dataOnSite));
    }

    // Указание типа операции
    formData.append('operation', 'addPostData');
    // Добавление данных
    formData.append('title', titleInput.value);
    if ("index" in localStorage) {
        formData.append('oldTitle', oldTitleInput.value);
    } else {
        formData.append('oldTitle', "nullValue");
    }
    formData.append('dateTime', dateTimeInput.value.toString());
    formData.append('description', descriptionInput.value);
    formData.append('attached', attached);

    localStorage.setItem("size", dataOnSite.length);
    addGotData(dataOnSite);
    window.location.href = "index.html";
    console.log(formData)
    // Передача данных
    fetch(scriptUrl, {
        method: 'POST', body: formData
    })
        .then(res => res.json())
}

function showAllNotes(dataLocal = JSON.parse(localStorage.getItem("dataOnSite"))) {
    if (("dataOnSite" in localStorage)) {
       addGotData(dataLocal);
    } else {
        // Отправляется запрос
        fetch(scriptUrl)
            .then(res => res.json())
            .then(data => {
                data = data.reverse();
                localStorage.setItem("size", data.length);
                localStorage.setItem("dataOnSite", JSON.stringify(data));
                // Получаем данные
                dataOnSite = data;
                console.log(data);
                addGotData(data);
            })
    }
}

// Функция отображения всех контактов
function addGotData(data) {
    let listOfNotice = document.getElementById("listOfNotice");
    listOfNotice.innerHTML = "";
    //За каждую строку в таблице получаем по ряду
    data.forEach((row, index) => {
        if (row.id !== 'Id' && row.id !== '' && row.title !== '' && row.description !== '') // Проверка важных ячеек, чтоб не выводилась пустота
        {
            listOfNotice.innerHTML += "<div class=\"card mt-2 btn\" style='background: white' onclick=\"openNotice(this)\" data-singleNotice = '"+ JSON.stringify(row) +"'>" +
                    "<div class=\"card-body\">" +
                        "<div style='display: flex; justify-content: space-between'>"+
                            "<h5 class=\"card-title\" style=\"overflow: hidden; text-overflow: ellipsis; height: 1.5em; white-space: nowrap\">" + row.title + "</h5>" +
                            "<div>" +
                                "<button type=\"button\" class=\"btn btn-icon\" onclick=\"editContactFunction(this)\" data-id='" + index + "' data-singleNotice = '"+ JSON.stringify(row) +"'><span class='pen me-1'></span></button>" +
                                "<button type=\"button\" class=\"btn btn-icon\" onclick=\"deleteContactFunction(this)\" data-title='" + row.title + "'><span class='trash me-1'></span></button>" +
                            "</div>" +
                        "</div>"+
                        "<div class=\"card-text\" style=\"overflow: hidden; max-height: 1.5em\">" + row.description + "</div>" +
                    "</div>" +
                "</div>"
        }
    })
}

function openNotice(object) {
    let singleNotice = document.getElementById("singleNotice");
    let singleNoticeObj = JSON.parse(object.getAttribute("data-singleNotice"));

    singleNotice.innerHTML = "<div class=\"card mt-2\" style='position: relative; height: 100vh'>" +
            "<div class=\"card-body\">" +
                "<h5 class=\"card-title\">" + singleNoticeObj.title + "</h5>" +
                "<h6 class=\"card-subtitle mb-2 text-muted\">"+ singleNoticeObj.dateTime + "</h6>" +
                "<div class=\"card-text mb-3 \">" + singleNoticeObj.description + "</div>" +
                "<div class=\"card-text\" style='height: 80%; max-height: 80%'>" + singleNoticeObj.attached + "</div>" +
            "</div>" +
        "</div>";
}

// Функция изменения контакта
function editContactFunction(object) {
    event.stopPropagation();

    localStorage.setItem("index", object.getAttribute("data-id"));
    let singleNotice = document.getElementById("singleNotice");
    let singleNoticeObj = JSON.parse(object.getAttribute("data-singleNotice"));

    singleNotice.innerHTML = "<div id=\"contactForm\" class=\"ms-3 me-3\">" +
        "<input type=\"text\" class=\"form-control collapse\" id=\"oldTitle\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.title +"' required>" +
            "<div class=\"mb-2\">" +
                "<label for=\"title\" class=\"form-label\">Title<sup>*</sup></label>" +
                "<input type=\"text\" class=\"form-control\" id=\"title\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.title +"' required>" +
                "<div id=\"emptyTitle\" class=\"invalid-feedback collapse\">" +
                "This field is required." +
                "</div>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"dateTime\" class=\"form-label\">Date Time</label>" +
                "<input type=\"text\" class=\"form-control\" id=\"dateTime\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.dateTime +"'>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"description\" class=\"form-label\">Description</label>" +
                "<input type=\"text\" class=\"form-control\" id=\"description\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.description +"'>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"attached\">Choose file to attach:</label>"+
                "<input type=\"text\" class=\"form-control\" id=\"attached\" aria-describedby=\"emailHelp\">" +
            "</div>" +
            "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnSubmit\" onclick=\"SubmitBtn();\">Submit</button>" +
            "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnCancel\" onclick=\"CancelBtn();\">Cancel</button>" +
        "</div>";
}

// Функция удаления контакта
function deleteContactFunction(object) {
    let data = JSON.parse(localStorage.getItem("dataOnSite"));
    let Index = data.findIndex(o => o.title == object.getAttribute("data-title"))
    data.splice(Index, 1);
    localStorage.setItem("dataOnSite", JSON.stringify(data));
    const formData = new FormData();
    // Указание типа операции
    formData.append('operation', 'deleteContact');
    // Передача номера в качестве параметра
    formData.append('title', object.getAttribute("data-title"));
    addGotData(data);
    localStorage.setItem("size", data.length);
    // Запрос
    fetch(scriptUrl, {
        method: 'POST', body: formData
    })

        .then(res => res.json())
}

// Функция поиска данных
function searchContact() {
    const searchInput = document.getElementById("searchInput");
    const formData = new FormData();
    // Указываем операцию
    formData.append('operation', 'searchContact');
    // Указываем значение по которому идёт поиск
    formData.append('value', searchInput.value);
    // Посылаем запрос
    fetch(scriptUrl, {
        method: 'POST', body: formData
    })
        .then(res => res.json())
        .then(data => {
            //Выводим данные
            showAllNotes(data);
        })
}

// Функция экспорта контактов
function exportContacts() {
    //Создаём файл со значением наших данных
    let a = document.createElement("a");
    let dataOnSite = JSON.parse(localStorage.getItem("dataOnSite"));
    let file = new Blob([JSON.stringify(dataOnSite.reverse())], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = "export.json";
    //Инициируем скачивание
    a.click();
}

//Функция поиска файла для импорта
function getImportFile() {
    //Инициируем нажатие на fileInput
    let fileInput = document.getElementById("file");
    fileInput.click();
}

//Функция импорта
function importContacts() {
    //Ищем файл
    let fileInput = document.getElementById("file");
    getImportFile()
    //Когда нашли:
    fileInput.onchange = () => {
        //Валидируем получение файла
        if (!fileInput) {
            alert("Um, couldn't find the file input element.");
        } else if (!fileInput.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!fileInput.files[0]) {
            alert("Please select a file before clicking 'Load'");
        } else {
            //Файл корректен, читаем данные, отправляем данные в таблицу
            let file = fileInput.files[0];
            let fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }

        //Функция отправки данных импорта
        function receivedText(e) {
            //Парсим данные
            let lines = JSON.parse(e.target.result);
            localStorage.setItem("dataOnSite", JSON.stringify(lines));
            // показать все данные в таблице
            localStorage.setItem("size", lines.length);
            lines = e.target.result
            //Добавляем данные в форму
            const formData = new FormData();
            formData.append('operation', 'importContacts'); // тип операции
            formData.append('data', lines);
            //Отправляем запрос с формой в параметре
            fetch(scriptUrl, {
                method: 'POST', body: formData
            })
                .then(() => {
                })
        }
    };
}

function sync() {
    localStorage.clear();
    window.location.href = "index.html";
}
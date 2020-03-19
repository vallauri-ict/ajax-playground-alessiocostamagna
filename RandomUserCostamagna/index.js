"use strict";
let nPers = 1;
let _wrapperImg, _imgs, _imgPerson, _testoStatico, _testoDinamico, _btnNav, _imgAttivo, _imgAttivato;
let nPersone, indicePersona = 0,
    persone, persona, posizione = 0,
    id;
window.onload = function() {
        _imgPerson = document.getElementById("imgPerson");
        _testoStatico = document.getElementById("testoStatico");
        _testoDinamico = document.getElementById("testoDinamico");
        _wrapperImg = document.getElementById("wrapperImg");
        _imgs = document.getElementsByTagName("img");
        _btnNav = document.getElementsByClassName("btnNav");
        _imgAttivato = _imgs[2]; //inizializzo ad un img diverso dal primo
    }
    /*VERIFICA CHE I CAMPI SIANO STATI INSERITI CORRETTAMENTE*/
function verificaCampi() {
    let _txtUtenti = document.getElementById("txtUtenti");
    let _optionsGender = document.getElementsByName("optGender");
    let _nat = document.getElementsByName("chkNat");
    let sesso;
    nPers=1;
    let nat = "&nat=";

    nPersone = _txtUtenti.value;
    for (let i = 0; i < _optionsGender.length; i++)
        if (_optionsGender[i].checked) {
            sesso = _optionsGender[i].getAttribute("value");
            break;
        }
    for (let i = 0; i < _nat.length; i++)
        if (_nat[i].checked)
            nat += _nat[i].getAttribute("value") + ",";
    if (nat == "&nat=")
        nat = "";
    if (nPersone > 0 && nPersone <= 25) {
        inviaRichiesta("results=" + nPersone + sesso + nat, aggiornaPagina);
        _txtUtenti.style.backgroundColor = "#9f9f9f";
    } else
        _txtUtenti.style.backgroundColor = "#F00";
}
/*INVIA LA RICHIESTA PER LA GENERAZIONE CASUALE DI N PERSONE*/
function inviaRichiesta(parametri, callBack) {
    $.ajax({
        "url": "https://randomuser.me/api",
        "type": "GET",
        "data": parametri,
        "contentType": "application/x-www-form-urlencoded; charset=UTF-8",
        "dataType": "json",
        "async": true, // default
        "timeout": 5000,
        "success": callBack,
        "error": function(jqXHR, test_status, str_error) {
            alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
        }
    });
}
/*FUNZIONE DI CALLBACK DI INVIARICHIESTA*/
function aggiornaPagina(data) {
    console.log(data);
    persone = data["results"];
    inizializzaNomeAndNav();
    for (let i = 1; i < _imgs.length; i++) {
        _imgs[i].addEventListener("mouseover", cambiaTesto);
        if (i == 1) {
            _imgs[i].setAttribute("active", "true");
            _imgAttivo = _imgs[i];
            _imgAttivo.style.top = "-60px";
        } else
            _imgs[i].setAttribute("active", "false");
    }
    $("#nPersone").css("width", `${(1) / persone.length * 100}%`);
    $("#nPersone").text(`${1}/${persone.length}`);
}
/*VARIA IL TESTO STATICO E DINAMICO, ESEGUE L'ANIMAZIONE DEI TAG IMG*/
function cambiaTesto() {
    if (posizione == 0) {
        _imgAttivato = this;
        for (let i = 1; i < _imgs.length; i++)
            if (_imgs[i].getAttribute("active") == "true") {
                _imgAttivo = _imgs[i];
                break;
            }
        if (_imgAttivato.getAttribute("active") == "false") {
            posizione = 0;
            id = setInterval(frame, 2);
        }
        if (nPersone > 0 && nPersone <= 25) {
            switch (this.id) {
                case "imgNome":
                    _testoStatico.innerHTML = "Hi, My name is";
                    _testoDinamico.innerHTML = persona["name"]["first"] + " " + persona["name"]["last"];
                    break;
                case "imgEmail":
                    _testoStatico.innerHTML = "My email address is";
                    _testoDinamico.innerHTML = persona["email"];
                    break;
                case "imgCompleanno":
                    _testoStatico.innerHTML = "My birthday is";
                    _testoDinamico.innerHTML = persona["dob"]["date"].split("T")[0];
                    break;
                case "imgIndirizzo":
                    _testoStatico.innerHTML = "My address is";
                    _testoDinamico.innerHTML = persona["location"]["street"]["number"] + " " + persona["location"]["street"]["name"];
                    break;
                case "imgNumero":
                    _testoStatico.innerHTML = "My phone number is";
                    _testoDinamico.innerHTML = persona["phone"];
                    break;
                case "imgPassword":
                    _testoStatico.innerHTML = "My password is";
                    _testoDinamico.innerHTML = persona["login"]["password"];
                    break;
            }
        }
    }
}
/*ANIMAZIONE TAG IMGS*/
function frame() {
    if (posizione == 60) {
        _imgAttivo.setAttribute("active", "false");
        _imgAttivato.setAttribute("active", "true");
        posizione = 0;
        clearInterval(id);
    } else {
        posizione++;
        _imgAttivo.style.top = (-60 + posizione) + "px";
        _imgAttivato.style.top = "-" + posizione + "px";
    }
}
/*INCREMENTA L'INDICE DELLA PERSONA*/
function avanti() {
    if (indicePersona < nPersone) {
        indicePersona++;
        inizializzaNomeAndNav();
    }
    $("#nPersone").css("width", `${(nPers + 1) / persone.length * 100}%`);
    $("#nPersone").text(`${nPers + 1}/${persone.length}`);
    nPers++;
}
/*DECREMENTA L'INDICE DELLA PERSONA*/
function indietro() {
    if (indicePersona > 0) {
        indicePersona--;
        inizializzaNomeAndNav();
    }
    $("#nPersone").css("width", `${(nPers - 1) / persone.length * 100}%`);
    $("#nPersone").text(`${nPers - 1}/${persone.length}`);
    nPers--;
}
/*INIZIALIZZA TUTTO CIO' CHE DEVE TORNARE COME ALL'INIZIO SE SI CAMBIA PERSONA O SE NE GENERANO DI NUOVE*/
function inizializzaNomeAndNav() {
    persona = persone[indicePersona];
    _testoDinamico.innerHTML = persona["name"]["first"] + " " + persona["name"]["last"];
    _testoStatico.innerHTML = "Hi, My name is";
    _imgPerson.setAttribute("src", persona["picture"]["large"]);

    if (indicePersona == 0) {
        _btnNav[0].disabled = true;
        _btnNav[1].disabled = false;
    } else {
        _btnNav[0].disabled = false;
        if (indicePersona == nPersone - 1)
            _btnNav[1].disabled = true;
        else
            _btnNav[1].disabled = false;
    }

    _imgAttivato.style.top = "0px";
    _imgAttivato.setAttribute("active", "false");
    _imgs[1].setAttribute("active", "true");
    _imgAttivo = _imgs[1];
    _imgAttivo.style.top = "-60px";
}

function cambiaValore(val) {
    $("span").text(val);
}
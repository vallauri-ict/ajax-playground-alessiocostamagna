$(document).ready(function () {
    const apiKey = "HBZ2XRR6ERZPKQ6D";
    let grafico;

    let chartOpt = $("#cmbChart");
    let r = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
    r.done(function (data) {
        for (let key in data) {
            if (key != "Meta Data") {
                let opt = $("<option>");
                $(opt).val(key).text(key);
                chartOpt.append(opt);
            }
        }
    })

    let table = $("#tblResults tbody");


    $("#CmbBrand").on("change", function () {
        let symbol = $(this).val();
        let r = inviaRichiesta("GET", "http://localhost:3000/GLOBAL_QUOTE?symbol=" + symbol);
        r.done(function (data) {
            let brand = data[0]["Global Quote"];
            $(table).html("");
            $(table).append(createRow(brand));
        });
    });

    $("#txtSearch").on("keyup", function () {
        if ($(this).val().length < 2)
            return;
        let r = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + $(this).val() + "&apikey=" + apiKey);
        r.done(function (data) {
            $(table).html("");
            for (let i = 0; i < 5; i++) {
                let rSymbol = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey);
                rSymbol.done(function (data) {
                    let brand = data["Global Quote"];
                    $(table).append(createRow(brand));
                })
            }
        })
    })

    $(chartOpt).on("change", function () {
        let r = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
        r.done(function (data) {
            let json = data[$(chartOpt).val()];
            $("#myChart").remove();
            let canvas = $("<canvas>");
            $(canvas).prop("id","myChart").appendTo(".chartDiv");
            setChart(json, canvas[0]);
        })
    })
    $(chartOpt).trigger("change");
    
    function setChart(json, canvas) {
        let chartr = inviaRichiesta("GET", "http://localhost:3000/chart");
        chartr.done(function (data) {
            let chartdata = data["data"];
            chartdata["labels"] = [];
            let datasets = chartdata["datasets"][0];
            datasets["data"] = [];
            for (let key in json) {
                chartdata["labels"].push(key);
                datasets["data"].push(json[key].replace("%", ""));
                datasets["backgroundColor"].push("rgb(255,0,0)");
            }
            grafico = new Chart(canvas, data);
        })
    }

    $("#imgChart").on("click",function(){
        let url = grafico.toBase64Image();
        $(this).prop("href",url);
    })
    function inviaRichiesta(method, url, parameters = "", async = true) {
        return $.ajax({ //PROMISE PER RICHESTA AJAX
            type: method,
            url: url,
            data: parameters,
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            dataType: "json",
            timeout: 5000,
            async: async
        });
    }

    function createRow(data) {  //RITORNA UNA RIGA PER UNA TABELLA
        let _tr = $("<tr>");
        for (let key in data) {
            $("<td>", {
                "text": data[key],
                appendTo: _tr
            });
        }
        return _tr;
    }
})


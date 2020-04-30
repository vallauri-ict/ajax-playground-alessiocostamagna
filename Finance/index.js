$(document).ready(function(){
    const apiKey="HBZ2XRR6ERZPKQ6D";
    let json={
        "Information Technology": "63.55%",
        "Health Care": "31.83%",
        "Consumer Discretionary": "26.19%",
        "Utilities": "11.49%",
        "Consumer Staples": "5.18%",
        "Real Estate": "1.34%",
        "Communication Services": "-4.45%",
        "Materials": "-8.20%",
        "Financials": "-8.90%",
        "Industrials": "-9.83%",
        "Energy": "-50.59%"
    };

    

    let table=$("#tblResults tbody");


    $("#CmbBrand").on("change",function(){
        let symbol= $(this).val();
        let r = inviaRichiesta("GET","http://localhost:3000/GLOBAL_QUOTE?symbol="+symbol);
        r.done(function(data){
            let brand=data[0]["Global Quote"];
            $(table).html("");
            $(table).append(createRow(brand));
        });
    });
    
    $("#txtSearch").on("keyup", function(){
        if($(this).val().length<2)
            return;
        let r=inviaRichiesta("GET", "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + $(this).val() + "&apikey=" + apiKey);
        r.done(function(data){
            $(table).html("");
            for(let i=0; i<5;i++)
            {
                let rSymbol=inviaRichiesta("GET","https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey);
                rSymbol.done(function(data){
                    let brand=data["Global Quote"];
                    $(table).append(createRow(brand));
                })
            }
        })
    })
    
    let chartr=inviaRichiesta("GET","http://localhost:3000/chart");
    chartr.done(function(data){
        let chartdata = data["data"];
        chartdata["labels"] = [];
        let datasets = chartdata["datasets"][0];
        datasets["data"] = [];
        for(let key in json)
        {
            chartdata["labels"].push(key);
            datasets["data"].push(json[key].replace("%",""));
            datasets["backgroundColor"].push("rgb(255,0,0)");
        }
        new Chart($("#myChart"),data);
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


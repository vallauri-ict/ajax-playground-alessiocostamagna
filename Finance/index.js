$(document).ready(function () {
    let json = { "web": { "client_id": "39824571982-qlbd4lk5gm579hqmof7hh5d87adid1i6.apps.googleusercontent.com", "project_id": "finance-277612", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_secret": "0zi-5hXAUS_ArOLKfMQeWz8h", "redirect_uris": ["http://127.0.0.1:8080/index.html"], "javascript_origins": ["http://127.0.0.1:8080"] } }
    const apiKey = "HBZ2XRR6ERZPKQ6D";
    let grafico;
    let clientId = json.web.client_id;
    let scope = "https://www.googleapis.com/auth/drive";
    let redirect_uri = json.web.redirect_uris[0];
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const client_secret = json.web.client_secret;

    if(code)
    {
        $.ajax({
            type: 'POST',
            url: "https://www.googleapis.com/oauth2/v4/token",
            data: {code:code
                ,redirect_uri:redirect_uri,
                client_secret:client_secret,
            client_id:clientId,
            scope:scope,
            grant_type:"authorization_code"},
            dataType: "json",
            success: function(resultData) {
               
                
               localStorage.setItem("accessToken",resultData.access_token);
               localStorage.setItem("refreshToken",resultData.refreshToken);
               localStorage.setItem("expires_in",resultData.expires_in);
               window.history.pushState({}, document.title, "index.html");
            }
      });
    }

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
            $(canvas).prop("id", "myChart").appendTo(".chartDiv");
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

    $("#imgChart").on("click", function () {
        let url = grafico.toBase64Image();
        $(this).prop("href", url);
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

    $("#btnUpload").on("click", function () {
        let file = $("#file")[0].files[0];
        let u = new Upload(file).doUpload(file);
    });

    $("#btnLogin").on("click", function () {
        url = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri="+redirect_uri
        +"&prompt=consent&response_type=code&client_id="+clientId+"&scope="+scope
        +"&access_type=offline";

        // this line makes the user redirected to the url

        window.location = url;
    });

    var Upload = function (file) {
        this.file = file;
    };
    
    Upload.prototype.getType = function() {
        localStorage.setItem("type",this.file.type);
        return this.file.type;
    };
    Upload.prototype.getSize = function() {
        localStorage.setItem("size",this.file.size);
        return this.file.size;
    };
    Upload.prototype.getName = function() {
        return this.file.name;
    };
    Upload.prototype.doUpload = function (file) {
        var that = this;
        var formData = new FormData();
    
        // add assoc key values, this will be posts values
        formData.append("file", file, this.getName());
        formData.append("upload_file", true);
    
        $.ajax({
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer" + " " + localStorage.getItem("accessToken"));
                
            },
            url: "https://www.googleapis.com/upload/drive/v2/files",
            data:{
                uploadType:"media"
            },
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', that.progressHandling, false);
                }
                return myXhr;
            },
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        });
    };
})




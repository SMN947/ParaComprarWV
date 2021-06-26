var data = {
    "stock":[
        {"nombre":"pan","cantidad":2,"medida":"unidad"}
    ],
    "minstock":[
        {"nombre":"pan","cantidad":3,"medida":"unidad"}
    ]
};

function init(a) {
	Android.showToast(Android.checkDB());
    if(a == null) { //Inicializacion
        if(localStorage.getItem("SMNDATA") == null) {
            Android.generateNoteOnSD("File.txt", JSON.stringify(data))
            localStorage.setItem("SMNDATA", JSON.stringify(data))
        }else{
            data = JSON.parse(localStorage.getItem("SMNDATA"))
            Android.generateNoteOnSD("File.txt", JSON.stringify(data))
        }
    }else{
        localStorage.setItem("SMNDATA", JSON.stringify(data))
        Android.generateNoteOnSD("File.txt", JSON.stringify(data))
    }
    var htmlFnl = '';
    var pend = calcPend(data.stock, data.minstock);
    templating('prod', pend, "nombre", "cantidad", "medida");
    templating('edit', data.minstock, "nombre", "cantidad", "medida");
    templating('inv', data.stock, "nombre", "cantidad", "medida");
    var x = JSON.stringify(data).split("}],")
        .join("}]\n\n--------------\n\n")
        .split("},").join("},\n")
        .split(":[{").join(":[\n{");
    document.getElementById('holderText').innerHTML = x//JSON.stringify(data)
}

function calcPend(act, min) {
    fMin = [];
    var found = min.map(fEl=>{
        var added = false;
        act.map(aEl=>{
            if(fEl.nombre === aEl.nombre) {
                if(fEl.cantidad - aEl.cantidad > 0) {
                    fMin.push({
                        nombre: fEl.nombre,
                        cantidad: fEl.cantidad - aEl.cantidad,
                        medida: (fEl.cantidad - aEl.cantidad > 1)?fEl.medida+'es':fEl.medida
                    });
                }
                added = true;
            }
        });
        if(!added) {
            fMin.push({
                nombre: fEl.nombre,
                cantidad: fEl.cantidad,
                medida: (fEl.cantidad > 1)?fEl.medida+'s':fEl.medida
            });
        }
    });
    data['pendientes'] = fMin;
    return fMin;
}

function templating(tmp, vals, ...args) {
    var fCode = '';
    var tmpCode = getTmpCont(tmp);
    var id = 0;
    for (const elem in vals) {
        if (Object.hasOwnProperty.call(vals, elem)) {
            const el = vals[elem];
            var thisTmp = tmpCode;
            args.map((ele)=>{
                thisTmp = thisTmp.replaceAll("{{"+ele+"}}", el[ele])
            });
            thisTmp = thisTmp.replaceAll("{{"+tmp+"Id}}", tmp+"Id"+(id++))
            fCode += thisTmp;
        }
    }
    try{
        return document.getElementById('holder-'+tmp).innerHTML = fCode;
    }catch(err) {
        console.error("Invalid Destination Div")
    }
}

function getTmpCont(tmp) {
    try{
        return document.getElementById('template-'+tmp).innerHTML;
    }catch(err) {
        console.error("Invalid Template Div")
    }
}
var cantidadParaComprar = 1;
var maxCantidad = 0;
var indxProdPend = null;
var indxProdStock = null;
var prodComprando = null;
function comprarProd(a) {
    prodComprando = a;
    indxProdPend = indxProdStock = null;
    cantidadParaComprar = 1
    document.getElementById('popup-compra').style.display = 'block' 
    document.getElementById('prodTit').innerHTML = a;
    document.getElementById('valorParaComprar').value = 1;
    data.pendientes.map((el, i)=>{
        if(el.nombre == a) {
            indxProdPend = i;
            maxCantidad = el.cantidad;
        }
    });
    data.stock.map((el, j)=>{
        if(el.nombre == a) {
            indxProdStock = j;
        }
    });
    console.log(indxProdPend, indxProdStock)
}
function adjustAmount(amount) {
    console.log(cantidadParaComprar);
    var temp = cantidadParaComprar + amount;
    if(temp > 0 && temp  <= maxCantidad) {
        cantidadParaComprar = temp;
    }
    document.getElementById('valorParaComprar').value = cantidadParaComprar;
}
function finCompra() {
    if(indxProdStock == null) {
        data.stock.push({
            nombre: prodComprando,
            cantidad: cantidadParaComprar,
            medida: 'unidad'
        });
    }else{
        var tempProdInfo = data.stock[indxProdStock].cantidad += cantidadParaComprar;
    }
    document.getElementById('popup-compra').style.display = 'none'
    init(data)
    //Mandar a server
}
function consumirProd(prod, id) {
    id = id.split('Id')[1]
    console.log(prod, id, data.stock[id]);
    data.stock[id].cantidad--;
    if(data.stock[id].cantidad <= 0) {
       data.stock.splice(id,1)
    }
    init(data);
}

function prodCancel() {
    document.getElementById('popup-compra').style.display = 'none'    
}
function ShowEl(el) {
    document.getElementById(el).classList.remove("hidden")
}
function HideEl(el) {
    document.getElementById(el).classList.add("hidden")
}
function changeTab(tab) {
    ['ContPend', 'ContEdit', 'ContInv'].map(el=>{
        HideEl(el);
        document.getElementById(el+'Btn').classList.remove("activo")
    });
    ShowEl(tab)
    document.getElementById(tab+'Btn').classList.add("activo")
    if(tab == 'ContEdit') {
        ShowEl('addMinStock');
    }else{
        HideEl('addMinStock');
    }
}

var cantidadParaAnadir = null;
var addProdTitle = null;
function showPopUpAdd(prod) {    
    cantidadParaAnadir = 0;
    addProdTitle = prod;
    document.getElementById('addProdTit').innerHTML = prod;
    document.getElementById('valorParaAnadir').value = cantidadParaAnadir;
    document.getElementById('addNombre').value = '';
    document.getElementById('addMedida').value = '';

    ShowEl('popup-add');
}

function adjustAddAmount(amount) {
    var temp = cantidadParaAnadir + amount;
    if(temp >= 0) {
        cantidadParaAnadir = temp;
    }
    document.getElementById('valorParaAnadir').value = cantidadParaAnadir;
}
function AddToMinStock() {
    var prod = document.getElementById('addNombre').value;
    var medida = document.getElementById('addMedida').value;
    console.log(prod, medida)
    if(prod == '' || medida == '') {
        document.getElementById('addProdTit').innerHTML = addProdTitle + ' - Error'
    }else{
        console.log("aaa")
        if(addProdTitle == 'Nuevo Producto') {
        console.log("aaaaaaaa")
            data.minstock.push({
                nombre: prod,
                cantidad: cantidadParaAnadir,
                medida: medida
            });
            init(data)
            HideEl('popup-add')
        }
    }
}
ShowEl('ContPend');
init(null);
changeTab('ContEdit')

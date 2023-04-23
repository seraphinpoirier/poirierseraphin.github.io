var listDepartement= 
    [//"Paris"

     
     "Seine-Saint-Denis",]
     //"Bouches-du-Rhône",
      //"Hauts-de-Seine",]
        //"Val-de-Marne",
         //"Rhône",
         //"Alpes-Maritimes",
         //"Gironde",
        
     //"Essonne",
     //"Nord",
     //"Val-d'Oise",
     //"Haute-Garonne",
     //"Yvelines",
     //"Var",
     //"Seine-et-Marne",
     //"Hérault",
     //"Ille-et-Vilaine",
     //"Pyrénées-Atlantiques",
     //"Seine-Maritime",
     //"Bas-Rhin",
     //"Indre-et-Loire",
     //"Maine-et-Loire",
     //"Loire-Atlantique",
     //"Finistère",
     //"Isère",
     //"Charente-Maritime",
     //"Pas-de-Calais",
     //"Meurthe-et-Moselle",]
    //"Loire",
     //"Gard",
     //"Morbihan",
     //"Calvados",
     //"Somme",
     //"Moselle",
     //"Puy-de-Dôme"
     //"Haute-Savoie",
     //"Haut-Rhin",
     //"Loiret",
     //"Manche",
     //"Côtes-d'Armor",
     //"Haute-Vienne",
     //"Ain",
     //"Oise",
     //"Drôme",
     //"Aude",
     //"Marne",
     //"Vienne",
     //"Saône-et-Loire",
     //"Doubs",
     //"Eure",
     //"Vendée",
     //"Pyrénées-Orientales",
     //"Sarthe",
    //"Eure-et-Loir",
     //"Loir-et-Cher",
     //"Vaucluse",
     //"Aisne",
     //"Aube",
     //"Cher",
     //"Allier",
     //"Côte-d'Or",
     //"Yonne",
     //"Corrèze",
     //"Ardèche",
     //"Indre",
     //"Dordogne",
     //"Savoie",]



//     "Deux-Sèvres",
//     "Nièvre",
//     "Vosges",
//     "Lot-et-Garonne",
//     "Landes",
//     "Aveyron",
//     "Tarn-et-Garonne",
//     "Charente",
//     "Alpes-de-Haute-Provence",
//     "Hautes-Pyrénées",
//     "Orne",
//     "Hautes-Alpes",
//     "Tarn",
//     "Gers",
//     "Haute-Loire",
//     "Mayenne",
//     "Territoire de Belfort",
//     "Jura",
//     "Haute-Marne",
//     "Haute-Saône",
//     "Ardennes",
//     "Ariège",
//     "Lot",
//     "Meuse",
//     "Cantal",
//     "Lozère",
//     "Creuse"
// ] // it's better to directly hard code these data instead of calling getDepartement(). You can also write these in a file and load it.
var listAccident=[]

// async function getDepartement(){  //recuperer les departements
//     var api="https://public.opendatasoft.com/api/records/1.0/search/?dataset=accidents-corporels-de-la-circulation-millesime&q=&row=0&facet=dep_name"
//     try{


//         var res= await fetch(api)
//         var data=await res.json()
//         for(var i=0;i<data.facet_groups[0].facets.length;i++){
//             var departement=data.facet_groups[0].facets[i]
//             if (departement.name !== "Mayotte" && departement.name !== "Guadeloupe" && departement.name !== "Martinique" && departement.name !== "Guyane" && departement.name !== "La Réunion"){ //Enlever les departements d'outre mer

//                 listDepartement.push(data.facet_groups[0].facets[i].name)
//             }
//         }
//     }

//     catch{
//         console.log("erreur de fetch")
//     }

//     console.log(listDepartement)

// }


async function fetchAccidents(urls) {   //recuperer les accidents
    let progress = 0
    const requests = urls.map((url) => fetch(url).then((response) => {   
        console.log(++progress + " / " + urls.length);
        return response
    }));
    let responses;
    try {

        responses = await Promise.all(requests);
        const errors = responses.filter((response) => !response.ok); //recuperer les requetes qui renvoient une erreur

        if (errors.length > 0) {
            throw errors.map((response) => Error(response.statusText));  //afficher les messages d'erreur
        }
    } catch {
        console.log("erreur de fetch")
    }
    return responses;
}

async function extractRecords(responses) {  //transformer les accidents en json
    let progress = 0
    const json = responses.map((response) => response.json().then((json) => {
        console.log(++progress + " / " + responses.length);
        return json
    }));
    let data;
    try {

        data = await Promise.all(json);
    } catch {
        console.log("erreur de fetch")
    }
    let records = data.map((elem) => elem.records)
    return records
}

async function getAccident(){

    var deb=Date.now()

    var api="https://public.opendatasoft.com/api/records/1.0/search/?dataset=accidents-corporels-de-la-circulation-millesime&q=&rows=9999&refine.dep_name="
    var urls = [];
    var listYears=["2012","2013","2014","2015","2016","2017","2018","2019"]

    for(var i=0;i<listDepartement.length;i++){
        for(var j=0;j<listYears.length;j++){
            urls.push(api+listDepartement[i]+"&refine.datetime="+listYears[j])
        }
    }

    let responses = await fetchAccidents(urls);
    let records = await extractRecords(responses);
    records.forEach(entrys => entrys.forEach(accident => listAccident.push(accident)))

    var fin=Date.now()

    console.log(` fetch data time : ${fin-deb} ms`)
    

    
}

async function correctAccident(){

    var i=0

    await getAccident()
    for(let i=0;i<listAccident.length;i++){
        try{
            var res=await fetch("https://geo.api.gouv.fr/communes?lat="+listAccident[i].fields.coordonnees[0]+"&lon="+listAccident[i].fields.coordonnees[1]+"&fields=nom,code,codesPostaux,departement,region&format=json")
            var data=await res.json()
            listAccident[i].fields.reg_name=data[0].region.nom
            listAccident[i].fields.dep_name=data[0].departement.nom
        }
        catch{
            console.log("no coordinate")
            listAccident[i]=null  
        }
        i++
        console.log(i+"/"+listAccident.length)
    }
    return listAccident

}

module.exports=correctAccident

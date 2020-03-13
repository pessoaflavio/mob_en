////////////////////////////////////////////////////////////////
////////// Variáveis fixas do Leaflet

//////// Layer rasterizada do Stamen (desativada no momento)
const tonerUrl = "http://{S}tile.stamen.com/toner-lite/{Z}/{X}/{Y}.png";
////////// Função para reduzir referências na URL da Stamen para caixa baixa
const url = tonerUrl.replace(/({[A-Z]})/g, s => s.toLowerCase());
////////// Centro do Brasil!
const latlng = L.latLng(-16, -55);

////////////////////////////////
////////// Controle de dados

////////// Cálculo de posição de div absoluta na página; usar para marcadores no mapa
function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top , left: rect.left }
}

const myRequest = new Request('data/versao_2020_03_13.json');

fetch(myRequest)
  .then(response => response.json())
  .then(data => {
    console.log(data)

    // criar mapa
    let map = L.map('map', {center: latlng, zoom: 4.4, maxZoom: 10, minZoom: 4, zoomDelta: 2
    });
    // adicionar Brasil vetor no mapa
    let brasil = new Request('data/brazil_new.json')
    let myStyle = {
      'color': 'white',
      'fillColor': '#CFD1D5',
      'opacity': 1,
      'fillOpacity': 1,
      'weight': 1
      // "opacity": 0.65
    };
    let brasil_data = fetch(brasil)
                        .then(response=>response.json())
                        .then(data => L.geoJSON(data,{style: myStyle}).addTo(map));

    let array_estados_em_layer = []
    let cluster_options = {
      chunkedLoading: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom:6,
      spiderfyOnMaxZoom:false,
      polygonOptions: {
        stroke: false,
        fill: false
        }
      }
    let markers = L.markerClusterGroup();
    // adicionar layers
    function fillMap(municipiosListados){
      console.log(municipiosListados)
      // usar dados
      let estados_listados = municipiosListados.map(cidade => cidade.estado)
      let estados_unicos = [...new Set(estados_listados)]
      for (var j = 0; j < estados_unicos.length; j++){
        let grupo_cidades = []
        let current_cities = data.municipios.filter(cidade => cidade.estado == estados_unicos[j])
        for (var i = 0; i < current_cities.length; i++) {
          var a = current_cities[i];
          var title = a.cidade
          var jovem = a['15_até_29_anos']
          var adulto = a['30_até_59_anos']
          var idoso = a['acima_de_60']
          var marker2 = L.marker(L.latLng(a.lat, a.long), {
            lat: a.lat,
            long: a.long,
            icon: L.divIcon({
              className: 'cleartip',
              iconSize: [200, 12],
              html: `<img src="img/icon_ball.png" width="10px" height="10px" ><br><span class="nametip">${a.cidade}</span>`,
              iconAnchor: [8, 14],
              popupAnchor: [-8, -5]
            }),
            cidade: a.cidade,
            sistemas: a.sistemas,
            }
          );
          grupo_cidades.push(marker2);
        }
        var estado_agrupado = L.layerGroup(grupo_cidades);
        array_estados_em_layer.push(estado_agrupado)
      }
      array_estados_em_layer.forEach(layer => markers.addLayer(layer))

    }
    function updateData(data,data2 = 1){
        array_estados_em_layer = []
        console.log(data2)
        let municipiosListados;
        if (data2==1){
            let municipiosListados = data.municipios
            fillMap(municipiosListados)
        } else {
            let municipiosListados = data.municipios.filter(cidade => data2.includes(cidade.cidade))
            fillMap(municipiosListados)
        }
    }

    updateData(data)

    // markers.addLayer(array_estados_em_layer);
    markers.on('clusterclick', function (a) {
      // a.layer is actually a cluster
      console.log(a.layer);
      a.layer.zoomToBounds({padding: [20, 20]});
      // console.log('cluster ' + a.layer.getAllChildMarkers().length);
    });
    // adicionar nome da cidade por cima do marker com mouse
    markers.on('mouseover',function(e){
      if (map.getZoom() < 7) {
        console.log(e.layer)
        let mData = e.layer.options;
        let cidade = mData.cidade;

        let currentLat = mData.lat;
        let currentLong = mData.long;

        let replacePx = str => str.replace('px','');

        let map_left = d3.select('div#map').style('left');
        let map_top = d3.select('div#map').style('top');

        let coordPoints = map.latLngToContainerPoint([currentLat, currentLong]);

        let cityName = d3
        .select('body')
        .append('div')
        .attr('class', 'nametip2')
        .html(cidade)
        ;

        var mapdiv = document.getElementById("map");
        let divOffset = offset(mapdiv);

        let stringX = cityName.style('width');
        let clearX = stringX.replace('px','')
        // let finalX = (coordPoints.x + divOffset.left) - Number(clearX)/2
        let finalX = (coordPoints.x + divOffset.left)
        let finalY = (coordPoints.y + 100)

        cityName
        .style('left', finalX + 'px')
        .style('top', finalY + 'px')
        ;
      } else {
        ;
      }
    })
    // retirar nome da cidade por cima do marker com mouse
    markers.on('mouseout',function(e){
      if (map.getZoom() < 7){
        let mData = e.layer.options
        let cidade = mData.cidade;

        d3
        .select('div.nametip2')
        .remove()
      } else {
        ;
      }
    })

    map.addLayer(markers);
    map.on('zoomend',function(){
      if (map.getZoom() >= 7){
        d3
        .selectAll('span.nametip')
        .style('opacity', '1')
      } else {
        d3
        .selectAll('span.nametip')
        .style('opacity', '0')
      }
    })

    d3
    .select('div.side_operadora')
    .selectAll('a')
    .data(data.operadora)
    .enter()
    .append('a')
    .attr('class', 'operadora')
    .text(d => d)
    .on('click',function(d){
      array_estados_em_layer.forEach(layer => markers.removeLayer(layer))
      let system_array = data.cidade_por_operadora.filter(object => object.operadora == d)
      updateData(data,system_array[0].municipios)
    });

    }
  )
  ;

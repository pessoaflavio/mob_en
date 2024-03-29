////////////////////////////////////////////////////////////////
////////// Variáveis fixas do Leaflet

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

////////// Controla preenchimento da ficha lateral sem dados
function missingData(data,div,extradiv) {
    if (data === 'Dados não disponíveis') {
        // console.log(div);
        d3.select(div).select('span.red_dot').remove();
        const previous = d3.select(div).select('span.divheader');

        previous
        .append('span')
        .attr('class', 'red_dot')
        .html(' *')
        ;

        if (extradiv===undefined){
          d3.select(div).style('opacity',0);
        } else {
          d3.select(div).select(extradiv).style('opacity',0);
        }
        return '.';

    } else {
      if (extradiv===undefined){
        d3.select(div).style('opacity',1);
      } else {
        d3.select(div).select(extradiv).style('opacity',1);
        d3.select(div).select('span.red_dot').remove();
        if (div==='div.s02'){
          return new Intl.NumberFormat('en-US').format(data) + ' tCO2e'
        } else if (div==='div.s07_01') {
          return new Intl.NumberFormat('en-US').format(data) + '%'
        } else if (div==='div.s07_02') {
          return new Intl.NumberFormat('en-US').format(data) + '%'
        } else {
          return new Intl.NumberFormat('en-US').format(data)
        }

      }
    }
}

// controla preenchimento de dados inexistentes
function fillDiv(div,data,extradiv){
  if (div === undefined){
    d3.select(div).text(missingData(data,div))
  } else {
    d3.select(div).select(extradiv).text(missingData(data,div,extradiv))
  }
}

// remove a div temporariamente da UI
function removeDiv(div){
  d3.select(div).style('display','none')
}

function showDiv(div,style){
  d3.select(div).style('display',style)
}

// preenche idades
function fillAge(a1,a2,a3){
  if (a1[1] === 'Dados não disponíveis'){

    d3.select('div.s07_02').select('span.red_dot').remove();

    const previous = d3.select('div.s07_02').select('span.divheader');

    previous
    .append('span')
    .attr('class', 'red_dot')
    .html(' *')
    ;

    d3.select('div.s07_02').select('span.agelist').style('opacity', 0)
    ;

  } else {
    console.log(a1[0],a1[1])
    d3.select('div.s07_02').select('span.red_dot').remove();
    d3.select('div.s07_02').select('span.agelist').style('opacity', 1)
    fillDiv('div.s07_02',a1[1],a1[0])
    fillDiv('div.s07_02',a2[1],a2[0])
    fillDiv('div.s07_02',a3[1],a3[0])
  }

}

// preenche tudo lado direito
function fillSidePanel(data){

  fillDiv('div.s02',data['emissões_de_co2_evitadas'],'.bignumber')
  fillDiv('div.s04',data['média_distância_percorrida_por_dia'],'.bignumber')
  fillDiv('div.s05_01',data['bicicletas'],'.smallnumber')
  fillDiv('div.s05_03',data['patinetes_elétricos'],'.smallnumber')
  fillDiv('div.s06_01',data['viagens_diárias'],'.bignumber')
  fillDiv('div.s07_01',data['homens'],'.men')
  fillDiv('div.s07_01',data['mulheres'],'.women')
  let ageDiv = {d1: 'span.quinze', d2: 'span.trinta', d3: 'span.sessenta'}
  let ageData = {data1: data['15_até_29_anos'], data2: data['30_até_59_anos'], data3: data['acima_de_60']}
  fillAge([ageDiv.d1, ageData.data1], [ageDiv.d2, ageData.data2], [ageDiv.d3, ageData.data3])
  fillDiv('div.s07_03', data['usuários'],'.bignumber')

}

function checkEl(elem){
  return Number.isInteger(elem)
}

const myRequest = new Request('data/dados_atuais.json');

fetch(myRequest)
  .then(response => response.json())
  .then(data => {
    console.log(data.municipios)
		var map = L.map('map', {center: latlng, zoom: 4.4, maxZoom: 10, minZoom: 4, zoomDelta: 2
    });

    let brasil = new Request('data/brazil_new.json')

    let myStyle = {
      'color': 'white',
      'fillColor': '#CFD1D5',
      'opacity': 1,
      'fillOpacity': 1,
      'weight': 1
    };

    let brasil_data = fetch(brasil)
                        .then(response=>response.json())
                        .then(data => L.geoJSON(data,{style: myStyle}).addTo(map));

    let estados_listados = data.municipios.map(cidade => cidade.estado)
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
          emissões_de_co2_evitadas: a.emissões_de_co2_evitadas,
          estações: a.estações,
          bicicletas: a.bicicletas,
          bicicletas_elétricas: a.bicicletas_elétricas,
          patinetes_elétricos: a.patinetes_elétricos,
          viagens_diárias: a.viagens_diárias,
          média_distância_percorrida_por_dia: a.média_distância_percorrida_por_dia,
          usuários: a.usuários,
          mulheres: a.mulheres,
          homens: a.homens,
          '15_até_29_anos': a['15_até_29_anos'],
          '30_até_59_anos': a['30_até_59_anos'],
          'acima_de_60': a['acima_de_60'],
          modais: a.modais
          });
        grupo_cidades.push(marker2);

  		}
      var estados = L.layerGroup(grupo_cidades);

      var markers = L.markerClusterGroup({
        chunkedLoading: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom:6,
        spiderfyOnMaxZoom:false,
        polygonOptions: {
          stroke: false,
          fill: false
          }
        }
      );

      markers.addLayer(estados);

      markers.on('mousedown',function(e){
        d3.select('div.s04_00').html('')
        d3.select('div.side').style('background-color', '#DFEFEB');

        for (var i=0;i<=2;i++){
            d3.select('div.s05_0' + (i+1)).style('opacity',1)
        }

        d3.select('div#s01').html(`<h3>${e.layer.options.cidade}</h3>`)

        let mData = e.layer.options
        let s = mData.sistemas;
        let lista_veiculo = [mData.bicicletas,mData.bicicletas_elétricas,mData.patinetes_elétricos]

        d3.selectAll('.button').remove()
        d3.selectAll('.bike').remove()
        d3.selectAll('.bike_el').remove()
        d3.selectAll('.pat_el').remove()

        // 03 LAYER TODOS
        d3.select('div.s03').insert('div').attr('class', 'button').html('All').on('click',function(){
          removeDiv('div.s07');
          d3.select('div.s04_00').html('')

          for (var i=0;i<=2;i++){
              d3.select('div.s05_0' + (i+1)).style('opacity',1)
          }

          d3.select('div.side').style('background-color', '#DFEFEB');

          let currentDivText = d3.select(this).text();
          d3.selectAll('circle').remove()
          d3.selectAll('.button')
            .classed('active', (d, i, nodes) => {
              const node = d3.select(nodes[i]);
              const node_text = node._groups[0][0].textContent;
              if (node_text === currentDivText) {
                  return true } else {
                  return false
                }
            }
          )

          fillSidePanel(mData);

        })

        // 02 LAYER DE SISTEMAS
        for (var j=0; j<s.length;j++){

          let sist = s[j];
          let co2 = sist.emissões_de_co2_evitadas;
          let estacoes = sist.estações;
          let bici = sist.bicicletas;
          let b_ele = sist.bicicletas_elétricas;
          let pat = sist.patinetes_elétricos;
          let viagens = sist.viagens_diárias;
          let dist = sist.média_distância_percorrida_por_dia;
          let usuarios = sist.usuários;
          let mul = sist.mulheres;
          let hom = sist.homens;
          sist.transp = sist.veiculos;
          let jovens = sist['15_até_29_anos'];
          let adultos = sist['30_até_59_anos'];
          let idosos = sist['acima_de_60']

          d3.select('div.s03').insert('div').attr('class', 'button').html(sist.sistema).on('mousedown',function(){


            d3.select('div.s04_00').html('')
            d3.select('div.side').style('background-color', '#DFEFEB');
            d3.selectAll('circle').remove()
            let currentDivText = d3.select(this).text();

            d3.select('div.s04_00').html(`<span class="divheader">Stations</span>
            <span class="bignumber"></span>`)

            fillDiv('div.s04_00',estacoes,'.bignumber')

            d3.selectAll('.button')
              .classed('active', (d, i, nodes) => {
                const node = d3.select(nodes[i]);
                const node_text = node._groups[0][0].textContent;
                if (node_text === currentDivText) {
                    return true } else {
                    return false
                  }
              }
            )
            showDiv('div.s07','flex')
            fillSidePanel(sist)


          })

        }

        // 01 PRIMEIRO LAYER DE DADOS DA CIDADE
        fillSidePanel(mData);
        removeDiv('div.s07');

      });
      markers.on('clusterclick', function (a) {
        a.layer.zoomToBounds({padding: [20, 20]});
      });
      // adicionar nome da cidade por cima do marker com mouse
      markers.on('mouseover',function(e){
        if (map.getZoom() < 7) {
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
          let finalX = (coordPoints.x + divOffset.left)
          let finalY = (coordPoints.y + divOffset.top)

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

    }

    }
  )
  ;

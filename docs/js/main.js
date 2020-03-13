
////////// Controle de dados

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
          return new Intl.NumberFormat('en-US').format(data) + ' kg'
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

removeDiv('div.s07');

function checkEl(elem){
  return Number.isInteger(elem)
}

function total_veiculos(ref){

  let sum_veiculos = [ref.bicicletas,ref.bicicletas_elétricas,ref.patinetes_elétricos]

  let finalNums = sum_veiculos.filter(elem => checkEl(elem)==true )

  if (checkEl(ref['bicicletas'])==false & checkEl(ref['bicicletas_elétricas'])==false & checkEl(ref['patinetes_elétricos'])==false){
    // console.log(finalNums)
    var veiculos = 'Dados não disponíveis'
    return veiculos
  } else if (finalNums.length == 1) {
    // console.log(finalNums)
    var veiculos = finalNums[0]
    return veiculos
  } else {
    // console.log(finalNums)
    var veiculos = finalNums.reduce((acc, elem) => acc + elem, 0);
    return veiculos
  }
}


let scaleLin = d3.scaleLinear()
    .domain([0, 8000])
    .range([1, 24.5]);


// preenche tudo lado direito
function fillSidePanel(data){

  let mainHolder = d3
  .select('.side')
  ;

  fillDiv('div.s02',data['emissões_de_co2_evitadas'],'.bignumber')

  fillDiv('div.s04',data['média_distância_percorrida_por_dia'],'.bignumber')

  fillDiv('div.s05_01',data['bicicletas'],'.smallnumber')
  fillDiv('div.s05_03',data['patinetes_elétricos'],'.smallnumber')

  fillDiv('div.s06_01',data['viagens_diárias'],'.bignumber')


  mainHolder
  .select('#s01')
  // .append('h3')
  .html('<h3>' + data.local + '</h3>')
  ;

  mainHolder
  .select('.s03')
  .insert('div')
  .attr('class', 'button')
  .html('<a href="sistemas.html">Systems list</a>')
  ;

}

let div = d3.select('body').append('div').attr('class','tooltip').style('opacity', 0);

d3.select('div.side').style('background-color', '#EDEDED');

function loadData(data){
  d3.json(data).then(data => fillSidePanel(data));
};

loadData('data/versao_2020_03_13.json')

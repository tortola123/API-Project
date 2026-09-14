fetch('countries.json')
.then(data => data.json() )   
.then(json => {

  console.log(json)
  
  // sort an array of countries by comparing area
  let sorted = json.sort((a,b) =>  a.area - b.area  ); 

  
   sorted.forEach( country => { 

     // dynamically construct a url for a flag
     // based on the ISO code. 
     // https://github.com/mledoze/countries
     // 
     let flagImage = `https://raw.githubusercontent.com/mledoze/countries/master/data/${country.cca3.toLowerCase()}.svg`
     
    // make a div to hold each planet
    let div = document.createElement('div') 
    div.classList.add('country')  
    
    div.innerHTML = 
      `<img class="flag" src="${flagImage}">
      <h4>${country.name.common}</h4>
      <p>${country.area} km²</p> 
      <p><b>Lat/Lng</b> ${country.latlng[0]}°,${country.latlng[1]}°</p> ` 
     
     document.querySelector('#countries') .appendChild(div)
  })
 
})


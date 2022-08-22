const listBus = document.querySelector('.list-bus')

const url = 'http://127.0.0.1:5000/car/'

let render = ''
let num = 0
const displaytoHtml = (isi) =>{
    isi.forEach(x => {
        num++
        render += `
        <tr data-id="${x.id}">
            <th>${num}</th>
            <td class="afterKode">${x.kode}</td>
            <td class="afterMerk">${x.merk}</td>
            <td class="afterKapasitas">${x.kapasitas}</td>
            <td>
                <a href="#" class="btn btn-sm">
                    <i class="fa-solid fa-pen" id="editButton"></i>
                </a>
                <a href="#" class="btn btn-sm">
                    <i class="fa-solid fa-trash-can" id="deleteButton"></i>
                </a>
            </td>
        </tr>`
    });
    listBus.innerHTML = render
}

// get cookies
function getCookie(name) {
    name = name + '=';

    const decodedCookie = decodeURIComponent(document.cookie);

    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
  
      if (cookie.indexOf(name) == 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
};

const header = new Headers()
const cookies = getCookie('token')
header.set('x-access-token', cookies)

// get request
fetch(url,{
    mode:'cors',
    headers: header
})
    .then(res => res.json())
    .then(data => displaytoHtml(data))
    .catch(err =>{
        console.log(err)
    })

const pos = document.querySelector('.add-pos-form')
const kodeBus = document.getElementById('teksKode')
const merkBus = document.getElementById('teksMerk')
const kapasitasBus = document.getElementById('teksKapasitas')
const idRuteBus = document.getElementById('teksIdRute')

// post request
pos.addEventListener('submit', (e) =>{
    e.preventDefault()
    fetch(url,{
        method:'POST',
        mode:'cors',
        headers:{
            'Content-Type':'application/json',
            'x-access-token': cookies
        },
        body:JSON.stringify({
            kode:kodeBus.value,
            spesifikasi:merkBus.value,
            kapasitas:kapasitasBus.value,
            id_rute:idRuteBus.value
        })
    })
        .then(res => res.json())
        .then(data => {
            const dataArr = []
            dataArr.push(data)
            window.location.reload(dataArr)
            displaytoHtml(dataArr)
        })
        .catch(err =>{
            console.log(err)
        })
})

const createButton = document.querySelector('.createButtonBus')

// delete and update request
listBus.addEventListener('click', (e) =>{
    e.preventDefault()
    const hapus = e.target.id == 'deleteButton'
    const edit = e.target.id == 'editButton'
    let id = e.target.parentElement.parentElement.parentElement.dataset.id

    if(hapus){
        fetch(`${url}${id}/`,{
            method:'DELETE',
            mode:'cors',
            credentials:'same-origin',
            headers:{
                'Content-Type':'application/json',
                'x-access-token': cookies
            }
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err =>{
                console.log(err)
            })
    }

    if(edit){
        const container = e.target.parentElement.parentElement.parentElement
        let editKode = container.querySelector('.afterKode').textContent
        let editMerk = container.querySelector('.afterMerk').textContent
        let editKapasitas = container.querySelector('.afterKapasitas').textContent

        kodeBus.value = editKode
        merkBus.value = editMerk
        kapasitasBus.value = editKapasitas
        idRuteBus.value = id
    }

    createButton.addEventListener('click', (e) =>{
        e.preventDefault()
        fetch(`${url}${id}/`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
            body: JSON.stringify({
                kode:kodeBus.value,
                spesifikasi:merkBus.value,
                kapasitas:kapasitasBus.value,
                id_rute:idRuteBus.value
            })
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err => {
                console.log(err)
            })
    })
})
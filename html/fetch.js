const isiTable = document.querySelector('#body-list')
// console.log({'AAN':isiTable})
const url = 'http://127.0.0.1:5000/user/'

let render = ''
let num = 0
const displaytoHtml = (isi) =>{
    isi.forEach(x => {
        num++
        render += `
        <tr>
            <td>${num}</td>
            <td>${x.nama}</td>
            <td>${x.email}</td>
            <td>${x.username}</td>
        </tr>`
    })
    isiTable.innerHTML=render
};

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

// get data all user for admin dashboard
const cookies = getCookie('token')
const header = new Headers()
header.set('x-access-token', cookies)
fetch(url,{
    mode:'cors',
    // credentials:'include',
    headers: header
})
    .then(res => res.json())
    .then(data => displaytoHtml(data));



// fetching untuk page rute
const listRute = document.querySelector('.list-rute')
const urlRute = 'http://127.0.0.1:5000/rute/'

let rute_display = ''
let counter = 0
const displaytoRute = (element) =>{
    element.forEach(i => {
        counter++
        rute_display += `
        <tr data-id="${i.id}">
            <td>${counter}</td>
            <td class="kotaAsal">${i.kota_asal}</td>
            <td class="kotaTujuan">${i.kota_tujuan}</td>
            <td class="besarTarif">${i.tarif}</td>
            <td class="lamaDurasi">${i.durasi}</td>
            <td>
                <a href="#" class="btn btn-sm">
                    <i class="fa-solid fa-pen" id="editbutton"></i>
                </a>
                <a href="#" class="btn btn-sm">
                    <i class="fa-solid fa-trash-can" id="deletebutton"></i>
                </a>
            </td>
        </tr>`
    });
    listRute.innerHTML = rute_display
};
// get data rute
fetch(urlRute,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displaytoRute(data));

// post data rute
const createButton = document.querySelector('.createButton')
const postForm = document.querySelector('.add-post-form')
const kotaAsal = document.getElementById('kota-asal')
const kotaTujuan = document.getElementById('kota-tujuan')
const tarifvalue = document.getElementById('tarif')
const durasivalue = document.getElementById('durasi')


postForm.addEventListener('submit',(e) =>{
    e.preventDefault()
    fetch(urlRute,{
        method:'POST',
        mode:'cors',
        headers:{
            'Content-Type':'application/json',
            'x-access-token':cookies
        },
        body: JSON.stringify({
            rute: kotaAsal.value,
            tujuan: kotaTujuan.value,
            lama: durasivalue.value,
            harga: tarifvalue.value
        })
    })
        .then(res => res.json())
        .then(data => {
            const dataArr = []
            dataArr.push(data)
            window.location.reload(dataArr)
            displaytoRute(dataArr)
            // console.log(data)
        })
        .catch(err =>{
            console.log(err)
        })
});

// delete and update data rute
listRute.addEventListener('click', (e) =>{
    let hapus = e.target.id == 'deletebutton'
    let edit = e.target.id == 'editbutton'
    let id = e.target.parentElement.parentElement.parentElement.dataset.id

    // delete request rute
    if(hapus){
        fetch(`${urlRute}${id}/`,{
            method:'DELETE',
            mode:'cors',
            credentials:'same-origin',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            }
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err =>{
                console.log(err)
            })
    }

    // update request rute
    if(edit){
        const container = e.target.parentElement.parentElement.parentElement
        let afterKotaAsal = container.querySelector('.kotaAsal').textContent
        let afterKotaTujuan = container.querySelector('.kotaTujuan').textContent
        let afterTarif = container.querySelector('.besarTarif').textContent
        let afterDurasi = container.querySelector('.lamaDurasi').textContent

        kotaAsal.value = afterKotaAsal
        kotaTujuan.value = afterKotaTujuan
        tarifvalue.value = afterTarif
        durasivalue.value = afterDurasi
    }

    createButton.addEventListener('click', (e) =>{
        e.preventDefault()
        fetch(`${urlRute}${id}/`,{
            method:'PUT',
            // mode:'cors',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
            body: JSON.stringify({
                rute: kotaAsal.value,
                tujuan: kotaTujuan.value,
                lama: durasivalue.value,
                harga: tarifvalue.value
            })
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err =>{
                console.log(err)
            })
    })
})
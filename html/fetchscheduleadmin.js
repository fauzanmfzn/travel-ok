const isiSchedule = document.querySelector('.list-schedule')

url = 'http://127.0.0.1:5000/schedule/'

let render = '';
let num = 0;
const displaytoHtml = (isi) =>{
    isi.forEach(x => {
        num++
        render += `
            <tr data-id="${x.id}">
                <th>${num}</th>
                <td class="kolomHari">${x.hari}</td>
                <td class="kolomJam">${x.jam}</td>
                <td>
                    <a href="#" class="btn btn-sm">
                        <i class="fa-solid fa-pen" id="EditButton"></i>
                    </a>
                    <a href="#" class="btn btn-sm">
                        <i class="fa-solid fa-trash-can" id="DeleteButton"></i>
                    </a>
                </td>
            </tr>`
    });
    isiSchedule.innerHTML = render
}

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

// get token from cookies and pass it into the new header
const header = new Headers()
const cookies = getCookie('token')
header.set('x-access-token', cookies)

// get request
fetch(url,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displaytoHtml(data))
    .catch(err =>{
        console.log(err)
    })

const createButton = document.querySelector('.createButtonSchedule')
const pos = document.querySelector('.add-post-form')
const hari = document.getElementById('hari')
const jam = document.getElementById('jamberangkat')
const idMobil = document.getElementById('id-mobil')
const idRute = document.getElementById('id-rute')

// psot request
pos.addEventListener('submit', (e) =>{
    e.preventDefault()
    fetch(url,{
        method:'POST',
        mode:'cors',
        headers:{
            'Content-Type':'application/json',
            'x-access-token':cookies
        },
        body: JSON.stringify({
            hari_berangkat : hari.value,
            jam_berangkat : jam.value,
            id_rute : idRute.value,
            id_mobil : idMobil.value
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


// delete and update request
isiSchedule.addEventListener('click', (e) =>{
    e.preventDefault()
    let hapus = e.target.id == 'DeleteButton'
    let edit = e.target.id == 'EditButton'
    
    let id = e.target.parentElement.parentElement.parentElement.dataset.id

    if(hapus){
        fetch(`${url}${id}/`,{
            method:'DELETE',
            mode:'cors',
            credentials:'same-origin',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err =>{
                console.log(err)
            })
    }

    if(edit){
        const container = e.target.parentElement.parentElement.parentElement
        let kolomHari = container.querySelector('.kolomHari').textContent
        let kolomJam = container.querySelector('.kolomJam').textContent
        
        hari.value = kolomHari
        jam.value = kolomJam
    }

    createButton.addEventListener('click', (e) =>{
        e.preventDefault()
        fetch(`${url}${id}/`,{
            method:'PUT',
            // mode:'cors',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
            body: JSON.stringify({
                hari:hari.value,
                jam:jam.value
            })
        })
            .then(res => res.json())
            .then(() => location.reload())
            .catch(err =>{
                console.log(err)
            })
    })

})

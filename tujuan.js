const listRute = document.querySelector('.container')
const kota_awal = document.querySelector("#inputKotaAwal")
const kota_tuju = document.querySelector("#inputKotaTujuan")
const tanggal = document.getElementById("tanggalBerangkat")
const searchButton = document.querySelector('.cariTiket')
const seluruh = document.querySelector('#load')

const url_search = 'http://127.0.0.1:5000/search-schedule-rute'
const url_order = 'http://127.0.0.1:5000/order/'

// get and set cookie to header
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

// set attribute date to min today
let today = new Date()
let dd = today.getDate()
let mm = today.getMonth()+1
let yyyy = today.getFullYear()

if(dd<10){
    dd = '0' + dd
}
if(mm<10){
    mm = '0' + mm
}
today = yyyy + '-' + mm + '-' + dd

tanggal.setAttribute("min", today)

let render = ''
const displayRute = (isi) =>{
    // listRute.removeChild(looping)
    isi.forEach(x => {
        
         render += `
            <div class="row mb-4 looping">
                <div class="col">
                    <div class="card">
                        <div class="card-body">
                            <div class="row listrow">
                                <div class="col-3 ms-5 mt-3">
                                    <img class="me-2" src="/assets/bus-partners/lorena.jpeg" width="50" height="50">
                                    ${x.merk}
                                </div>
                                <div class="col col-sm text-center ps-0 pe-0">
                                    <h5><b>${x.jam}</b></h5>
                                    <p style="color: grey;">${x.kota_asal}</p>
                                </div>
                                <div class="col col-sm text-center ps-0 pe-0">
                                    <h5 class="mt-3" style="color: grey;"><b>${x.durasi}</b></h5>
                                </div>
                                <div class="col col-sm text-center ps-0 pe-0">
                                    <h5 hidden><b>19:00</b></h5>
                                    <p style="color: grey;">${x.kota_tujuan}</p>
                                </div>
                                <div class="col-3 text-end me-5 mt-3">
                                    <h4 class="me-3" id="hargaTarif"><b>Rp.${x.tarif}</b></h4>
                                    <button type="button" class="btn w-50 mb-4 text-light ms-4 rounded-pill"  id="orderButton" style="background-color: #ff4c15;">
                                        Order
                                    </button>
                                </div>
                                <div hidden class="col col-sm text-center ps-0 pe-0 isiDaftarId">
                                    <h5><b>19:00</b></h5>
                                    <p id="idSchedules" style="color: grey;">${x.id_schedule}</p>
                                    <p id="idCars" style="color: grey;">${x.id_car}</p>
                                    <p id="idRutes" style="color: grey;">${x.id_rute}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal fade removemodal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"> 
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Order sekarang</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row">
                                        <div class="col text-start">
                                            <label for="inputTanggalBerangkat" class="form-label">Tanggal</label>
                                            <input type="text" class="form-control" id="inputTanggalBerangkat" aria-label="Disabled input example" disabled>
                                        </div>
                                        <div class="col text-start">
                                            <label for="inputTanggalBerangkat" class="form-label">Jumlah Tiket</label>
                                            <input type="number" min="1" class="form-control" id="inputTiket">
                                        </div>
                                        <div class="col text-start">
                                            <label for="inputTanggalBerangkat" class="form-label">Total Harga</label>
                                            <input type="text" class="form-control" id="inputTotalHarga" aria-label="Disabled input example" disabled>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Batal</button>
                                    <button type="button" class="btn btn-primary" id="beliSekarang">Beli sekarang</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
    });
   
    listRute.innerHTML = render
}

function getDayName(dateStr,locale)
{  
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale, { weekday: 'long' });        
}

let construct =''
const displayRuteWhenNul =() =>{
    construct +=`
        <div class="row mt-3" style="background-color: #f6f6f6;">    
            <div class="row justify-content-center">
                <div class="col-4 text-end">
                    <img src="/resources/busvector1.jpg" width="250" height="200">
                </div>
                <div class="col-4">
                    <h3 class="mt-5"><b>Ups! bis tidak dapat ditemukan</b></h3>
                    <p>Tidak ada bis dari rute dan tanggal keberangkatan yang anda pilih. silahkan coba lagi dengan pilihan yang berbeda</p>
                </div>
            </div>
        </div>`
    listRute.innerHTML = construct
}

searchButton.addEventListener('click', (e) =>{
    e.preventDefault()

    listRute.innerHTML = ''
    fetch(url_search,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            kota_asal:kota_awal.value,
            kota_tujuan:kota_tuju.value,
            tanggal_berangkat:getDayName(tanggal.value, "id")
        })
    })
    .then(res => res.json())
    .then(data =>{
        displayRute(data)
        if(data.length==0){
            displayRuteWhenNul()
        }
    })
    kota_awal.addEventListener('click',(e)=>{
        e.preventDefault()
        location.reload()
    });
    kota_tuju.addEventListener('click',(e)=>{
        e.preventDefault()
        location.reload()
    });
    tanggal.addEventListener('click',(e)=>{
        e.preventDefault()
        location.reload()
    })
})



listRute.addEventListener('click', (e) =>{
    e.preventDefault()
    const container = e.target.parentElement
    const orderBtn = container.querySelector('#orderButton')
    const modalRemove = document.querySelector('.removemodal')
    const tarif = container.querySelector('#hargaTarif')
    let sumTiket = document.querySelector('#inputTiket')
    let totalHarga = document.querySelector('#inputTotalHarga')
    let inputDateModal = document.querySelector('#inputTanggalBerangkat')
    inputDateModal.value = tanggal.value
    const orderbtn1 = e.target.id == 'orderButton'

    if(orderbtn1){
        if(cookie == null){
            window.location.href='login.html'
        }
        else{
            orderBtn.setAttribute('data-bs-toggle','modal')
            orderBtn.setAttribute('data-bs-target','#exampleModal')
            modalRemove.setAttribute('id','exampleModal')
        }
        
    }
    sumTiket.addEventListener('input',()=>{
        let price = tarif.textContent
        totalHarga.value = 'Rp.'+ sumTiket.value * String(price.slice(3,))
        console.log(sumTiket.value)
    })
    
    let order2 = e.target.id =='beliSekarang'

    if(order2){
        const container_id = e.target.parentElement.parentElement.parentElement.parentElement.parentElement
        let idSchedule = container_id.querySelector('#idSchedules')
        let idCar = container_id.querySelector('#idCars')
        let idRute = container_id.querySelector('#idRutes')
        let sumTiket = document.querySelector('#inputTiket')
        const tarif = container_id.querySelector('#hargaTarif')
        let totalHarga = document.querySelector('#inputTotalHarga')
        fetch(url_order,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
            body:JSON.stringify({
                id_rute:Number(idRute.textContent),
                id_hari:Number(idSchedule.textContent),
                id_mobil:Number(idCar.textContent),
                jumlah_tiket:Number(sumTiket.value),
                tanggal_berangkat:inputDateModal.value
            })
        })
            .then(res=>res.json())
            .then(data => {
                alert(data.message)
                window.location.href='/html/ordermember.html'
                
            })
            .catch(err => console.log(err))
    }
})



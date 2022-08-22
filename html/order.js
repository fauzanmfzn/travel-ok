const listOrder = document.querySelector('.listOrderan')

const url_view_order = 'http://127.0.0.1:5000/order/'
const url_refund = 'http://127.0.0.1:5000/refund/'

let skeleton = ''
const displayIdOrder = (isi) =>{
    isi.forEach(x => {
        skeleton += `   <div >
                            <div class="card-header mb-3 mt-3" >
                                E-tiket keberangkatan
                            </div>
                            <div class="card-body mb-3">
                                <div class="col">
                                    <h6>${x.mobil}</h6>
                                </div>
                                <div class="col">
                                    <p class="mb-0">${x.kota_asal} ke ${x.kota_tujuan}</p>
                                    <p class="mt-0">${x.hari}, ${x.jam} WIB. ${x.tanggal}</p>
                                </div>
                                <div class="col">
                                    <h6>Harga : Rp.${x.total_harga}</h6>
                                </div>
                                <div class="col">
                                    <h6>Penumpang : ${x.nama}</h6>
                                </div> 
                                <div class="col">
                                    <button type="button" class="btn btn-success text-light" id="refundBtn" style="margin-left: 900px;" data-bs-toggle="modal" data-bs-target="#modal${x.id}">
                                        Refund
                                    </button>
                                </div> 
                                <div class="modal fade" data-id="${x.id}" id="modal${x.id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                                                    <div class="modal-dialog modal-dialog-centered">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="staticBackdropLabel">Refund</h5>
                                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <p>Apakah anda yakin untuk melakukan refund order?</p>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn btn-danger text-light" data-bs-dismiss="modal">Tidak</button>
                                                                <button type="button" class="btn btn-success text-light" data-id="refund1">Iya</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                            </div>
                        </div>`
    });
    listOrder.innerHTML = skeleton
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

fetch(url_view_order,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayIdOrder(data))
    .catch(err => console.log(err))

listOrder.addEventListener('click', (e)=>{
    e.preventDefault()
    const refund = e.target.dataset.id == 'refund1'
    if(refund){
        let id = e.target.parentElement.parentElement.parentElement.parentElement.dataset.id
        fetch(`${url_refund}${id}/`,{
            method:'DELETE',
            mode:'cors',
            credentials:'same-origin',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            }
        })
            .then(res => res.json())
            .then(data =>{
                alert(data.message)
                location.reload()
            })
            .catch(err => console.log(err))
        
    }
})

const profit = document.querySelector('.listProfit')

const url_profit = 'http://127.0.0.1:5000/profit/'

let render = ''
const displayProfit = (x) =>{
    render += `
    <h2 style="color:#1e88e5;">Rp.${x.Total_profit}</h2>`

    profit.innerHTML = render
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

const header = new Headers()
const cookies = getCookie('token')
header.set('x-access-token', cookies)

fetch(url_profit,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayProfit(data[0]))

// jumlah user
const sum_user = document.querySelector('.sumUser')
const url_sum_user = 'http://127.0.0.1:5000/sumuser/'


let render1 = ''
const displaySumUser = (x) =>{
    render1 += `
    <h2 style="color:#1e88e5;">${x.jumlah_user}</h2>`

    sum_user.innerHTML = render1
}

fetch(url_sum_user,{
    mode:'cors',
    headers: header
})
    .then(res => res.json())
    .then(data => displaySumUser(data[0]))

// jumlah order
const sum_order = document.querySelector('.listOrder')
const url_sum_order = 'http://127.0.0.1:5000/sumorder/'

let render2 = ''
const displaySumOrder = (x) =>{
    render2 += `
    <h2 style="color:#1e88e5;">${x.jumlah_order}</h2>`

    sum_order.innerHTML = render2
}

fetch(url_sum_order,{
    mode:'cors',
    headers: header
})
    .then(res => res.json())
    .then(data => displaySumOrder(data[0]))

// get latest user
const latest_user = document.querySelector('.listNewUser')
const url_latest_user = 'http://127.0.0.1:5000/newuser/'

let render3 = ''
const displayNewUser = (isi) =>{
    isi.forEach(x => {
        render3 += `
                <a href="#" class="d-flex align-items-center ">
                    <div class="user-img mb-0"> <span class="round">A</span> <span
                            class="profile-status away pull-right"></span> </div>
                    <div class="mail-contnet">
                        <h5 class="mb-0">${x.nama}</h5> <span
                            class="mail-desc">${x.email}</span>
                    </div>
                </a>`      
    });
    latest_user.innerHTML = render3
}

fetch(url_latest_user,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => {
        // const dataArr = []
        // dataArr.push(data)
        displayNewUser(data)
    })

// get top user
const topUser = document.querySelector('#body-list-topUser')
const url_topUser = 'http://127.0.0.1:5000/topuser/'

let render4 = ''
let counter = 0
const displayTopUser = (isi) =>{
    isi.forEach(x => {
        counter++
        render4 +=`
            <tr>
                <td>${counter}</td>
                <td>${x.nama}</td>
                <td>${x.email}</td>
                <td>${x.username}</td>
                <td class="text-center">${x.jumlah_order}</td>
            </tr>`
    });
    topUser.innerHTML = render4
}

fetch(url_topUser,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayTopUser(data))

// get top schedule
const topSchedule = document.querySelector('#body-list-topSchedule')
const url_topSchedule = 'http://127.0.0.1:5000/topschedule/'

let render5 = ''
let counter1 = 0
const displayTopSchedule = (isi) =>{
    isi.forEach(x => {
        counter1++
        render5 +=`
            <tr>
                <td>${counter1}</td>
                <td>${x.tanggal}</td>
                <td>${x.hari}</td>
                <td class="text-center">${x.total}</td>
            </tr>`
    });
    topSchedule.innerHTML = render5
}

fetch(url_topSchedule,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayTopSchedule(data))

// get top rute
const topRute = document.querySelector('#body-list-topRute')
const url_topRute ='http://127.0.0.1:5000/toprute/'

let render6 = ''
let counter2 = 0
const displayTopRute = (isi) =>{
    isi.forEach(x => {
        counter2++
        render6 +=`
            <tr>
                <td>${counter2}</td>
                <td>${x.kota_asal}</td>
                <td>${x.kota_tujuan}</td>
                <td class="text-center">${x.total}</td>
            </tr>`
    });
    topRute.innerHTML = render6
}

fetch(url_topRute,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayTopRute(data))


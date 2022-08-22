const user = document.querySelector('.listCardUser')
const isiform = document.querySelector('.listform')
const url_solo = 'http://127.0.0.1:5000/users'

// alert

const alertInfo = document.querySelector('.alert-berhasil')
let render_alert =''
const displayAlert = () =>{
    render_alert +=`
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
    </svg>
    <div class="alert alert-info d-flex align-items-center" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
        <div>
            Berhasil update data!
        </div>
    </div>`

    alertInfo.innerHTML = render_alert
}


let render = ''
const displaytoHtml = (x) =>{
    render += `
    <center class="mt-4"> <img src="../assets/images/users/5.jpg"
            class="rounded-circle" width="150" />
        <h4 class="card-title mt-2">${x.nama}</h4>
        <h6 class="card-subtitle">Accoubts Manager Amix corp</h6>
        <div class="row justify-content-center">
            <div class="col-4 text-start">
                <span>Orderan</span>
            </div>
            <div class="col-4 text-end ps-0 pe-0">
                <span class="value-digit">${x.orderan}</span>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-4 text-start">
                <span>Saldo</span>
            </div>
            <div class="col-4 text-end ps-0 pe-0">
                <span class="value-digit">${x.saldo}</span>
            </div>
        </div>
    </center>`

    user.innerHTML = render
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
fetch(url_solo,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displaytoHtml(data))
    .catch(err =>{
        console.log(err)
    })

let display = ''
const displayhtml = (i) =>{
    display += `
    <div class="form-group">
        <label class="col-md-12 mb-0">Full Name</label>
        <div class="col-md-12">
            <input type="text" value="${i.nama}"
                class="form-control ps-0 form-control-line tombol fullname" disabled>
        </div>
    </div>
    <div class="form-group">
        <label for="example-email" class="col-md-12">Email</label>
        <div class="col-md-12">
            <input type="email" value="${i.email}"
                class="form-control ps-0 form-control-line tombol email"  name="example-email"
                id="example-email" disabled>
        </div>
    </div>
    <div class="form-group">
        <label class="col-md-12 mb-0">Username</label>
        <div class="col-md-12">
            <input type="text" value="${i.username}"
                class="form-control ps-0 form-control-line tombol username" id="username" disabled>
        </div>
    </div>
    <div class="form-group mt-4">
        <div class="row">
            <div class="col text-end">
            <button class="btn btn-success mx-auto mx-md-0 text-white" id="Editbutton">Edit</button>
                <button class="btn btn-success mx-auto mx-md-0 text-white" id="updatebutton">Update
                    Profile</button>
            </div>
        </div>
    </div>`

    isiform.innerHTML = display
}

// get request
fetch(url_solo,{
    mode:'cors',
    headers:header
})
    .then(res => res.json())
    .then(data => displayhtml(data))
    .catch(err =>{
        console.log(err)
    })

const url = 'http://127.0.0.1:5000/user/'

isiform.addEventListener('click', (e) =>{
    e.preventDefault()
    const edit = e.target.id == 'Editbutton'
    const update = e.target.id == 'updatebutton'
    
    if(edit){
        const container = e.target.parentElement.parentElement.parentElement.parentElement
        const input = container.querySelectorAll('.tombol')
        input.forEach(x => {
            x.removeAttribute('disabled')
        });
    }
    let fullname = isiform.querySelector('.fullname').value
    let email = isiform.querySelector('.email').value
    let usernames = isiform.querySelector('.username').value

    if(update){
        const container = e.target.parentElement.parentElement.parentElement.parentElement
        const input = container.querySelectorAll('.tombol')
        input.forEach(x => {
            x.setAttribute('disabled','')
        });

        fetch(url,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json',
                'x-access-token':cookies
            },
            body:JSON.stringify({
                'nama':fullname,
                'email':email,
                'username':usernames
            })
        })
        .then(res => res.json())
        .then(() => {
            displayAlert()
            setTimeout(()=>{
                alertInfo.innerHTML=''
            }, 2000);
        })
        .catch(err =>{
            console.log(err)
        })
    }
    
})


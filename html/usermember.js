const topUpBtn = document.querySelector('#topupBtn')
const inputTopUpValue = document.querySelector('#inputTopupValue')

const url_topUp = 'http://127.0.0.1:5000/topup/'

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

header.set('x-access-token', cookies)

topUpBtn.addEventListener('click', (e) =>{
    e.preventDefault()
    console.log(typeof(inputTopUpValue.value))
    fetch(url_topUp,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json',
            'x-access-token':cookies
        },
        body:JSON.stringify({
            topup:Number(inputTopUpValue.value)
        })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message)
            location.reload()
        })

})
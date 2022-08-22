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
  }



const loginButton = document.querySelector('.login')
const signIn = document.querySelector('.signIn')
const account = document.querySelector('.account')
const keluar = document.querySelector('.logout')

const cookie = getCookie('token')
if(cookie == null){
    loginButton.removeAttribute('hidden')
    signIn.removeAttribute('hidden')
}
else{
    account.removeAttribute('hidden')
}

signIn.addEventListener('click',() =>{
    window.location.href="login.html"
})

function delete_cookies(){
    document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;"
}

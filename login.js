const usernames = document.querySelector('#form2Example1')
const passwords = document.querySelector('#form2Example2')
const buttonsubmit = document.querySelector('#submit')
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const inputName = document.querySelector("#inputFullname");
const inputUsername = document.querySelector("#inputUsername");
const inputEmail = document.querySelector("#inputEmail");
const inputPass = document.querySelector("#inputPassword");
const regisButton = document.querySelector("#signInButton")

const url = 'http://127.0.0.1:5000/login/'
const url_regis = 'http://127.0.0.1:5000/user/'


sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});

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

buttonsubmit.addEventListener('click', () =>{
    fetch(url,{
        method:"POST",
        mode:"cors",
        credentials:"include",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username : usernames.value,
            password : passwords.value,
        }),
    })
        .then(res => 
          res.text()          
        )
        .then(data => {
            const status = getCookie('token')
            if(!(status)){
              alert('invalid password or username')
            }
            const final = JSON.parse(atob(status.split('.')[1]))
            final.is_admin == true ? window.location.href='/html/index.html' : window.location.href='main.html'
        })
    
})

// post methods for user registration
regisButton.addEventListener('click', (e) =>{
  e.preventDefault()
  fetch(url_regis,{
    method:'POST',
    mode:'cors',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      name:inputName.value,
      email:inputEmail.value,
      username:inputUsername.value,
      password:inputPass.value
    })
  })
    .then(res => res.json())
    .then(() => window.location.href='login.html')
    .catch(err =>{
      console.log(err)
    })
})



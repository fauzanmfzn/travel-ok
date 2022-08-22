// ganti warna navbar ketika di scroll
let navbar = document.querySelector('#navbar')
window.addEventListener('scroll', () =>{
    let a = window.scrollY
    // console.log(navbar)
    if (a>50){
        navbar.classList.add('changesHeader')
        navbar.classList.remove('bg-transparants')
    }else{
        navbar.classList.remove('changesHeader')

    }
})


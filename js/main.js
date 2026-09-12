const botonesCarrito = document.querySelectorAll(".agregar-carrito");

botonesCarrito.forEach(function (boton) {

    boton.addEventListener("click", function () {

        const nombreProducto = boton.dataset.nombre;

        // Evita guardar productos sin nombre
        if (!nombreProducto) {
            alert("Error: el producto no tiene nombre");
            return;
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        carrito.push(nombreProducto);

        localStorage.setItem("carrito", JSON.stringify(carrito));

        alert(nombreProducto + " agregado al carrito");

    });

});


const listaCarrito = document.querySelector("#lista-carrito");
const mensajeCarrito = document.querySelector("#carrito-vacio");

if (listaCarrito) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Elimina productos vacíos que hayan quedado guardados antes
    carrito = carrito.filter(function (producto) {
        return producto;
    });

    if (carrito.length > 0) {

        mensajeCarrito.style.display = "none";

        carrito.forEach(function (producto) {

            const elemento = document.createElement("li");

            elemento.textContent = producto;

            listaCarrito.appendChild(elemento);

        });

    }

}


const botonVaciar = document.querySelector("#vaciar-carrito");

if (botonVaciar) {

    botonVaciar.addEventListener("click", function () {

        localStorage.removeItem("carrito");

        location.reload();

    });

}
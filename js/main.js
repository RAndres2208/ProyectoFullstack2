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

const formulario = document.querySelector("#form-contacto");

if (formulario) {

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        const nombre = document.querySelector("#nombre");
        const correo = document.querySelector("#correo");
        const telefono = document.querySelector("#telefono");
        const mensaje = document.querySelector("#mensaje");

        const errorNombre = document.querySelector("#error-nombre");
        const errorCorreo = document.querySelector("#error-correo");
        const errorTelefono = document.querySelector("#error-telefono");
        const errorMensaje = document.querySelector("#error-mensaje");

        let formularioCorrecto = true;

        errorNombre.textContent = "";
        errorCorreo.textContent = "";
        errorTelefono.textContent = "";
        errorMensaje.textContent = "";

        if (nombre.value.trim() === "") {

            errorNombre.textContent = "Debe ingresar su nombre.";
            formularioCorrecto = false;

        }

        if (correo.value.trim() === "") {

            errorCorreo.textContent = "Debe ingresar su correo.";
            formularioCorrecto = false;

        } else if (!correo.value.includes("@")) {

            errorCorreo.textContent = "Ingrese un correo válido.";
            formularioCorrecto = false;

        }

        if (telefono.value.trim() === "") {

            errorTelefono.textContent = "Debe ingresar su teléfono.";
            formularioCorrecto = false;

        } else if (isNaN(telefono.value)) {

            errorTelefono.textContent = "El teléfono solo debe contener números.";
            formularioCorrecto = false;

        }

        if (mensaje.value.trim() === "") {

            errorMensaje.textContent = "Debe escribir un mensaje.";
            formularioCorrecto = false;

        }

        if (formularioCorrecto) {

            alert("Formulario enviado correctamente.");

            formulario.reset();

        }

    });

}
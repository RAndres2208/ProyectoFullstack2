import { Link, Route, Router, Switch } from "wouter";
import { Menu } from "./components/menu/Menu";
import { Footer } from "./components/footer/Footer";
import { Home } from "./pages/home/Home";
import { Products } from "./pages/products/Products";
import { Cart } from "./pages/cart/Cart";
import { Contact } from "./pages/contact/Contact";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { CartProvider } from "./context/CartProvider";
import { Login } from "./pages/login/Login";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-layout">
          <Menu />

          <div className="app-content">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/productos" component={Products} />
              <Route path="/carrito" component={Cart} />
              <Route path="/contacto" component={Contact} />
              <Route path="/login" component={Login} />

              <Route>
                <h1>Página no encontrada</h1>
                <Link href="/">Volver al inicio</Link>
              </Route>
            </Switch>
          </div>
        </div>

        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;
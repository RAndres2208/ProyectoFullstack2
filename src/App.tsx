import { Route, Router, Switch } from "wouter";
import { Menu } from "./components/menu/Menu";
import { Home } from "./pages/home/Home";
import { Products } from "./pages/products/Products";
import { Cart } from "./pages/cart/Cart";
import { Contact } from "./pages/contact/Contact";
import { CartProvider } from "./context/CartProvider";

function App() {
  return (
    <CartProvider>
      <Router>
        <Menu />

        <Switch>
          <Route path="/" component={Home} />
          <Route path="/productos" component={Products} />
          <Route path="/carrito" component={Cart} />
          <Route path="/contacto" component={Contact} />
        </Switch>
      </Router>
    </CartProvider>
  );
}

export default App;
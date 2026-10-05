import { Route, Router, Switch } from "wouter";
import { Menu } from "./components/menu/Menu";
import { Home } from "./pages/home/Home";
import { Products } from "./pages/products/Products";

function Carrito() {
  return <h2>Carrito</h2>;
}

function Contacto() {
  return <h2>Contacto</h2>;
}

function App() {
  return (
    <Router>
      <Menu />

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/productos" component={Products} />
        <Route path="/carrito" component={Carrito} />
        <Route path="/contacto" component={Contacto} />
      </Switch>
    </Router>
  );
}

export default App;
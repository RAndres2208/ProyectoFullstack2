import { Route, Switch } from "wouter";
import { Login } from "./pages/login/Login";

function Dashboard() {
  return (
    <main className="dashboard-placeholder">
      <h1>Bienvenido a SyncPass</h1>
      <p>El inicio de sesión de demostración funcionó.</p>
      <p>Próximamente construiremos el panel principal.</p>
      <a href="/">Cerrar sesión de demostración</a>
    </main>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />

      <Route>
        <main className="dashboard-placeholder">
          <h1>Página no encontrada</h1>
          <a href="/">Volver al inicio</a>
        </main>
      </Route>
    </Switch>
  );
}

export default App;
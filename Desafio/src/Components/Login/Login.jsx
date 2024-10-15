import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Simule uma verificação de login
    if (username === "admin" && password === "12345") {
      console.log("Dados de Login:", { username, password });

      // Redireciona para a página da dashboard
      window.location.href = "dash.html";
    } else {
      alert("Usuário ou senha incorretos");
    }
  };

  return (
    <div>
      <h1 className="tituloh1">Seja Bem Vindo</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1>Acesse o DataView</h1>
          <h3>A melhor plataforma de monitoramento de dados</h3>
          <div className="input-field">
            <input
              type="text"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className="icon" />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>

          {/* <div className="EsqSenha">
          <a href="#">Esqueceu sua senha?</a>
        </div> */}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      onRegister && onRegister();
    } else {
      setError(data.error || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-blue-500 mb-6">miniTuister</h1>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">Crea tu cuenta</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="p-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="p-3 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">¡Registro exitoso! Ahora puedes iniciar sesión.</div>}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition"
          >
            Registrarse
          </button>
        </form>
        <div className="text-center mt-4 text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
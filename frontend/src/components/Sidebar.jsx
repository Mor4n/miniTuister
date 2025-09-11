import React from "react";

function Sidebar({ onLogout, active, navigate }) {
  return (
    <aside className="w-64 fixed h-full border-r border-gray-800 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400 cursor-pointer" onClick={() => navigate('/')}>miniTuister</h1>
      </div>
      <nav className="space-y-2 flex-1">
        <div className={`flex items-center space-x-3 p-3 rounded-full cursor-pointer transition-colors ${active === 'home' ? 'bg-gray-900 text-blue-400' : 'hover:bg-gray-900'}`} onClick={() => navigate('/') }>
          <span className="text-xl font-medium">Inicio</span>
        </div>
        
        <div className={`flex items-center space-x-3 p-3 rounded-full cursor-pointer transition-colors ${active === 'profile' ? 'bg-gray-900' : 'hover:bg-gray-900'}`} onClick={() => navigate('/profile')}>
          <span className="text-xl font-medium">Perfil</span>
        </div>
      </nav>
      {onLogout && (
        <button onClick={onLogout} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full mt-8 transition-colors">
          Cerrar sesión
        </button>
      )}
    </aside>
  );
}

export default Sidebar;

import React, { useEffect, useState } from "react";

const Notifications = ({ user_id }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id) return;

    fetch(`http://localhost:3000/notifications/${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user_id]);

  if (loading) return <div className="p-4 text-gray-400">Cargando notificaciones...</div>;

  if (notifications.length === 0)
    return <div className="p-4 text-gray-400">No tienes notificaciones aún.</div>;

  return (
    <div className="p-4 space-y-4">
      {notifications.map((n) => (
        <div key={n.id} className="bg-gray-900 p-3 rounded-lg">
          <p className="text-white">{n.message}</p>
          <p className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
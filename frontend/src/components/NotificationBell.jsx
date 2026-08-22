import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { Bell, Check, ExternalLink, Award, AlertTriangle, Megaphone, Info } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await API.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await API.put("/notifications/" + notif.id + "/read");
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Error marking notif read:", err);
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "CERTIFICATE":
        return <Award size={18} className="text-amber-500" />;
      case "ALERT":
        return <AlertTriangle size={18} className="text-red-500" />;
      case "ANNOUNCEMENT":
        return <Megaphone size={18} className="text-purple-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">We will alert you about upcoming events and certificates.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={"p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3 items-start " + (!n.isRead ? "bg-blue-50/50" : "")}
                >
                  <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className={"text-xs font-bold truncate " + (!n.isRead ? "text-gray-900" : "text-gray-700")}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {n.link && (
                        <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 hover:underline">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Bell, BellOff, Trash2, ShieldAlert, Cpu, Wrench, Megaphone, UserCheck } from "lucide-react";

// Local Notification type to avoid missing import error
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string | number | Date;
  isRead: boolean;
}

interface NotificationDrawerProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onReadAll: () => void;
  onDelete: (id: string) => void;
}

export default function NotificationDrawer({
  notifications,
  isOpen,
  onClose,
  onReadAll,
  onDelete
}: NotificationDrawerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return <Wrench className="w-4 h-4 text-rose-600" />;
      case "announcement":
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case "visitor":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "complaint":
        return "bg-rose-50 border-rose-100";
      case "announcement":
        return "bg-amber-50 border-amber-100";
      case "visitor":
        return "bg-emerald-50 border-emerald-100";
      default:
        return "bg-sky-50 border-sky-100";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black z-40 cursor-pointer rounded-[40px] pointer-events-auto"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-neutral-100 shadow-2xl z-50 max-h-[75%] flex flex-col pointer-events-auto"
          >
            {/* Grab Handle */}
            <div className="flex justify-center py-2.5">
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 border-b border-neutral-50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg text-neutral-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-emerald" />
                  Society Notifications
                </h3>
                <p className="text-xs text-neutral-500">
                  {unreadCount} unread alert{unreadCount !== 1 && "s"} received
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={onReadAll}
                    className="p-2 text-xs text-brand-emerald hover:bg-neutral-50 active:bg-neutral-100 rounded-full font-medium transition-colors flex items-center gap-1"
                    title="Mark all read"
                  >
                    <Check className="w-4 h-4" />
                    Read All
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 bg-neutral-50 rounded-full text-neutral-500 hover:text-neutral-800 transition-colors"
                  title="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Lists */}
            <div className="overflow-y-auto no-scrollbar flex-1 p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <BellOff className="w-12 h-12 text-neutral-300 mb-2.5" />
                  <p className="font-display font-medium text-neutral-600 text-sm">All Quiet on the Front!</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">You have no recent notifications or booking alert updates.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((not) => (
                    <motion.div
                      key={not.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-3.5 rounded-xl border flex gap-3 relative transition-all ${getBgColor(not.type)} ${
                        !not.isRead ? "shadow-sm font-semibold" : "opacity-80"
                      }`}
                    >
                      {/* Read Indicator */}
                      {!not.isRead && (
                        <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-brand-emerald rounded-full ping-animation" />
                      )}

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-neutral-100/50 shrink-0 shadow-sm">
                        {getIcon(not.type)}
                      </div>

                      {/* Data Details */}
                      <div className="flex-1 pr-6">
                        <div className="flex items-baseline justify-between">
                          <h4 className="text-xs font-semibold text-neutral-800">{not.title}</h4>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {new Date(not.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-normal text-neutral-600 mt-1 leading-relaxed">
                          {not.message}
                        </p>
                      </div>

                      {/* Delete Action Banner */}
                      <button
                        onClick={() => onDelete(not.id)}
                        className="text-neutral-400 hover:text-rose-600 active:scale-95 absolute bottom-3 right-3 p-1 rounded transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Quick Helper Notice */}
            <div className="p-3.5 bg-neutral-50/50 border-t border-neutral-100 text-center flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-mono">
              <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
              <span>PANCHAYAT REALTIME DESPATCH KERNEL</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import ChatBox from "./ChatBox";
import { X } from "lucide-react";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Nút mở/đóng */}
      <div className="fixed bottom-5 right-5 z-[1000]">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="w-16 h-16 rounded-full overflow-hidden shadow-lg hover:scale-105 transition-all duration-300"
          >
            <img
              src="https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png"
              alt="Chatbot"
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-300"
            title="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Hộp chat nổi */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-[999] bg-white border border-gray-300 shadow-2xl rounded-xl animate-slide-up"
          style={{ width: "380px", height: "580px" }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a1f]/90 text-white rounded-t-xl">
            <img
              src="https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png"
              alt="Bot Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="font-semibold">
              TP.Cosmic Store Chat Assistant
            </span>
          </div>

          <ChatBox />
        </div>
      )}
    </>
  );
};

export default ChatWidget;

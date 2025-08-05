import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { SendHorizonal } from "lucide-react";

const allSuggestions = [
  "Shop có hỗ trợ giao hàng?",
  "Tôi muốn tư vấn sản phẩm",
  "Chính sách đổi trả như thế nào?",
];

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [remainingSuggestions, setRemainingSuggestions] =
    useState(allSuggestions);
  const messageEndRef = useRef(null);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);

    // Xoá gợi ý đã chọn khỏi danh sách còn lại
    if (allSuggestions.includes(messageText)) {
      setRemainingSuggestions((prev) => prev.filter((s) => s !== messageText));
    }

    try {
      const response = await axios.post("/api/chatbot", {
        message: messageText,
      });
      const { response: botReply, product } = response.data;

      const botMessage = { sender: "bot", text: botReply, product };
      setMessages((prev) => [...prev, botMessage]);

      if (!text) setInput("");
    } catch (error) {
      console.error("Chatbot error:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[520px] w-[380px] text-sm bg-white rounded-b-xl shadow-lg">
      {/* Gợi ý ban đầu */}
      {remainingSuggestions.length > 0 && (
        <div className="p-3 flex flex-wrap justify-center gap-2 border-b border-gray-200 bg-white z-10">
          {remainingSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="bg-gradient-to-r from-[#1a1a2e] via-[#360f92] to-[#475fc7] text-white px-4 py-2 rounded-full shadow hover:brightness-110 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col space-y-1 ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-[#0a0a1f]/90 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>

            {/* Nếu có sản phẩm được bot đề xuất */}
            {msg.sender === "bot" && msg.product && (
              <div className="mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
                <a
                  href={msg.product.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block transition hover:shadow-md rounded-xl border border-gray-200 overflow-hidden"
                >
                  <img
                    src={msg.product.image}
                    alt={msg.product.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-3 space-y-1">
                    <h4 className="font-semibold text-base text-gray-800 line-clamp-2">
                      {msg.product.name}
                    </h4>
                    <div className="text-green-600 font-medium text-sm">
                      ${msg.product.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600 hover:underline">
                      🔎 View detail
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        ))}

        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter message..."
        />
        <button
          type="submit"
          className="p-2 bg-[#0a0a1f]/90 text-white rounded hover:bg-blue-600 transition"
        >
          <SendHorizonal size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

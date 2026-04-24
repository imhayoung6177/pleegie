import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/user/ChatbotPage.css"; // 전용 CSS

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", text: "안녕하세요! Pleegie AI 챗봇입니다. 🍎\n냉장고 재료 관리나 레시피, 시장 할인 정보에 대해 무엇이든 물어보세요!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // ✅ AI 응답 시뮬레이션 (나중에 /api/chatbot API와 연동)
    setTimeout(() => {
      let botResponse = "죄송해요, 아직 학습 중인 내용이에요. 냉장고 재료를 말씀해주시면 레시피를 추천해드릴 수 있어요!";
      
      if (input.includes("레시피")) botResponse = "현재 냉장고에 있는 계란과 파를 이용해 '계란볶음밥'을 만드시는 건 어떨까요? 상세 페이지에서 조리 순서를 확인할 수 있습니다!";
      if (input.includes("할인")) botResponse = "근처 '동네 정육점'에서 오늘 돼지고기를 20% 할인 판매 중이에요! 장바구니에 담으시겠어요?";
      if (input.includes("고마워")) botResponse = "별말씀을요! 맛있는 요리 시간 되세요. 😊";

      const botMsg = { id: Date.now() + 1, type: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="auth-bg"> {/* 로그인 페이지와 배경 통일 */}
      <div className="chat-card anim-pop"> {/* 로그인 카드 스타일 계승 */}
        
        {/* 상단 헤더 */}
        <div className="chat-header">
          <button className="chat-back-btn" onClick={() => navigate(-1)}>←</button>
          <div className="chat-header-info">
            <span className="chat-bot-status">●</span>
            <h2 className="chat-title">Pleegie AI 가이드</h2>
          </div>
          <button className="chat-close-btn" onClick={() => navigate("/user/fridge")}>✕</button>
        </div>

        {/* 채팅 영역 */}
        <div className="chat-body" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.type}`}>
              {msg.type === "bot" && <div className="bot-avatar">🤖</div>}
              <div className={`chat-bubble ${msg.type}`}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-wrap bot">
              <div className="bot-avatar">🤖</div>
              <div className="chat-bubble bot typing">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <form className="chat-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="메시지를 입력하세요..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
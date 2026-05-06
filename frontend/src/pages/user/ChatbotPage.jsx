import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Styles/user/ChatbotPage.css";

const ChatbotPage = () => {
  const navigate = useNavigate();

  // ✅ 로그인한 사용자 ID로 sessionId 생성 (localStorage에서 꺼냄)
  const userId = localStorage.getItem("userId") || "guest";
  const sessionId = `user_${userId}`;

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "안녕하세요! Pleegie AI 챗봇입니다. \n냉장고 재료 관리나 레시피, 시장 할인 정보에 대해 무엇이든 물어보세요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 메시지 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ✅ 백엔드 응답(data)에서 텍스트 추출하는 함수
  // ChatService의 switch-case 반환 타입이 다양하므로 유연하게 처리
  const extractBotText = (data) => {
    if (!data) return "응답을 받지 못했어요. 다시 시도해주세요.";

    // 일반 문자열인 경우 (default 챗봇 응답)
    if (typeof data === "string") return data;

    // AiRouterResponse 객체인 경우 { intent, message, data }
    if (data.message) return data.message;

    // RecipeRecommendResponse 등 리스트인 경우
    if (Array.isArray(data)) {
      return `추천 레시피 ${data.length}개를 찾았어요!\n` +
        data.map((recipe, i) => `${i + 1}. ${recipe.name || recipe.title || JSON.stringify(recipe)}`).join("\n");
    }

    return "응답 형식을 처리할 수 없어요.";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 즉시 화면에 추가
    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input; // 비동기 처리 중 input이 초기화되므로 저장
    setInput("");
    setIsTyping(true);

    try {
      // ✅ 실제 Spring Boot 백엔드 API 호출
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        // "http://localhost:8080/chatbot",  // ✅ 주소를 명확하게 8080으로 수정
        "/chatbot",  // Spring Boot: POST /chatbot
        {
          message: currentInput,
          sessionId: sessionId,  // FastAPI 세션 관리용
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ 백엔드 공통 응답 구조: { success: true, data: { ... } }
      const responseData = response.data?.data;
      const botText = extractBotText(responseData);

      const botMsg = { id: Date.now() + 1, type: "bot", text: botText };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
  console.error("Chatbot API Error:", error);

  let errorText = "서버와 연결이 원활하지 않습니다.";
  
  if (error.response?.status === 429 || error.response?.data?.message?.includes("Quota")) {
    errorText = "AI가 지금 너무 많은 요청을 받고 있어요. 잠시만 쉬었다가 다시 말을 걸어주세요! ";
  } else if (error.response?.status === 500) {
    errorText = "죄송합니다 ! 잠시 후 다시 시도해주세요.";
  }
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "bot", text: errorText },
      ]);
    } finally {
      // 성공/실패 모두 타이핑 인디케이터 제거
      setIsTyping(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="chat-card anim-pop">

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
                {/* ✅ white-space: pre-wrap 대신 줄바꿈 처리 */}
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}

          {/* 타이핑 인디케이터 */}
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
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isTyping}>
            전송
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatbotPage;
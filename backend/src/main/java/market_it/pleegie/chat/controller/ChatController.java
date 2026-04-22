package market_it.pleegie.chat.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.chat.dto.AiRouterResponse;
import market_it.pleegie.chat.dto.ChatRequest;
import market_it.pleegie.chat.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chatbot")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<AiRouterResponse> chat(@RequestBody ChatRequest request){
        return ResponseEntity.ok(chatService.chat(request));
    }
}

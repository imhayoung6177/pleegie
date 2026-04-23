package market_it.pleegie.chat.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.chat.dto.AiRouterResponse;
import market_it.pleegie.chat.dto.ChatRequest;
import market_it.pleegie.chat.service.ChatService;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chatbot")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<AiRouterResponse>> chat(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChatRequest request){
        return ResponseEntity.ok(ApiResponse.ok(chatService.chat(
                userDetails.getUserId(), request
        )));
    }
}

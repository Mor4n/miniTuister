using Newtonsoft.Json;

namespace GorkService.Models
{
    public class ChatRequest
    {
        [JsonProperty("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonProperty("conversation_id")]
        public string? ConversationId { get; set; }
    }

    public class ChatResponse
    {
        [JsonProperty("response")]
        public string Response { get; set; } = string.Empty;
        
        [JsonProperty("conversation_id")]
        public string ConversationId { get; set; } = string.Empty;
        
        [JsonProperty("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    // Modelos para OpenRouter API
    public class OpenRouterRequest
    {
        [JsonProperty("model")]
        public string Model { get; set; } = "anthropic/claude-3.5-sonnet";
        
        [JsonProperty("messages")]
        public List<OpenRouterMessage> Messages { get; set; } = new();
        
        [JsonProperty("max_tokens")]
        public int MaxTokens { get; set; } = 1000;
        
        [JsonProperty("temperature")]
        public double Temperature { get; set; } = 0.7;
    }

    public class OpenRouterMessage
    {
        [JsonProperty("role")]
        public string Role { get; set; } = string.Empty;
        
        [JsonProperty("content")]
        public string Content { get; set; } = string.Empty;
    }

    public class OpenRouterResponse
    {
        [JsonProperty("choices")]
        public List<OpenRouterChoice> Choices { get; set; } = new();
        
        [JsonProperty("usage")]
        public OpenRouterUsage? Usage { get; set; }
    }

    public class OpenRouterChoice
    {
        [JsonProperty("message")]
        public OpenRouterMessage Message { get; set; } = new();
        
        [JsonProperty("finish_reason")]
        public string FinishReason { get; set; } = string.Empty;
    }

    public class OpenRouterUsage
    {
        [JsonProperty("prompt_tokens")]
        public int PromptTokens { get; set; }
        
        [JsonProperty("completion_tokens")]
        public int CompletionTokens { get; set; }
        
        [JsonProperty("total_tokens")]
        public int TotalTokens { get; set; }
    }
}

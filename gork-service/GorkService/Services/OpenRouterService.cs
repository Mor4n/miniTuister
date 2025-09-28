using GorkService.Models;
using Newtonsoft.Json;
using System.Text;

namespace GorkService.Services
{
    public interface IOpenRouterService
    {
        Task<string> SendMessageAsync(string message, List<OpenRouterMessage>? conversationHistory = null);
    }

    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenRouterService> _logger;

        public OpenRouterService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenRouterService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> SendMessageAsync(string message, List<OpenRouterMessage>? conversationHistory = null)
        {
            try
            {
                var apiKey = _configuration["OpenRouter:ApiKey"];
                var apiUrl = _configuration["OpenRouter:ApiUrl"];

                if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_OPENROUTER_API_KEY_HERE")
                {
                    _logger.LogWarning("OpenRouter API key not configured");
                    return "Lo siento, no tengo configurada mi API key. Por favor configura tu clave de OpenRouter.";
                }

                // Preparar mensajes de conversación
                var messages = new List<OpenRouterMessage>();
                
                // Agregar mensaje de sistema
                messages.Add(new OpenRouterMessage
                {
                    Role = "system",
                    Content = "Eres Gork, un asistente de IA inteligente y útil para una red social llamada miniTuister. Responde de manera amigable, y en español mexicano."
                });

                // Agregar historial de conversación si existe
                if (conversationHistory != null && conversationHistory.Any())
                {
                    messages.AddRange(conversationHistory);
                }

                // Agregar mensaje actual del usuario
                messages.Add(new OpenRouterMessage
                {
                    Role = "user",
                    Content = message
                });

                var request = new OpenRouterRequest
                {
                    Model = _configuration["OpenRouter:Model"] ?? "x-ai/grok-4-fast:free", // Usar Grok desde configuración
                    Messages = messages,
                    MaxTokens = 1000,
                    Temperature = 0.7
                };

                var json = JsonConvert.SerializeObject(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "https://miniTuister.com");
                _httpClient.DefaultRequestHeaders.Add("X-Title", "miniTuister - Gork");

                _logger.LogInformation($"Sending request to OpenRouter: {message}");

                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"OpenRouter API error: {response.StatusCode} - {responseContent}");
                    return "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor intenta de nuevo.";
                }

                var openRouterResponse = JsonConvert.DeserializeObject<OpenRouterResponse>(responseContent);
                
                if (openRouterResponse?.Choices?.Any() == true)
                {
                    var botResponse = openRouterResponse.Choices[0].Message.Content;
                    _logger.LogInformation($"Received response from OpenRouter: {botResponse}");
                    return botResponse;
                }

                _logger.LogWarning("No choices in OpenRouter response");
                return "Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenRouter API");
                return "Lo siento, ha ocurrido un error interno. Por favor intenta de nuevo más tarde.";
            }
        }
    }
}
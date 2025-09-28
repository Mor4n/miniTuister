using Microsoft.AspNetCore.Mvc;
using GorkService.Models;
using GorkService.Services;

namespace GorkService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GorkController : ControllerBase
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly ILogger<GorkController> _logger;

        public GorkController(IOpenRouterService openRouterService, ILogger<GorkController> logger)
        {
            _openRouterService = openRouterService;
            _logger = logger;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<ChatResponse>> Chat([FromBody] ChatRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest(new { error = "El mensaje no puede estar vacío" });
                }

                _logger.LogInformation($"Received chat request: {request.Message}");

                var response = await _openRouterService.SendMessageAsync(request.Message);

                var chatResponse = new ChatResponse
                {
                    Response = response,
                    ConversationId = request.ConversationId ?? Guid.NewGuid().ToString(),
                    Timestamp = DateTime.UtcNow
                };

                return Ok(chatResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat request");
                return StatusCode(500, new { error = "Error interno del servidor" });
            }
        }

        [HttpGet("health")]
        public ActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }

        [HttpGet("models")]
        public ActionResult GetAvailableModels()
        {
            var models = new[]
            {
                new { id = "x-ai/grok-4-fast:free", name = "Grok 4 Fast (Free)", provider = "xAI", active = true },
                new { id = "anthropic/claude-3.5-sonnet", name = "Claude 3.5 Sonnet", provider = "Anthropic", active = false },
                new { id = "openai/gpt-4", name = "GPT-4", provider = "OpenAI", active = false },
                new { id = "openai/gpt-3.5-turbo", name = "GPT-3.5 Turbo", provider = "OpenAI", active = false },
                new { id = "meta-llama/llama-3.1-8b-instruct", name = "Llama 3.1 8B", provider = "Meta", active = false }
            };

            return Ok(new { models });
        }
    }
}

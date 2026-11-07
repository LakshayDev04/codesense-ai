
const AI_PROVIDER = process.env.AI_PROVIDER || "ollama";

const OLLAMA_URL =
    process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL || "qwen2.5-coder:3b";

const GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-20b";

async function generateChatCompletion(messages) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 120000);

    try {
        let response;
        let data;

        if (AI_PROVIDER === "groq") {
            if (!process.env.GROQ_API_KEY) {
                throw new Error("GROQ_API_KEY is not configured.");
            }

            response = await fetch(GROQ_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages
                }),
                signal: controller.signal
            });

            data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error?.message || "Groq request failed."
                );
            }

            return {
                reply: data.choices?.[0]?.message?.content,
                model: GROQ_MODEL,
                provider: "groq"
            };
        }

        if (AI_PROVIDER !== "ollama") {
            throw new Error("Unsupported AI provider.");
        }

        response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages,
                stream: false
            }),
            signal: controller.signal
        });

        data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Ollama request failed."
            );
        }

        return {
            reply: data.message?.content,
            model: OLLAMA_MODEL,
            provider: "ollama"
        };

    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    generateChatCompletion
};

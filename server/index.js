const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-5-mini";
const accentPalette = ["#C98706", "#DA6B1B", "#4C8B77", "#7F6CE0", "#D45A2D"];
const iconPalette = [
  "psychology",
  "flare",
  "travel-explore",
  "savings",
  "lightbulb",
  "straighten",
  "bolt",
];
const generationSteps = [
  "Upload a source",
  "Split it into ideas",
  "Generate lesson cards",
  "Add practice questions",
  "Publish the pack",
];

const packSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "author",
    "category",
    "description",
    "heroLine",
    "minutesPerIdea",
    "coverLabel",
    "coverLines",
    "ideas",
  ],
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    author: { type: "string" },
    category: { type: "string" },
    description: { type: "string" },
    heroLine: { type: "string" },
    minutesPerIdea: { type: "string" },
    coverLabel: { type: "string" },
    coverLines: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    ideas: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "duration",
          "teaser",
          "lessonCards",
          "summaryBullets",
          "reflectionPrompt",
          "practice",
        ],
        properties: {
          title: { type: "string" },
          duration: { type: "string" },
          teaser: { type: "string" },
          lessonCards: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["eyebrow", "title", "body", "support"],
              properties: {
                eyebrow: { type: "string" },
                title: { type: "string" },
                body: { type: "string" },
                support: { type: "string" },
              },
            },
          },
          summaryBullets: {
            type: "array",
            minItems: 3,
            maxItems: 4,
            items: { type: "string" },
          },
          reflectionPrompt: { type: "string" },
          practice: {
            type: "object",
            additionalProperties: false,
            required: ["question", "options", "correctIndex", "explanation"],
            properties: {
              question: { type: "string" },
              options: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
              correctIndex: { type: "integer", minimum: 0, maximum: 2 },
              explanation: { type: "string" },
            },
          },
        },
      },
    },
  },
};

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function trimText(value, fallback) {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function normalizeCoverLines(lines, title) {
  const fromModel = Array.isArray(lines)
    ? lines.map((line) => trimText(line, "")).filter(Boolean).slice(0, 3)
    : [];

  if (fromModel.length === 3) {
    return fromModel;
  }

  const words = trimText(title, "AI Generated Pack").split(" ");
  return [
    words.slice(0, 2).join(" ") || "AI",
    words.slice(2, 4).join(" ") || "GENERATED",
    words.slice(4).join(" ") || "PACK",
  ];
}

function normalizePack(rawPack, overrides) {
  const title = trimText(rawPack.title, overrides.title || "AI Learning Pack");
  const packId = slugify(title, `pack-${Date.now()}`);
  const ideas = rawPack.ideas.map((idea, index) => ({
    id: slugify(idea.title, `idea-${index + 1}`),
    title: trimText(idea.title, `Idea ${index + 1}`),
    duration: trimText(idea.duration, "4 min"),
    icon: iconPalette[index % iconPalette.length],
    teaser: trimText(idea.teaser, "A short lesson generated from your source."),
    lessonCards: idea.lessonCards.map((card, cardIndex) => ({
      id: `${slugify(idea.title, `idea-${index + 1}`)}-${cardIndex + 1}`,
      eyebrow: trimText(card.eyebrow, "Key moment"),
      title: trimText(card.title, "Main point"),
      body: trimText(card.body, "This lesson card needs more detail."),
      support: trimText(card.support, "Use the source to pressure-test the idea."),
    })),
    summaryBullets: idea.summaryBullets
      .map((bullet) => trimText(bullet, ""))
      .filter(Boolean)
      .slice(0, 4),
    reflectionPrompt: trimText(
      idea.reflectionPrompt,
      "Where could this idea change a decision you are making?"
    ),
    practice: {
      question: trimText(idea.practice.question, "Which choice best fits the lesson?"),
      options: idea.practice.options.map((option) => trimText(option, "Option")).slice(0, 3),
      correctIndex: Math.max(0, Math.min(2, Number(idea.practice.correctIndex || 0))),
      explanation: trimText(
        idea.practice.explanation,
        "Review the lesson and compare the answer against the missing evidence."
      ),
    },
  }));

  const accent =
    accentPalette[
      title.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) %
        accentPalette.length
    ];

  return {
    id: packId,
    status: "ready",
    title,
    subtitle: trimText(
      rawPack.subtitle,
      "A short lesson pack generated from your source material."
    ),
    author: trimText(rawPack.author, overrides.author || "AI Studio"),
    category: trimText(rawPack.category, overrides.category || "Knowledge"),
    description: trimText(
      rawPack.description,
      "Dense source material reshaped into bite-sized ideas, practical review, and one-question drills."
    ),
    heroLine: trimText(
      rawPack.heroLine,
      "The backend generated a learning pack you can read, review, and practice in one flow."
    ),
    keyIdeaCount: ideas.length,
    minutesPerIdea: trimText(rawPack.minutesPerIdea, "4-5 min"),
    accent,
    icon: iconPalette[0],
    coverLabel: trimText(rawPack.coverLabel, "AI GENERATED"),
    coverLines: normalizeCoverLines(rawPack.coverLines, title),
    generationSteps,
    ideas,
  };
}

function buildPrompt({ title, author, category, sourceText }) {
  return [
    "Transform the source into a mobile-first learning pack.",
    "The audience is busy adults using a short lesson app.",
    "Stay grounded in the source. Do not invent unsupported claims.",
    "Requirements:",
    "- Generate 4 to 6 key ideas.",
    "- Each idea needs exactly 3 lesson cards.",
    "- Keep cards concise, practical, and readable on a phone.",
    "- Summary bullets should feel like takeaways, not repeated paragraphs.",
    "- Practice should have exactly 3 options with one correct answer.",
    "- Use simple, vivid language.",
    "",
    `Requested title hint: ${title || "Use the source to choose a strong title"}`,
    `Requested author hint: ${author || "Use AI Studio if unclear"}`,
    `Requested category hint: ${category || "Choose the best category"}`,
    "",
    "Source material:",
    sourceText,
  ].join("\n");
}

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    configured: Boolean(process.env.OPENAI_API_KEY),
    model,
  });
});

app.post("/api/generate-pack", async (request, response) => {
  const sourceText = trimText(request.body?.sourceText, "");
  const title = trimText(request.body?.title, "");
  const author = trimText(request.body?.author, "");
  const category = trimText(request.body?.category, "");

  if (!sourceText || sourceText.length < 400) {
    response.status(400).json({
      error: "Please provide at least 400 characters of source text.",
    });
    return;
  }

  try {
    const client = getOpenAIClient();
    const generation = await client.responses.create({
      model,
      input: buildPrompt({ title, author, category, sourceText }),
      text: {
        format: {
          type: "json_schema",
          name: "learning_pack",
          schema: packSchema,
          strict: true,
        },
      },
    });

    if (!generation.output_text) {
      throw new Error("OpenAI did not return structured text output.");
    }

    const parsed = JSON.parse(generation.output_text);
    const pack = normalizePack(parsed, { title, author, category });

    response.json({ pack });
  } catch (error) {
    response.status(500).json({
      error: "Failed to generate a pack from the source.",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Brain Bites backend listening on http://localhost:${port}`);
});

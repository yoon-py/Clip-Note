export const learningPacks = [
  {
    id: "thinking-clearly",
    status: "ready",
    title: "The Art of Thinking Clearly",
    subtitle: "Why your brain tricks you into bad decisions",
    author: "Rolf Dobelli",
    category: "Psychology",
    description:
      "Dense ideas become short guided lessons. Learn one bias, review the takeaway, answer one practical question, and move on.",
    heroLine:
      "A reading pack that feels more like a five-minute workout than a chapter summary.",
    keyIdeaCount: 6,
    minutesPerIdea: "4-5 min",
    accent: "#C98706",
    icon: "psychology",
    coverLabel: "BOOK BITE",
    coverLines: ["THE ART OF", "THINKING", "CLEARLY"],
    generationSteps: [
      "Upload a source",
      "Split it into ideas",
      "Generate lesson cards",
      "Add practice questions",
      "Publish the pack"
    ],
    ideas: [
      {
        id: "survivorship-bias",
        title: "Survivorship Bias",
        duration: "5 min",
        icon: "flare",
        teaser:
          "Success stories are loud. The invisible failures usually tell the real story.",
        lessonCards: [
          {
            id: "survivorship-1",
            eyebrow: "Pattern spotting",
            title: "A founder copied the winners",
            body:
              "He studied only successful entrepreneurs and noticed that many had dropped out, worked from home, and taken huge financial risks early on.",
            support:
              "Because those stories were visible, he treated those traits like a formula."
          },
          {
            id: "survivorship-2",
            eyebrow: "What went wrong",
            title: "The failures never made the list",
            body:
              "Thousands of failed founders had tried the very same things, but they were no longer in view. The sample included only survivors.",
            support:
              "That turned common behavior into fake proof."
          },
          {
            id: "survivorship-3",
            eyebrow: "Daily application",
            title: "Visible winners distort your judgment",
            body:
              "Whenever advice comes from a small group of winners, ask which failures were filtered out before the story reached you.",
            support:
              "Missing data is often the most useful data."
          }
        ],
        summaryBullets: [
          "Visible success can hide a huge graveyard of failed attempts.",
          "Traits shared by winners are not automatically success causes.",
          "Always ask what is absent from the sample before copying a pattern.",
          "Use base rates, not just stories, when making a big decision."
        ],
        reflectionPrompt:
          "Where in your life are you copying a winner without seeing the full field?",
        practice: {
          question:
            "You want to open a restaurant because the busy ones in your city always seem packed. What are you missing?",
          options: [
            "The failed restaurants that closed and are no longer visible.",
            "The secret recipes that make those specific places successful.",
            "The fact that restaurants only win with social media marketing."
          ],
          correctIndex: 0,
          explanation:
            "The visible sample contains survivors. The closed restaurants disappeared, so your judgment is skewed toward the winners."
        }
      },
      {
        id: "confirmation-bias",
        title: "Confirmation Bias",
        duration: "4 min",
        icon: "travel-explore",
        teaser:
          "Once you pick a side, your brain starts hiring evidence like a defense lawyer.",
        lessonCards: [
          {
            id: "confirmation-1",
            eyebrow: "The trap",
            title: "You search to feel right",
            body:
              "After forming an opinion, most people stop searching for truth and start searching for support.",
            support:
              "Articles, comments, and examples that agree with us feel smart and efficient."
          },
          {
            id: "confirmation-2",
            eyebrow: "What it costs",
            title: "Contradictory evidence gets filtered out",
            body:
              "Disconfirming evidence feels annoying, so we downplay it, reinterpret it, or never click on it in the first place.",
            support:
              "The result is confidence without calibration."
          },
          {
            id: "confirmation-3",
            eyebrow: "Better move",
            title: "Actively hunt for disproof",
            body:
              "Before making a decision, ask what would convince you that your current view is wrong and then go looking for exactly that.",
            support:
              "A good decision process tries to break the idea before reality does."
          }
        ],
        summaryBullets: [
          "Humans naturally collect agreement and ignore contradiction.",
          "Feeling informed is not the same as being well tested.",
          "Disconfirming evidence is more valuable than supportive evidence.",
          "Create a rule that every important view must survive one serious challenge."
        ],
        reflectionPrompt:
          "What belief are you protecting right now instead of testing?",
        practice: {
          question:
            "You think remote work lowers team quality, so you only save examples of remote teams missing deadlines. What are you doing?",
          options: [
            "Building a balanced case with representative evidence.",
            "Falling into confirmation bias by collecting only supporting examples.",
            "Using survivorship bias because only big teams matter."
          ],
          correctIndex: 1,
          explanation:
            "You are selecting evidence that supports your original view instead of testing it against a fair set of counterexamples."
        }
      },
      {
        id: "sunk-cost-fallacy",
        title: "Sunk Cost Fallacy",
        duration: "4 min",
        icon: "savings",
        teaser:
          "Past effort feels like a reason to continue, even when the future no longer makes sense.",
        lessonCards: [
          {
            id: "sunk-1",
            eyebrow: "Why it happens",
            title: "We hate admitting a loss",
            body:
              "Time, money, and energy already spent create emotional pressure to keep going, even when quitting would be smarter.",
            support:
              "Stopping can feel like wasting the past, even though the past is already gone."
          },
          {
            id: "sunk-2",
            eyebrow: "The hidden question",
            title: "Only the future should matter now",
            body:
              "The real decision is not what you already invested. It is whether you would choose this path again from today, with what you know now.",
            support:
              "If the answer is no, the sunk cost is not a reason to continue."
          },
          {
            id: "sunk-3",
            eyebrow: "Practical reset",
            title: "Re-decide from zero",
            body:
              "Imagine a clean slate: would you buy this stock, keep this project, or stay in this plan if you were starting fresh today?",
            support:
              "That question weakens the emotional grip of old investment."
          }
        ],
        summaryBullets: [
          "Past investment is not a future justification.",
          "Quitting a bad path can be rational, not weak.",
          "Re-deciding from zero helps expose emotional attachment.",
          "Ask whether you would choose the same path again today."
        ],
        reflectionPrompt:
          "What are you still carrying only because you already paid for it?",
        practice: {
          question:
            "You have spent six months on a feature nobody wants. What is the best next question?",
          options: [
            "How can we justify all the effort we already spent?",
            "If we were starting today, would we still build this feature?",
            "Which teammate should defend the original plan?"
          ],
          correctIndex: 1,
          explanation:
            "That question shifts the decision from past cost to future value, which is the only part you can still control."
        }
      },
      {
        id: "availability-bias",
        title: "Availability Bias",
        duration: "5 min",
        icon: "bolt",
        teaser:
          "What is vivid in memory feels more common, more likely, and more important than it really is.",
        lessonCards: [
          {
            id: "availability-1",
            eyebrow: "Mental shortcut",
            title: "Easy recall becomes fake evidence",
            body:
              "Events that are recent, emotional, or dramatic come to mind quickly, so the brain mistakes recall speed for probability.",
            support:
              "The easier it is to remember, the more real and frequent it feels."
          },
          {
            id: "availability-2",
            eyebrow: "Where it shows up",
            title: "News coverage warps your sense of risk",
            body:
              "A heavily covered event can dominate your perception even when the actual odds are small compared with boring everyday risks.",
            support:
              "Your attention follows stories, not base rates."
          },
          {
            id: "availability-3",
            eyebrow: "Countermove",
            title: "Replace memory with numbers",
            body:
              "When a decision matters, stop asking what examples come to mind and start asking what the actual frequency data says.",
            support:
              "Numbers are slower, but they are usually calmer and more accurate."
          }
        ],
        summaryBullets: [
          "Vivid stories feel common even when they are rare.",
          "Memory is shaped by emotion, repetition, and media attention.",
          "Important decisions need rates, not impressions.",
          "Ask for the denominator whenever a scary example appears."
        ],
        reflectionPrompt:
          "Which risk feels huge mainly because it is easy to imagine?",
        practice: {
          question:
            "After seeing several posts about startup layoffs, you assume every tech company is about to collapse. Which bias is strongest here?",
          options: [
            "Availability bias because recent vivid examples feel universal.",
            "Sunk cost fallacy because layoffs are expensive.",
            "Halo effect because brands look trustworthy."
          ],
          correctIndex: 0,
          explanation:
            "Recent, memorable examples are dominating your estimate of how common the event really is."
        }
      },
      {
        id: "halo-effect",
        title: "Halo Effect",
        duration: "4 min",
        icon: "lightbulb",
        teaser:
          "One strong trait can spill over and color everything else you think about a person or brand.",
        lessonCards: [
          {
            id: "halo-1",
            eyebrow: "First impression",
            title: "One strength becomes total judgment",
            body:
              "When someone looks polished, confident, or successful in one area, we unconsciously assume they are strong in other areas too.",
            support:
              "The mind prefers one tidy story over a mixed picture."
          },
          {
            id: "halo-2",
            eyebrow: "Why it matters",
            title: "Admiration hides weak spots",
            body:
              "Teams can overlook bad processes, poor ethics, or weak reasoning because the person or company shines in one visible dimension.",
            support:
              "Style and reputation can blur evaluation."
          },
          {
            id: "halo-3",
            eyebrow: "Stronger evaluation",
            title: "Split the scorecard",
            body:
              "Judge communication, strategy, execution, and reliability separately instead of letting one strong impression decide everything.",
            support:
              "Separate categories reduce the spillover effect."
          }
        ],
        summaryBullets: [
          "A single positive trait can inflate unrelated judgments.",
          "Admiration often weakens critical thinking.",
          "Evaluate people and products by category, not overall glow.",
          "Structured scorecards beat vibes when stakes are high."
        ],
        reflectionPrompt:
          "Who gets extra credibility from you because they are strong in one visible area?",
        practice: {
          question:
            "A charismatic founder gives a brilliant keynote, so investors assume the company operations must also be strong. What is happening?",
          options: [
            "Confirmation bias because the investors like speeches.",
            "Halo effect because one positive trait is coloring unrelated judgments.",
            "Availability bias because conferences are memorable."
          ],
          correctIndex: 1,
          explanation:
            "The founder's presentation skill is spilling over into assumptions about operations, which are separate abilities."
        }
      },
      {
        id: "anchoring-effect",
        title: "Anchoring Effect",
        duration: "4 min",
        icon: "straighten",
        teaser:
          "The first number or idea you see becomes a reference point, even if it is arbitrary.",
        lessonCards: [
          {
            id: "anchoring-1",
            eyebrow: "The first pull",
            title: "Initial numbers stick",
            body:
              "An opening price, estimate, or target quietly frames the rest of the conversation. Later adjustments usually stay too close to that anchor.",
            support:
              "The brain starts from what it already saw and then moves only a little."
          },
          {
            id: "anchoring-2",
            eyebrow: "Why it survives",
            title: "Even bad anchors shape judgment",
            body:
              "The anchor does not need to be accurate. It only needs to appear first and feel plausible enough to enter the conversation.",
            support:
              "Once it is in the room, it influences every comparison that follows."
          },
          {
            id: "anchoring-3",
            eyebrow: "How to counter it",
            title: "Build your own reference before you negotiate",
            body:
              "Collect independent numbers, set a walk-away range, and write it down before hearing the first external offer.",
            support:
              "Pre-commitment protects your judgment from the first loud number."
          }
        ],
        summaryBullets: [
          "First numbers shape later judgments disproportionately.",
          "Anchors work even when they are weak or arbitrary.",
          "Independent prep lowers your exposure to external anchors.",
          "Write your own range before you hear someone else's."
        ],
        reflectionPrompt:
          "Which first number is still affecting a decision you are making?",
        practice: {
          question:
            "A recruiter opens salary talks with a low range, and every counteroffer you consider stays close to it. Which bias is pulling on you?",
          options: [
            "Availability bias because salaries are emotional.",
            "Anchoring effect because the first number framed the negotiation.",
            "Halo effect because recruiters seem professional."
          ],
          correctIndex: 1,
          explanation:
            "The first range became the reference point, pulling your later judgments toward it."
        }
      }
    ]
  },
  {
    id: "founder-mental-models",
    status: "comingSoon",
    title: "Founder Mental Models",
    subtitle: "Short decision drills for high-uncertainty work",
    author: "Studio Pack",
    category: "Business",
    description: "A second pack for startup calls, trade-offs, and decision hygiene.",
    heroLine: "Coming soon",
    keyIdeaCount: 7,
    minutesPerIdea: "3-4 min",
    accent: "#DA6B1B",
    icon: "rocket-launch",
    coverLabel: "NEXT PACK",
    coverLines: ["FOUNDER", "MENTAL", "MODELS"],
    generationSteps: [],
    ideas: []
  },
  {
    id: "money-behavior",
    status: "comingSoon",
    title: "Money and Behavior",
    subtitle: "How emotion bends risk, saving, and status decisions",
    author: "Studio Pack",
    category: "Finance",
    description: "A practice-first pack about everyday money choices.",
    heroLine: "Coming soon",
    keyIdeaCount: 8,
    minutesPerIdea: "4 min",
    accent: "#4C8B77",
    icon: "savings",
    coverLabel: "NEXT PACK",
    coverLines: ["MONEY", "AND", "BEHAVIOR"],
    generationSteps: [],
    ideas: []
  }
];


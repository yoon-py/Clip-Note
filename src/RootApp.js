import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import { learningPacks } from "./data/learningContent";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8787";
const defaultSourceText = `Successful people often look like they followed a clear formula, but that formula is usually reconstructed after the fact. We notice the founder who dropped out, the investor who concentrated heavily, and the athlete with extreme routines because their stories survived. We forget the thousands of people who copied the same moves and disappeared quietly.

Good decision making gets worse when we only study the visible winners. Confirmation bias then joins in: once we decide a pattern explains success, we start collecting only the examples that support it. The vivid examples feel persuasive because they are easy to remember, not because they are statistically representative.

A better approach is to ask what is missing from the sample, what evidence would change our minds, and whether the story still works when we include quiet failures in the background.`;

const palette = {
  background: "#EFE3C6",
  surface: "#F8F2E7",
  raised: "#FFF9F0",
  ink: "#321007",
  muted: "#7E6346",
  line: "#E3C98E",
  accent: "#C98706",
  accentSoft: "#F4D690",
  success: "#1FA95C",
  danger: "#D35E3C",
  shadow: "#52210B",
};

function withAlpha(color, alpha) {
  return `${color}${alpha}`;
}

function getPackById(packs, packId) {
  return packs.find((pack) => pack.id === packId) || packs[0];
}

function getCompletedIdeaIds(progressByPack, packId) {
  return progressByPack[packId]?.completedIdeaIds || [];
}

function isIdeaUnlocked(index, completedIdeaIds) {
  return index <= completedIdeaIds.length;
}

function getNextIdea(pack, completedIdeaIds) {
  return pack.ideas.find((idea) => !completedIdeaIds.includes(idea.id)) || null;
}

function getProgressLabel(pack, completedIdeaIds) {
  return `${completedIdeaIds.length}/${pack.ideas.length} ideas done`;
}

function SurfaceButton({ label, onPress, icon, secondary, disabled, loading }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.primaryButton,
        secondary && styles.secondaryButton,
        (disabled || loading) && styles.disabledButton,
      ]}
    >
      <View style={styles.primaryButtonRow}>
        {loading ? (
          <ActivityIndicator color={secondary ? palette.ink : "#FFF8EA"} />
        ) : icon ? (
          <MaterialIcons
            color={secondary ? palette.ink : "#FFF8EA"}
            name={icon}
            size={20}
          />
        ) : null}
        <Text
          style={[
            styles.primaryButtonLabel,
            secondary && styles.secondaryButtonLabel,
            (disabled || loading) && styles.disabledButtonLabel,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function SectionHeader({ kicker, title, body }) {
  return (
    <View style={styles.sectionHeader}>
      {kicker ? <Text style={styles.sectionKicker}>{kicker}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
    </View>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <MaterialIcons color={palette.accent} name={icon} size={24} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function BookCover({ pack, compact }) {
  return (
    <View
      style={[
        styles.coverCard,
        compact && styles.coverCardCompact,
        { backgroundColor: pack.accent },
      ]}
    >
      <Text style={styles.coverLabel}>{pack.coverLabel}</Text>
      <View style={styles.coverGlow} />
      {pack.coverLines.map((line) => (
        <Text key={line} style={[styles.coverLine, compact && styles.coverLineCompact]}>
          {line}
        </Text>
      ))}
      <View style={styles.coverFooter}>
        <View style={styles.coverBulbRow}>
          <View style={styles.coverBulbMuted} />
          <View style={styles.coverBulbMuted} />
          <View style={styles.coverBulbActive}>
            <MaterialIcons color="#FFF1D2" name={pack.icon} size={26} />
          </View>
          <View style={styles.coverBulbMuted} />
        </View>
      </View>
    </View>
  );
}

function ProgressPills({ total, activeIndex }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;

        return (
          <View
            key={`pill-${index}`}
            style={[
              styles.progressPill,
              isDone && styles.progressPillDone,
              isActive && styles.progressPillActive,
            ]}
          />
        );
      })}
    </View>
  );
}

function LessonArt({ title, eyebrow, icon, accent }) {
  return (
    <View style={[styles.lessonArt, { backgroundColor: withAlpha(accent, "20") }]}>
      <View style={[styles.lessonArtHalo, { backgroundColor: withAlpha(accent, "36") }]} />
      <View style={[styles.lessonArtIconShell, { backgroundColor: accent }]}>
        <MaterialIcons color="#FFF6E8" name={icon} size={42} />
      </View>
      <Text style={styles.lessonArtEyebrow}>{eyebrow}</Text>
      <Text style={styles.lessonArtTitle}>{title}</Text>
    </View>
  );
}

function IdeaRow({ idea, state, onPress }) {
  const isLocked = state === "locked";
  const isCompleted = state === "completed";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isLocked}
      onPress={onPress}
      style={[styles.ideaRow, isLocked && styles.ideaRowLocked]}
    >
      <View style={styles.ideaRowLeft}>
        <View style={styles.ideaRowIconShell}>
          <MaterialIcons color={palette.accent} name={idea.icon} size={22} />
        </View>
        <View style={styles.ideaRowText}>
          <Text style={[styles.ideaRowTitle, isLocked && styles.ideaRowTitleLocked]}>
            {idea.title}
          </Text>
          <Text style={styles.ideaRowDuration}>{idea.duration}</Text>
          <Text style={styles.ideaRowTeaser}>{idea.teaser}</Text>
        </View>
      </View>

      {isCompleted ? (
        <MaterialIcons color={palette.success} name="check-circle" size={28} />
      ) : isLocked ? (
        <MaterialIcons color={palette.ink} name="lock-outline" size={26} />
      ) : (
        <Feather color={palette.ink} name="chevron-right" size={24} />
      )}
    </Pressable>
  );
}

function HomeScreen({ packs, progressByPack, onOpenPack, onOpenStudio }) {
  const featuredPack = packs.find((pack) => pack.status === "ready") || packs[0];
  const completedIdeaIds = getCompletedIdeaIds(progressByPack, featuredPack.id);
  const nextIdea = getNextIdea(featuredPack, completedIdeaIds) || featuredPack.ideas.at(-1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <SectionHeader
          kicker="Expo + backend + OpenAI"
          title="Turn dense ideas into short lessons and practice."
          body="The app now includes a creator studio path so you can paste source text, call the backend, and open an AI-generated pack inside the mobile flow."
        />

        <View style={styles.heroCard}>
          <View style={styles.heroCardTop}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Featured pack</Text>
            </View>
            <Text style={styles.heroProgress}>{getProgressLabel(featuredPack, completedIdeaIds)}</Text>
          </View>

          <BookCover pack={featuredPack} />

          <Text style={styles.heroTitle}>{featuredPack.subtitle}</Text>
          <Text style={styles.heroMeta}>
            {featuredPack.title} by {featuredPack.author}
          </Text>
          <Text style={styles.heroDescription}>{featuredPack.heroLine}</Text>

          <View style={styles.statRow}>
            <StatCard icon="bookmark-added" label="Key ideas" value={`${featuredPack.keyIdeaCount}`} />
            <StatCard icon="schedule" label="Time per idea" value={featuredPack.minutesPerIdea} />
          </View>

          <SurfaceButton
            icon="menu-book"
            label={nextIdea ? `Start ${nextIdea.title}` : "Open pack"}
            onPress={() => onOpenPack(featuredPack.id)}
          />
        </View>

        <SectionHeader
          kicker="AI studio"
          title="Generate a pack from your own source"
          body="Paste notes, an article excerpt, or a chapter summary. The backend turns it into the same pack structure the app already understands."
        />

        <View style={styles.studioPreviewCard}>
          <View style={styles.studioPreviewRow}>
            <MaterialIcons color={palette.accent} name="upload-file" size={22} />
            <Text style={styles.studioPreviewText}>Paste text from a source</Text>
          </View>
          <View style={styles.studioPreviewRow}>
            <MaterialIcons color={palette.accent} name="auto-awesome" size={22} />
            <Text style={styles.studioPreviewText}>Generate ideas, cards, and practice</Text>
          </View>
          <View style={styles.studioPreviewRow}>
            <MaterialIcons color={palette.accent} name="phone-iphone" size={22} />
            <Text style={styles.studioPreviewText}>Open the generated pack in the Expo app</Text>
          </View>

          <SurfaceButton icon="auto-awesome" label="Open AI Studio" onPress={onOpenStudio} />
        </View>

        <SectionHeader
          kicker="Lesson flow"
          title="A simple path from reading to practice"
          body="The user-facing loop is still the same: pack detail, lesson cards, summary, quiz, and completion."
        />

        <View style={styles.flowRow}>
          {["Pick idea", "Read cards", "Review", "Practice", "Repeat"].map((label, index) => (
            <View key={label} style={styles.flowChip}>
              <Text style={styles.flowChipIndex}>0{index + 1}</Text>
              <Text style={styles.flowChipLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader
          kicker="Library"
          title="Pack shelf"
          body="Generated packs show up here next to the seeded examples."
        />

        {packs.map((pack) => {
          const isReady = pack.status === "ready";
          const completed = getCompletedIdeaIds(progressByPack, pack.id).length;

          return (
            <View key={pack.id} style={styles.libraryCard}>
              <BookCover compact pack={pack} />
              <View style={styles.libraryText}>
                <Text style={styles.libraryCategory}>{pack.category}</Text>
                <Text style={styles.libraryTitle}>{pack.title}</Text>
                <Text style={styles.librarySubtitle}>{pack.subtitle}</Text>
                <Text style={styles.libraryProgress}>
                  {isReady ? `${completed}/${pack.ideas.length} completed` : "Coming soon"}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!isReady}
                onPress={() => onOpenPack(pack.id)}
                style={[styles.libraryAction, !isReady && styles.libraryActionDisabled]}
              >
                <Feather
                  color={isReady ? palette.ink : withAlpha(palette.ink, "55")}
                  name={isReady ? "arrow-right" : "lock"}
                  size={20}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudioScreen({ onBack, onGenerated }) {
  const [title, setTitle] = useState("Biases from invisible data");
  const [author, setAuthor] = useState("AI Studio");
  const [category, setCategory] = useState("Psychology");
  const [sourceText, setSourceText] = useState(defaultSourceText);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-pack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          author,
          category,
          sourceText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Generation failed.");
      }

      onGenerated(data.pack);
    } catch (generationError) {
      setError(generationError.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.roundButton}>
            <Feather color={palette.ink} name="chevron-left" size={24} />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarTitle}>AI Studio</Text>
            <Text style={styles.topBarCaption}>Expo app -> backend -> OpenAI -> pack</Text>
          </View>
        </View>

        <SectionHeader
          kicker="Backend target"
          title="Generate a new learning pack"
          body="The app posts your source to the local backend, which calls the OpenAI Responses API and sends back a structured pack."
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>API base URL</Text>
          <Text style={styles.infoCardValue}>{API_BASE_URL}</Text>
          <Text style={styles.infoCardHint}>
            Use your Mac's local IP instead of localhost when testing on a real phone.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Pack title</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Enter a pack title"
            placeholderTextColor={withAlpha(palette.muted, "A0")}
            style={styles.input}
            value={title}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Author</Text>
            <TextInput
              onChangeText={setAuthor}
              placeholder="Author"
              placeholderTextColor={withAlpha(palette.muted, "A0")}
              style={styles.input}
              value={author}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              onChangeText={setCategory}
              placeholder="Category"
              placeholderTextColor={withAlpha(palette.muted, "A0")}
              style={styles.input}
              value={category}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Source text</Text>
          <TextInput
            multiline
            onChangeText={setSourceText}
            placeholder="Paste a source, summary, notes, or transcript here."
            placeholderTextColor={withAlpha(palette.muted, "A0")}
            style={styles.textArea}
            textAlignVertical="top"
            value={sourceText}
          />
          <Text style={styles.fieldHint}>
            Keep at least a few paragraphs. The backend currently requires 400+ characters.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not generate the pack</Text>
            <Text style={styles.errorBody}>{error}</Text>
          </View>
        ) : null}

        <SurfaceButton
          icon="auto-awesome"
          label={loading ? "Generating pack..." : "Generate pack"}
          loading={loading}
          onPress={handleGenerate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailScreen({ pack, progressByPack, onBack, onStartIdea }) {
  const completedIdeaIds = getCompletedIdeaIds(progressByPack, pack.id);
  const nextIdea = getNextIdea(pack, completedIdeaIds) || pack.ideas.at(-1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.roundButton}>
            <Feather color={palette.ink} name="chevron-left" size={24} />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarTitle}>{pack.title}</Text>
            <Text style={styles.topBarCaption}>{pack.category}</Text>
          </View>
          <View style={styles.topBarActions}>
            <View style={styles.roundButtonGhost}>
              <Feather color={palette.ink} name="headphones" size={20} />
            </View>
          </View>
        </View>

        <View style={styles.heroCard}>
          <BookCover pack={pack} />
          <Text style={styles.heroTitle}>{pack.subtitle}</Text>
          <Text style={styles.heroMeta}>
            {pack.title} by {pack.author}
          </Text>

          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{pack.category}</Text>
          </View>

          <View style={styles.statRow}>
            <StatCard icon="bookmark-added" label="Key ideas" value={`${pack.keyIdeaCount}`} />
            <StatCard icon="schedule" label="Time per idea" value={pack.minutesPerIdea} />
          </View>
        </View>

        <SectionHeader title="Description" body={pack.description} />

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{pack.heroLine}</Text>
          <Text style={styles.descriptionPrompt}>
            Ready to sharpen your judgment one idea at a time?
          </Text>
        </View>

        <SectionHeader
          title="Main Ideas"
          body="Locked ideas open as the previous ones are completed, so the pack always feels manageable."
        />

        {pack.ideas.map((idea, index) => {
          let state = "locked";
          if (completedIdeaIds.includes(idea.id)) {
            state = "completed";
          } else if (isIdeaUnlocked(index, completedIdeaIds)) {
            state = "unlocked";
          }

          return (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onPress={() => onStartIdea(pack.id, idea.id)}
              state={state}
            />
          );
        })}

        <SurfaceButton
          icon="play-arrow"
          label={nextIdea ? `Start ${nextIdea.title}` : "Back to home"}
          onPress={() => {
            if (nextIdea) {
              onStartIdea(pack.id, nextIdea.id);
            } else {
              onBack();
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonScreen({ pack, idea, cardIndex, onBack, onClose, onContinue }) {
  const card = idea.lessonCards[cardIndex];
  const totalSteps = idea.lessonCards.length + 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.roundButton}>
            <Feather color={palette.ink} name="chevron-left" size={24} />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarTitle}>{idea.title}</Text>
            <Text style={styles.topBarCaption}>
              Card {cardIndex + 1} of {idea.lessonCards.length}
            </Text>
          </View>
          <View style={styles.topBarActions}>
            <View style={styles.roundButtonGhost}>
              <Feather color={palette.ink} name="headphones" size={20} />
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.roundButton}>
              <Feather color={palette.ink} name="x" size={22} />
            </Pressable>
          </View>
        </View>

        <ProgressPills activeIndex={cardIndex} total={totalSteps} />

        <LessonArt
          accent={pack.accent}
          eyebrow={card.eyebrow}
          icon={idea.icon}
          title={card.title}
        />

        <View style={styles.lessonCopyBlock}>
          <Text style={styles.lessonTitle}>{card.title}</Text>
          <Text style={styles.lessonBody}>{card.body}</Text>
          <Text style={styles.lessonSupport}>{card.support}</Text>
        </View>

        <SurfaceButton
          icon="arrow-forward"
          label={cardIndex === idea.lessonCards.length - 1 ? "Review takeaways" : "Continue"}
          onPress={onContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryScreen({ idea, onBack, onClose, onPractice }) {
  const totalSteps = idea.lessonCards.length + 2;
  const activeIndex = idea.lessonCards.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.roundButton}>
            <Feather color={palette.ink} name="chevron-left" size={24} />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarTitle}>{idea.title}</Text>
            <Text style={styles.topBarCaption}>Summary</Text>
          </View>
          <View style={styles.topBarActions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.roundButton}>
              <Feather color={palette.ink} name="x" size={22} />
            </Pressable>
          </View>
        </View>

        <ProgressPills activeIndex={activeIndex} total={totalSteps} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{idea.title} distorts judgment when:</Text>
          {idea.summaryBullets.map((bullet) => (
            <View key={bullet} style={styles.summaryBulletRow}>
              <Text style={styles.summaryBulletDot}>•</Text>
              <Text style={styles.summaryBullet}>{bullet}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <Text style={styles.summaryPromptLabel}>Reflection</Text>
          <Text style={styles.summaryPrompt}>{idea.reflectionPrompt}</Text>
        </View>

        <SurfaceButton icon="quiz" label="Try practice" onPress={onPractice} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PracticeScreen({
  idea,
  onBack,
  onClose,
  onSelectAnswer,
  onFinish,
  selectedAnswerIndex,
}) {
  const totalSteps = idea.lessonCards.length + 2;
  const activeIndex = idea.lessonCards.length + 1;
  const hasAnswered = selectedAnswerIndex !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.roundButton}>
            <Feather color={palette.ink} name="chevron-left" size={24} />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarTitle}>{idea.title}</Text>
            <Text style={styles.topBarCaption}>Practice</Text>
          </View>
          <View style={styles.topBarActions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.roundButton}>
              <Feather color={palette.ink} name="x" size={22} />
            </Pressable>
          </View>
        </View>

        <ProgressPills activeIndex={activeIndex} total={totalSteps} />

        <View style={styles.practiceQuestionCard}>
          <Text style={styles.practiceQuestion}>{idea.practice.question}</Text>
        </View>

        <View style={styles.mascotShell}>
          <View style={styles.mascotBubble}>
            <MaterialIcons color="#FFF4DE" name="local-fire-department" size={54} />
          </View>
        </View>

        {idea.practice.options.map((option, index) => {
          const isSelected = selectedAnswerIndex === index;
          const isCorrect = index === idea.practice.correctIndex;
          const showState = hasAnswered && (isSelected || isCorrect);

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => onSelectAnswer(index)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                showState && isCorrect && styles.optionCardCorrect,
                showState && isSelected && !isCorrect && styles.optionCardWrong,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  showState && isCorrect && styles.optionTextCorrect,
                  showState && isSelected && !isCorrect && styles.optionTextWrong,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}

        {hasAnswered ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              {selectedAnswerIndex === idea.practice.correctIndex ? "Exactly." : "Close, but not quite."}
            </Text>
            <Text style={styles.feedbackBody}>{idea.practice.explanation}</Text>
          </View>
        ) : null}

        <SurfaceButton
          icon="arrow-forward"
          disabled={!hasAnswered}
          label="Finish idea"
          onPress={onFinish}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function CompletionScreen({ pack, progressByPack, onBackHome, onReviewPack, onNextIdea }) {
  const completedIdeaIds = getCompletedIdeaIds(progressByPack, pack.id);
  const nextIdea = getNextIdea(pack, completedIdeaIds);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.completionHero}>
          <View style={styles.completionStar}>
            <MaterialIcons color="#FFEDD1" name="auto-awesome" size={64} />
          </View>
          <Text style={styles.completionTitle}>Nice work</Text>
          <Text style={styles.completionBody}>
            You learned and practiced something new. The next idea is ready whenever you are.
          </Text>
        </View>

        <View style={styles.completionList}>
          {pack.ideas.slice(0, 3).map((idea) => {
            const isDone = completedIdeaIds.includes(idea.id);
            const isNext = nextIdea?.id === idea.id;

            return (
              <View
                key={idea.id}
                style={[
                  styles.completionRow,
                  isDone && styles.completionRowDone,
                  isNext && styles.completionRowNext,
                ]}
              >
                <View style={styles.ideaRowLeft}>
                  <View style={styles.ideaRowIconShell}>
                    <MaterialIcons color={palette.accent} name={idea.icon} size={22} />
                  </View>
                  <View style={styles.ideaRowText}>
                    <Text style={styles.ideaRowTitle}>{idea.title}</Text>
                    <Text style={styles.ideaRowDuration}>{idea.duration}</Text>
                  </View>
                </View>

                {isDone ? (
                  <MaterialIcons color={palette.success} name="check-circle" size={28} />
                ) : isNext ? (
                  <Feather color={palette.ink} name="chevron-right" size={22} />
                ) : (
                  <MaterialIcons color={palette.ink} name="lock-outline" size={24} />
                )}
              </View>
            );
          })}
        </View>

        {nextIdea ? (
          <SurfaceButton
            icon="play-arrow"
            label={`Continue with ${nextIdea.title}`}
            onPress={onNextIdea}
          />
        ) : (
          <SurfaceButton icon="home" label="Back to home" onPress={onBackHome} />
        )}

        <SurfaceButton
          secondary
          icon="menu-book"
          label="Review the full pack"
          onPress={onReviewPack}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function RootApp() {
  const initialReadyPack = learningPacks.find((pack) => pack.status === "ready") || learningPacks[0];
  const [packs, setPacks] = useState(learningPacks);
  const [screen, setScreen] = useState("home");
  const [activePackId, setActivePackId] = useState(initialReadyPack.id);
  const [activeIdeaId, setActiveIdeaId] = useState(initialReadyPack.ideas[0]?.id || null);
  const [lessonCardIndex, setLessonCardIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [progressByPack, setProgressByPack] = useState({});

  const activePack = getPackById(packs, activePackId);
  const activeIdea =
    activePack.ideas.find((idea) => idea.id === activeIdeaId) || activePack.ideas[0];

  function openPack(packId) {
    setActivePackId(packId);
    setScreen("detail");
  }

  function openIdea(packId, ideaId) {
    setActivePackId(packId);
    setActiveIdeaId(ideaId);
    setLessonCardIndex(0);
    setSelectedAnswerIndex(null);
    setScreen("lesson");
  }

  function closeToPack() {
    setLessonCardIndex(0);
    setSelectedAnswerIndex(null);
    setScreen("detail");
  }

  function goBackWithinLesson() {
    if (screen === "lesson") {
      if (lessonCardIndex > 0) {
        setLessonCardIndex((current) => current - 1);
      } else {
        setScreen("detail");
      }
      return;
    }

    if (screen === "summary") {
      setScreen("lesson");
      setLessonCardIndex(activeIdea.lessonCards.length - 1);
      return;
    }

    if (screen === "practice") {
      setScreen("summary");
    }
  }

  function continueLesson() {
    if (lessonCardIndex < activeIdea.lessonCards.length - 1) {
      setLessonCardIndex((current) => current + 1);
    } else {
      setScreen("summary");
    }
  }

  function finishIdea() {
    setProgressByPack((current) => {
      const existing = current[activePackId]?.completedIdeaIds || [];
      if (existing.includes(activeIdeaId)) {
        return current;
      }

      return {
        ...current,
        [activePackId]: {
          completedIdeaIds: [...existing, activeIdeaId],
        },
      };
    });
    setScreen("completion");
  }

  function openNextIdea() {
    const completedIdeaIds = getCompletedIdeaIds(progressByPack, activePackId);
    const nextIdea = getNextIdea(activePack, completedIdeaIds);

    if (!nextIdea) {
      setScreen("home");
      return;
    }

    openIdea(activePackId, nextIdea.id);
  }

  function addGeneratedPack(pack) {
    setPacks((current) => [pack, ...current.filter((item) => item.id !== pack.id)]);
    setActivePackId(pack.id);
    setActiveIdeaId(pack.ideas[0]?.id || null);
    setLessonCardIndex(0);
    setSelectedAnswerIndex(null);
    setScreen("detail");
  }

  if (screen === "home") {
    return (
      <HomeScreen
        onOpenPack={openPack}
        onOpenStudio={() => setScreen("studio")}
        packs={packs}
        progressByPack={progressByPack}
      />
    );
  }

  if (screen === "studio") {
    return <StudioScreen onBack={() => setScreen("home")} onGenerated={addGeneratedPack} />;
  }

  if (screen === "detail") {
    return (
      <DetailScreen
        onBack={() => setScreen("home")}
        onStartIdea={openIdea}
        pack={activePack}
        progressByPack={progressByPack}
      />
    );
  }

  if (screen === "lesson") {
    return (
      <LessonScreen
        cardIndex={lessonCardIndex}
        idea={activeIdea}
        onBack={goBackWithinLesson}
        onClose={closeToPack}
        onContinue={continueLesson}
        pack={activePack}
      />
    );
  }

  if (screen === "summary") {
    return (
      <SummaryScreen
        idea={activeIdea}
        onBack={goBackWithinLesson}
        onClose={closeToPack}
        onPractice={() => {
          setSelectedAnswerIndex(null);
          setScreen("practice");
        }}
      />
    );
  }

  if (screen === "practice") {
    return (
      <PracticeScreen
        idea={activeIdea}
        onBack={goBackWithinLesson}
        onClose={closeToPack}
        onFinish={finishIdea}
        onSelectAnswer={setSelectedAnswerIndex}
        selectedAnswerIndex={selectedAnswerIndex}
      />
    );
  }

  return (
    <CompletionScreen
      onBackHome={() => setScreen("home")}
      onNextIdea={openNextIdea}
      onReviewPack={() => setScreen("detail")}
      pack={activePack}
      progressByPack={progressByPack}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionKicker: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  sectionBody: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  heroCard: {
    backgroundColor: withAlpha("#FFF9F0", "F4"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 32,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBadge: {
    backgroundColor: withAlpha(palette.accent, "20"),
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  heroProgress: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 31,
  },
  heroMeta: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroDescription: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 25,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: withAlpha("#FFF7EA", "E8"),
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLabel: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 62,
    paddingHorizontal: 22,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 0,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: withAlpha("#FFF7EA", "F2"),
    borderColor: withAlpha(palette.line, "CC"),
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    backgroundColor: withAlpha(palette.ink, "55"),
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonLabel: {
    color: "#FFF8EA",
    fontSize: 18,
    fontWeight: "800",
  },
  secondaryButtonLabel: {
    color: palette.ink,
  },
  disabledButtonLabel: {
    color: withAlpha("#FFF8EA", "BB"),
  },
  studioPreviewCard: {
    backgroundColor: withAlpha("#FFF8EE", "E8"),
    borderRadius: 28,
    gap: 14,
    padding: 20,
  },
  studioPreviewRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  studioPreviewText: {
    color: palette.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  flowRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  flowChip: {
    backgroundColor: withAlpha("#FFF7EA", "E8"),
    borderRadius: 24,
    minWidth: "30%",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  flowChipIndex: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
  },
  flowChipLabel: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  libraryCard: {
    alignItems: "center",
    backgroundColor: withAlpha("#FFF8EE", "ED"),
    borderRadius: 28,
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  libraryText: {
    flex: 1,
    gap: 4,
  },
  libraryCategory: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  libraryTitle: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "800",
  },
  librarySubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  libraryProgress: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  libraryAction: {
    alignItems: "center",
    backgroundColor: withAlpha(palette.accent, "24"),
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  libraryActionDisabled: {
    backgroundColor: withAlpha(palette.ink, "0F"),
  },
  coverCard: {
    alignSelf: "center",
    borderRadius: 28,
    minHeight: 315,
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingVertical: 20,
    width: "82%",
  },
  coverCardCompact: {
    alignSelf: "auto",
    borderRadius: 22,
    minHeight: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: 112,
  },
  coverLabel: {
    color: withAlpha(palette.ink, "CC"),
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  coverGlow: {
    backgroundColor: withAlpha("#FFF1C6", "60"),
    borderRadius: 180,
    height: 180,
    position: "absolute",
    right: -20,
    top: 90,
    width: 180,
  },
  coverLine: {
    color: "#8F170D",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 36,
  },
  coverLineCompact: {
    fontSize: 18,
    lineHeight: 20,
  },
  coverFooter: {
    flex: 1,
    justifyContent: "flex-end",
  },
  coverBulbRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverBulbMuted: {
    backgroundColor: withAlpha("#58728C", "88"),
    borderRadius: 999,
    height: 46,
    width: 46,
  },
  coverBulbActive: {
    alignItems: "center",
    backgroundColor: "#D1321D",
    borderRadius: 999,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  roundButton: {
    alignItems: "center",
    backgroundColor: withAlpha("#FFF7EA", "E8"),
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  roundButtonGhost: {
    alignItems: "center",
    backgroundColor: withAlpha("#FFF7EA", "A5"),
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  topBarTitleWrap: {
    flex: 1,
    gap: 2,
  },
  topBarTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  topBarCaption: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  topBarActions: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    backgroundColor: withAlpha("#FFF8EE", "EE"),
    borderRadius: 26,
    gap: 6,
    padding: 18,
  },
  infoCardLabel: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  infoCardValue: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  infoCardHint: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  formGroup: {
    gap: 8,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    backgroundColor: withAlpha("#FFF8EE", "EE"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 18,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    backgroundColor: withAlpha("#FFF8EE", "EE"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 20,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 260,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fieldHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#F9D9D3",
    borderColor: "#D35E3C",
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  errorTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  errorBody: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  categoryChip: {
    alignSelf: "center",
    backgroundColor: withAlpha(palette.accent, "24"),
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  descriptionCard: {
    backgroundColor: withAlpha("#FFF8EE", "E8"),
    borderRadius: 30,
    padding: 22,
    gap: 18,
  },
  descriptionText: {
    color: palette.ink,
    fontSize: 18,
    lineHeight: 29,
  },
  descriptionPrompt: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 27,
  },
  ideaRow: {
    alignItems: "center",
    backgroundColor: withAlpha("#FFF8EE", "EB"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  ideaRowLocked: {
    opacity: 0.78,
  },
  ideaRowLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  ideaRowIconShell: {
    alignItems: "center",
    backgroundColor: withAlpha(palette.accent, "18"),
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  ideaRowText: {
    flex: 1,
    gap: 3,
  },
  ideaRowTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  ideaRowTitleLocked: {
    color: withAlpha(palette.ink, "B0"),
  },
  ideaRowDuration: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  ideaRowTeaser: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    paddingTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  progressPill: {
    backgroundColor: withAlpha(palette.accent, "18"),
    borderRadius: 999,
    flex: 1,
    height: 12,
  },
  progressPillDone: {
    backgroundColor: withAlpha(palette.accent, "80"),
  },
  progressPillActive: {
    backgroundColor: palette.accent,
    flex: 1.5,
  },
  lessonArt: {
    alignItems: "center",
    borderRadius: 34,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  lessonArtHalo: {
    borderRadius: 999,
    height: 120,
    position: "absolute",
    top: 22,
    width: 120,
  },
  lessonArtIconShell: {
    alignItems: "center",
    borderRadius: 999,
    height: 96,
    justifyContent: "center",
    marginTop: 8,
    width: 96,
  },
  lessonArtEyebrow: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lessonArtTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  lessonCopyBlock: {
    gap: 14,
  },
  lessonTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  lessonBody: {
    color: palette.ink,
    fontSize: 23,
    fontWeight: "600",
    lineHeight: 34,
  },
  lessonSupport: {
    color: palette.muted,
    fontSize: 18,
    lineHeight: 29,
  },
  summaryCard: {
    backgroundColor: withAlpha("#FFF8EE", "F0"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 34,
    borderWidth: 1,
    gap: 14,
    padding: 22,
  },
  summaryTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  summaryBulletRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryBulletDot: {
    color: palette.ink,
    fontSize: 24,
    lineHeight: 30,
  },
  summaryBullet: {
    color: palette.ink,
    flex: 1,
    fontSize: 18,
    lineHeight: 29,
  },
  summaryDivider: {
    backgroundColor: withAlpha(palette.line, "BB"),
    height: 1,
    marginVertical: 4,
  },
  summaryPromptLabel: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  summaryPrompt: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 28,
  },
  practiceQuestionCard: {
    backgroundColor: withAlpha("#FFF8EE", "F2"),
    borderRadius: 30,
    padding: 22,
  },
  practiceQuestion: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 38,
    textAlign: "center",
  },
  mascotShell: {
    alignItems: "center",
  },
  mascotBubble: {
    alignItems: "center",
    backgroundColor: "#FF5624",
    borderRadius: 999,
    height: 146,
    justifyContent: "center",
    width: 146,
  },
  optionCard: {
    backgroundColor: withAlpha("#FFF8EE", "EE"),
    borderColor: withAlpha(palette.line, "CC"),
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  optionCardSelected: {
    borderColor: palette.accent,
    borderWidth: 2,
  },
  optionCardCorrect: {
    backgroundColor: "#F5D58A",
    borderColor: "#E3AF1D",
  },
  optionCardWrong: {
    backgroundColor: "#F5D5CF",
    borderColor: palette.danger,
  },
  optionText: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
    textAlign: "center",
  },
  optionTextSelected: {
    color: palette.ink,
  },
  optionTextCorrect: {
    color: palette.ink,
  },
  optionTextWrong: {
    color: palette.ink,
  },
  feedbackCard: {
    backgroundColor: withAlpha("#FFF8EE", "EE"),
    borderRadius: 26,
    gap: 10,
    padding: 20,
  },
  feedbackTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  feedbackBody: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 27,
  },
  completionHero: {
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  completionStar: {
    alignItems: "center",
    backgroundColor: withAlpha(palette.accent, "25"),
    borderRadius: 999,
    height: 150,
    justifyContent: "center",
    width: 150,
  },
  completionTitle: {
    color: palette.ink,
    fontSize: 42,
    fontWeight: "900",
  },
  completionBody: {
    color: palette.ink,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 320,
    textAlign: "center",
  },
  completionList: {
    gap: 12,
  },
  completionRow: {
    alignItems: "center",
    backgroundColor: withAlpha("#FFF8EE", "ED"),
    borderRadius: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  completionRowDone: {
    borderColor: withAlpha(palette.success, "60"),
    borderWidth: 2,
  },
  completionRowNext: {
    borderColor: withAlpha(palette.accent, "80"),
    borderWidth: 2,
  },
});

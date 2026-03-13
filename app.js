const NOTE_STORAGE_KEY = "ontology-note-atlas:v4";
const UI_STORAGE_KEY = "ontology-note-atlas:ui:v1";
const LEGACY_NOTE_STORAGE_KEYS = [
  "ontology-note-atlas:v3",
  "ontology-note-atlas:v2",
  "ontology-note-atlas:v1",
];

const ENTITY_TYPES = {
  note: { label: "메모", color: "#ff9852" },
  person: { label: "사람", color: "#f3c969" },
  organization: { label: "조직", color: "#9588ff" },
  project: { label: "프로젝트", color: "#2bc0b5" },
  event: { label: "이벤트", color: "#ff7ba7" },
  system: { label: "시스템", color: "#55c1b2" },
  channel: { label: "채널", color: "#d0ad58" },
  process: { label: "프로세스", color: "#86c45e" },
  requirement: { label: "요구사항", color: "#c58eff" },
  rule: { label: "규칙", color: "#ff7fa1" },
  metric: { label: "지표", color: "#96adcf" },
  topic: { label: "주제", color: "#6f95ff" },
  task: { label: "작업", color: "#65d475" },
  decision: { label: "결정", color: "#ff8a63" },
};

const TYPE_ALIASES = {
  사람: "person",
  조직: "organization",
  프로젝트: "project",
  이벤트: "event",
  시스템: "system",
  채널: "channel",
  프로세스: "process",
  요구사항: "requirement",
  규칙: "rule",
  지표: "metric",
  주제: "topic",
  작업: "task",
  결정: "decision",
  메모: "note",
  노트: "note",
};

const PREDICATE_TYPES = {
  related_to: { label: "관련" },
  uses: { label: "사용" },
  routes_to: { label: "전달" },
  requires: { label: "요구" },
  fallback_to: { label: "예비" },
  measured_by: { label: "측정" },
  reviewed_by: { label: "검토" },
  discusses: { label: "논의" },
  decides: { label: "결정" },
  assigned_to: { label: "담당" },
};

const PREDICATE_ALIAS_MAP = Object.fromEntries(
  Object.entries(PREDICATE_TYPES).map(([key, value]) => [value.label, key]),
);

const OVERVIEW_TAB_ID = "tab-overview";
const FLOW_TAB_ID = "tab-flow";
const GRAPH_TAB_ID = "tab-graph";
const DEFAULT_GRAPH_MODE = "notes";

const elements = {
  appShell: document.getElementById("appShell"),
  leftSidebar: document.getElementById("leftSidebar"),
  rightSidebar: document.getElementById("rightSidebar"),
  toggleLeftSidebarButton: document.getElementById("toggleLeftSidebarButton"),
  openOverviewButton: document.getElementById("openOverviewButton"),
  openFlowButton: document.getElementById("openFlowButton"),
  openGraphButton: document.getElementById("openGraphButton"),
  newNoteRailButton: document.getElementById("newNoteRailButton"),
  resetWorkspaceButton: document.getElementById("resetWorkspaceButton"),
  openOverviewSidebarButton: document.getElementById("openOverviewSidebarButton"),
  openFlowSidebarButton: document.getElementById("openFlowSidebarButton"),
  newNoteButton: document.getElementById("newNoteButton"),
  openGraphSidebarButton: document.getElementById("openGraphSidebarButton"),
  noteSearchInput: document.getElementById("noteSearchInput"),
  filteredNoteCount: document.getElementById("filteredNoteCount"),
  noteTree: document.getElementById("noteTree"),
  noteCount: document.getElementById("noteCount"),
  entityCount: document.getElementById("entityCount"),
  relationCount: document.getElementById("relationCount"),
  headerLeftToggle: document.getElementById("headerLeftToggle"),
  openOverviewHeaderButton: document.getElementById("openOverviewHeaderButton"),
  openFlowHeaderButton: document.getElementById("openFlowHeaderButton"),
  newNoteHeaderButton: document.getElementById("newNoteHeaderButton"),
  newGraphHeaderButton: document.getElementById("newGraphHeaderButton"),
  headerRightToggle: document.getElementById("headerRightToggle"),
  tabStrip: document.getElementById("tabStrip"),
  addGraphTabButton: document.getElementById("addGraphTabButton"),
  tabPanels: document.getElementById("tabPanels"),
  statusLeft: document.getElementById("statusLeft"),
  statusCenter: document.getElementById("statusCenter"),
  statusRight: document.getElementById("statusRight"),
  inspectorTitle: document.getElementById("inspectorTitle"),
  toggleRightSidebarButton: document.getElementById("toggleRightSidebarButton"),
  linkedMentionCount: document.getElementById("linkedMentionCount"),
  linkedMentionsList: document.getElementById("linkedMentionsList"),
  unlinkedMentionCount: document.getElementById("unlinkedMentionCount"),
  unlinkedMentionsList: document.getElementById("unlinkedMentionsList"),
  ontologySummary: document.getElementById("ontologySummary"),
};

const state = {
  notes: [],
  query: "",
  tabs: [],
  activeTabId: null,
  ui: {
    leftSidebarOpen: true,
    rightSidebarOpen: true,
  },
  graph: {
    mode: DEFAULT_GRAPH_MODE,
    scope: "all",
    focusNodeId: null,
    pendingSelectionId: null,
    selectedNodeId: null,
    data: null,
    scene: null,
  },
};

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function displayNoteTitle(note) {
  const title = note?.title?.trim();
  return title || "제목 없는 메모";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function noteWordCount(text) {
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean).length;
}

function predicateLabel(predicateKey) {
  return PREDICATE_TYPES[predicateKey]?.label || PREDICATE_TYPES.related_to.label;
}

function predicateKeyFromLabel(label) {
  return PREDICATE_ALIAS_MAP[label.trim()] || "related_to";
}

function entityTypeLabel(type) {
  return ENTITY_TYPES[type]?.label || ENTITY_TYPES.topic.label;
}

function notePreview(body) {
  const firstLine = String(body || "")
    .replace(/^#+\s*/gm, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[[^:\]]+:([^\]]+)\]/g, "$1")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? firstLine.slice(0, 110) : "아직 내용이 없습니다.";
}

function stripMarkup(text) {
  return String(text || "")
    .replace(/^[-*]\s*/gm, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[[^:\]]+:([^\]]+)\]/g, "$1")
    .trim();
}

function extractMarkdownSectionLines(body, heading) {
  const lines = String(body || "").split("\n");
  const extracted = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^#\s+/.test(trimmed)) {
      const sectionName = trimmed.replace(/^#\s+/, "").trim();
      if (inSection && sectionName !== heading) {
        break;
      }
      inSection = sectionName === heading;
      continue;
    }

    if (!inSection) continue;
    const cleaned = stripMarkup(trimmed);
    if (cleaned) {
      extracted.push(cleaned);
    }
  }

  return extracted;
}

function getEntitiesByType(note, types) {
  const allowed = new Set(Array.isArray(types) ? types : [types]);
  return note.entities.filter((entity) => allowed.has(entity.type));
}

function getPrimaryNoteEntity(note) {
  return (
    getEntitiesByType(note, "decision")[0] ||
    getEntitiesByType(note, "rule")[0] ||
    getEntitiesByType(note, "process")[0] ||
    note.entities[0] ||
    null
  );
}

function entityNodeId(entity) {
  return `entity:${entity.type}:${normalizeKey(entity.label)}`;
}

function mergeEntities(existingEntities, extractedEntities) {
  const byKey = new Map(
    existingEntities.map((entity) => [`${entity.type}:${normalizeKey(entity.label)}`, entity]),
  );

  return extractedEntities.map((entity) => {
    const key = `${entity.type}:${normalizeKey(entity.label)}`;
    const existing = byKey.get(key);
    return existing
      ? { ...existing, label: entity.label, type: entity.type }
      : {
          id: uid("entity"),
          label: entity.label,
          type: entity.type,
        };
  });
}

function extractTypedEntities(text) {
  const entities = [];
  const seen = new Set();
  const pattern = /\[([^\]:]+):([^\]]+)\]/g;

  for (const match of text.matchAll(pattern)) {
    const type = TYPE_ALIASES[match[1].trim()];
    const label = match[2].trim();
    if (!type || !label) continue;
    const signature = `${type}:${normalizeKey(label)}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    entities.push({
      id: uid("entity"),
      label,
      type,
    });
  }

  return entities;
}

function extractExplicitRelations(text, entities) {
  const entityByKey = new Map(
    entities.map((entity) => [`${entity.type}:${normalizeKey(entity.label)}`, entity]),
  );
  const relations = [];
  const seen = new Set();
  const pattern =
    /\[([^\]:]+):([^\]]+)\]\s*--([^>-]+)-->\s*\[([^\]:]+):([^\]]+)\]/g;

  for (const match of text.matchAll(pattern)) {
    const sourceType = TYPE_ALIASES[match[1].trim()];
    const sourceLabel = match[2].trim();
    const predicateKey = predicateKeyFromLabel(match[3].trim());
    const targetType = TYPE_ALIASES[match[4].trim()];
    const targetLabel = match[5].trim();
    if (!sourceType || !targetType) continue;

    const source = entityByKey.get(`${sourceType}:${normalizeKey(sourceLabel)}`);
    const target = entityByKey.get(`${targetType}:${normalizeKey(targetLabel)}`);
    if (!source || !target || source.id === target.id) continue;

    const signature = `${source.id}:${predicateKey}:${target.id}`;
    if (seen.has(signature)) continue;
    seen.add(signature);

    relations.push({
      id: uid("relation"),
      sourceId: source.id,
      targetId: target.id,
      predicateKey,
      label: predicateLabel(predicateKey),
      evidence: match[0],
    });
  }

  return relations;
}

function syncNoteOntology(note) {
  const extractedEntities = extractTypedEntities(note.body);
  const hasExplicitEntities = extractedEntities.length > 0;
  note.entities = hasExplicitEntities
    ? mergeEntities(note.entities || [], extractedEntities)
    : Array.isArray(note.entities)
      ? note.entities
      : [];

  const validEntityIds = new Set(note.entities.map((entity) => entity.id));
  const explicitRelations = extractExplicitRelations(note.body, note.entities);
  const existingRelations = Array.isArray(note.relations) ? note.relations : [];

  note.relations =
    explicitRelations.length > 0
      ? explicitRelations
      : existingRelations.filter(
          (relation) =>
            validEntityIds.has(relation.sourceId) && validEntityIds.has(relation.targetId),
        );
}

function createStructuredSeedNote(seed, offset = 0) {
  const entityByKey = Object.fromEntries(
    seed.entities.map((entity) => [
      entity.key,
      {
        id: uid("entity"),
        label: entity.label,
        type: entity.type,
      },
    ]),
  );

  const createdAt = new Date(Date.now() - offset * 60000).toISOString();
  const relations = seed.relations.map((relation) => ({
    id: uid("relation"),
    sourceId: entityByKey[relation.sourceKey].id,
    targetId: entityByKey[relation.targetKey].id,
    predicateKey: relation.predicateKey,
    label: predicateLabel(relation.predicateKey),
    evidence: relation.evidence || "",
  }));

  return {
    id: uid("note"),
    title: seed.title,
    body: seed.body,
    entities: Object.values(entityByKey),
    relations,
    createdAt,
    updatedAt: createdAt,
  };
}

function createSeedNotes() {
  const seeds = [
    {
      title: "안건 1. 청소 요청 접수 방식을 태블릿 구글폼으로 전환",
      body: [
        "# 결론",
        "[결정:태블릿 구글폼 접수 도입]에 대체로 동의했다.",
        "",
        "# 시스템",
        "현재 [프로세스:청소 요청 접수]는 [채널:종이 요청서]를 받고 [채널:카카오톡 전달]로 다시 옮겨 적는 구조다.",
        "[시스템:태블릿 구글폼]으로 바꾸면 [시스템:스프레드시트]에 즉시 저장할 수 있다.",
        "",
        "# 요구사항",
        "- [요구사항:직원 대리 입력 지원]",
        "- [요구사항:단순한 입력 화면]",
        "- [요구사항:종이 예비 수단 유지]",
        "",
        "# 연결 노트",
        "[[안건 2. PMS 기반 예약경로 자동 수집]]",
        "[[안건 4. 청소 담당자별 자동 메시지 전송]]",
        "[[안건 5. 2주 병행 운영과 검증 지표]]",
      ].join("\n"),
      entities: [
        { key: "intake_process", label: "청소 요청 접수", type: "process" },
        { key: "paper_channel", label: "종이 요청서", type: "channel" },
        { key: "kakao_channel", label: "카카오톡 전달", type: "channel" },
        { key: "tablet_form", label: "태블릿 구글폼", type: "system" },
        { key: "spreadsheet", label: "스프레드시트", type: "system" },
        { key: "decision_tablet", label: "태블릿 구글폼 접수 도입", type: "decision" },
        { key: "requirement_proxy", label: "직원 대리 입력 지원", type: "requirement" },
        { key: "requirement_simple", label: "단순한 입력 화면", type: "requirement" },
        { key: "requirement_paper_backup", label: "종이 예비 수단 유지", type: "requirement" },
      ],
      relations: [
        { sourceKey: "intake_process", targetKey: "paper_channel", predicateKey: "uses" },
        { sourceKey: "intake_process", targetKey: "kakao_channel", predicateKey: "routes_to" },
        { sourceKey: "decision_tablet", targetKey: "tablet_form", predicateKey: "uses" },
        { sourceKey: "tablet_form", targetKey: "spreadsheet", predicateKey: "routes_to" },
        { sourceKey: "decision_tablet", targetKey: "requirement_proxy", predicateKey: "requires" },
        { sourceKey: "decision_tablet", targetKey: "requirement_simple", predicateKey: "requires" },
        {
          sourceKey: "decision_tablet",
          targetKey: "requirement_paper_backup",
          predicateKey: "fallback_to",
        },
      ],
    },
    {
      title: "안건 2. PMS 기반 예약경로 자동 수집",
      body: [
        "# 결론",
        "[결정:PMS 기반 예약경로 자동 수집]으로 추진한다.",
        "",
        "# 시스템",
        "[프로세스:예약경로 기반 청소 분류]는 [시스템:PMS]에서 예약경로를 가져와 판단한다.",
        "",
        "# 요구사항",
        "- [요구사항:초기 자동 분류 사람 검토]",
        "- [요구사항:최종 메시지 예약경로 표시]",
        "",
        "# 연결 노트",
        "[[안건 1. 청소 요청 접수 방식을 태블릿 구글폼으로 전환]]",
        "[[안건 3. 오전 11시 이전 요청만 당일 자동 전달]]",
        "[[안건 4. 청소 담당자별 자동 메시지 전송]]",
      ].join("\n"),
      entities: [
        { key: "booking_process", label: "예약경로 기반 청소 분류", type: "process" },
        { key: "pms", label: "PMS", type: "system" },
        { key: "decision_booking_auto", label: "PMS 기반 예약경로 자동 수집", type: "decision" },
        { key: "requirement_human_review", label: "초기 자동 분류 사람 검토", type: "requirement" },
        { key: "requirement_show_booking", label: "최종 메시지 예약경로 표시", type: "requirement" },
      ],
      relations: [
        { sourceKey: "booking_process", targetKey: "pms", predicateKey: "uses" },
        { sourceKey: "decision_booking_auto", targetKey: "pms", predicateKey: "uses" },
        {
          sourceKey: "decision_booking_auto",
          targetKey: "requirement_human_review",
          predicateKey: "requires",
        },
        {
          sourceKey: "decision_booking_auto",
          targetKey: "requirement_show_booking",
          predicateKey: "requires",
        },
      ],
    },
    {
      title: "안건 3. 오전 11시 이전 요청만 당일 자동 전달",
      body: [
        "# 결론",
        "[규칙:오전 11시 이전만 당일 자동 전달]을 적용한다.",
        "[규칙:11시 이후 요청은 익일 리스트 반영]으로 분리한다.",
        "",
        "# 운영 조건",
        "- [요구사항:서버 시간 기준 판정]",
        "- [요구사항:당일 대상과 익일 대상을 분리 표시]",
        "- [채널:다음날 청소 리스트]는 11시 이후 요청 저장 채널이다.",
        "",
        "# 연결 노트",
        "[[안건 2. PMS 기반 예약경로 자동 수집]]",
        "[[안건 5. 2주 병행 운영과 검증 지표]]",
      ].join("\n"),
      entities: [
        { key: "same_day_rule", label: "오전 11시 이전만 당일 자동 전달", type: "rule" },
        { key: "next_day_rule", label: "11시 이후 요청은 익일 리스트 반영", type: "rule" },
        { key: "decision_cutoff", label: "당일 자동 전달 기준 확정", type: "decision" },
        { key: "requirement_server_time", label: "서버 시간 기준 판정", type: "requirement" },
        {
          key: "requirement_split_views",
          label: "당일 대상과 익일 대상을 분리 표시",
          type: "requirement",
        },
        { key: "next_day_list", label: "다음날 청소 리스트", type: "channel" },
      ],
      relations: [
        { sourceKey: "decision_cutoff", targetKey: "same_day_rule", predicateKey: "requires" },
        { sourceKey: "decision_cutoff", targetKey: "next_day_rule", predicateKey: "requires" },
        {
          sourceKey: "decision_cutoff",
          targetKey: "requirement_server_time",
          predicateKey: "requires",
        },
        {
          sourceKey: "decision_cutoff",
          targetKey: "requirement_split_views",
          predicateKey: "requires",
        },
        { sourceKey: "next_day_rule", targetKey: "next_day_list", predicateKey: "routes_to" },
      ],
    },
    {
      title: "안건 4. 청소 담당자별 자동 메시지 전송",
      body: [
        "# 결론",
        "[결정:객실별 담당자 매핑 도입]을 검토한다.",
        "",
        "# 시스템",
        "[프로세스:담당자별 메시지 전송]은 객실별 담당자 매핑과 [시스템:스프레드시트]를 사용한다.",
        "[채널:자동 메시지]는 기술적으로 가능한 범위 내에서 사용한다.",
        "",
        "# 요구사항",
        "- [요구사항:담당자 정보 스프레드시트 수정 가능]",
        "- [요구사항:개별 전달과 전체 요약 병행]",
        "",
        "# 연결 노트",
        "[[안건 1. 청소 요청 접수 방식을 태블릿 구글폼으로 전환]]",
        "[[안건 2. PMS 기반 예약경로 자동 수집]]",
        "[[안건 5. 2주 병행 운영과 검증 지표]]",
      ].join("\n"),
      entities: [
        { key: "staff_message_process", label: "담당자별 메시지 전송", type: "process" },
        { key: "decision_staff_mapping", label: "객실별 담당자 매핑 도입", type: "decision" },
        {
          key: "requirement_edit_mapping",
          label: "담당자 정보 스프레드시트 수정 가능",
          type: "requirement",
        },
        {
          key: "requirement_summary_parallel",
          label: "개별 전달과 전체 요약 병행",
          type: "requirement",
        },
        { key: "auto_message_channel", label: "자동 메시지", type: "channel" },
        { key: "spreadsheet_mapping", label: "스프레드시트", type: "system" },
      ],
      relations: [
        { sourceKey: "staff_message_process", targetKey: "spreadsheet_mapping", predicateKey: "uses" },
        {
          sourceKey: "staff_message_process",
          targetKey: "auto_message_channel",
          predicateKey: "routes_to",
        },
        {
          sourceKey: "decision_staff_mapping",
          targetKey: "requirement_edit_mapping",
          predicateKey: "requires",
        },
        {
          sourceKey: "decision_staff_mapping",
          targetKey: "requirement_summary_parallel",
          predicateKey: "requires",
        },
      ],
    },
    {
      title: "안건 5. 2주 병행 운영과 검증 지표",
      body: [
        "# 결론",
        "[결정:2주 병행 운영]으로 시작한다.",
        "",
        "# 검증",
        "[프로세스:병행 운영 검증]에서 [지표:누락 건수], [지표:중복 건수], [지표:처리 시간 감소]를 본다.",
        "- [요구사항:현장 최종 기준 채널 하나 유지]",
        "",
        "# 연결 노트",
        "[[안건 1. 청소 요청 접수 방식을 태블릿 구글폼으로 전환]]",
        "[[안건 3. 오전 11시 이전 요청만 당일 자동 전달]]",
        "[[안건 4. 청소 담당자별 자동 메시지 전송]]",
      ].join("\n"),
      entities: [
        { key: "decision_parallel", label: "2주 병행 운영", type: "decision" },
        { key: "parallel_process", label: "병행 운영 검증", type: "process" },
        { key: "metric_missing", label: "누락 건수", type: "metric" },
        { key: "metric_duplicate", label: "중복 건수", type: "metric" },
        { key: "metric_time", label: "처리 시간 감소", type: "metric" },
        {
          key: "requirement_single_channel",
          label: "현장 최종 기준 채널 하나 유지",
          type: "requirement",
        },
      ],
      relations: [
        { sourceKey: "decision_parallel", targetKey: "parallel_process", predicateKey: "reviewed_by" },
        {
          sourceKey: "parallel_process",
          targetKey: "metric_missing",
          predicateKey: "measured_by",
        },
        {
          sourceKey: "parallel_process",
          targetKey: "metric_duplicate",
          predicateKey: "measured_by",
        },
        { sourceKey: "parallel_process", targetKey: "metric_time", predicateKey: "measured_by" },
        {
          sourceKey: "decision_parallel",
          targetKey: "requirement_single_channel",
          predicateKey: "requires",
        },
      ],
    },
  ];

  return seeds.map((seed, index) => createStructuredSeedNote(seed, index));
}

function currentSeedTitles() {
  return new Set(createSeedNotes().map((note) => note.title));
}

function isSeedNoteCollection(notes) {
  const titles = currentSeedTitles();
  return notes.length > 0 && notes.every((note) => titles.has(note.title));
}

function hydrateNotes(rawNotes) {
  if (!Array.isArray(rawNotes)) return [];

  return rawNotes
    .map((rawNote) => {
      const rawEntities = Array.isArray(rawNote.entities)
        ? rawNote.entities
        : Array.isArray(rawNote.mentions)
          ? rawNote.mentions
          : [];

      const entities = rawEntities.map((entity) => ({
            id: entity.id || uid("entity"),
            label: entity.label || "이름 없는 개체",
            type: ENTITY_TYPES[entity.type] ? entity.type : "topic",
          }));

      const entityIds = new Set(entities.map((entity) => entity.id));
      const rawRelations = Array.isArray(rawNote.relations)
        ? rawNote.relations
        : Array.isArray(rawNote.assertions)
          ? rawNote.assertions
          : [];

      const relations = rawRelations
            .map((relation) => {
              const predicateKey = relation.predicateKey || predicateKeyFromLabel(relation.label || "");
              return {
                id: relation.id || uid("relation"),
                sourceId: relation.sourceId,
                targetId: relation.targetId,
                predicateKey,
                label: predicateLabel(predicateKey),
                evidence: relation.evidence || "",
              };
            })
            .filter(
              (relation) =>
                entityIds.has(relation.sourceId) && entityIds.has(relation.targetId),
            );

      const note = {
        id: rawNote.id || uid("note"),
        title: rawNote.title || "",
        body: rawNote.body || "",
        entities,
        relations,
        createdAt: rawNote.createdAt || nowIso(),
        updatedAt: rawNote.updatedAt || rawNote.createdAt || nowIso(),
      };

      syncNoteOntology(note);
      return note;
    })
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

function loadNotes() {
  try {
    const current = hydrateNotes(JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY) || "[]"));
    if (current.length > 0) {
      return current;
    }
  } catch (error) {
    console.warn("현재 저장소를 읽지 못했습니다.", error);
  }

  for (const legacyKey of LEGACY_NOTE_STORAGE_KEYS) {
    try {
      const legacy = hydrateNotes(JSON.parse(localStorage.getItem(legacyKey) || "[]"));
      if (legacy.length === 0) continue;
      if (isSeedNoteCollection(legacy)) break;
      localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(legacy));
      return legacy;
    } catch (error) {
      console.warn("기존 저장소를 읽지 못했습니다.", error);
    }
  }

  const seeded = createSeedNotes();
  localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveNotes() {
  localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(state.notes));
}

function sortNotesByUpdatedAt() {
  state.notes.sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

function loadUiState() {
  try {
    const raw = JSON.parse(localStorage.getItem(UI_STORAGE_KEY) || "{}");
    return {
      leftSidebarOpen: raw.leftSidebarOpen !== false,
      rightSidebarOpen: raw.rightSidebarOpen !== false,
      graphMode: raw.graphMode === "ontology" ? "ontology" : DEFAULT_GRAPH_MODE,
      graphScope: raw.graphScope === "selection" ? "selection" : "all",
    };
  } catch (error) {
    console.warn("UI 상태를 읽지 못했습니다.", error);
    return {
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      graphMode: DEFAULT_GRAPH_MODE,
      graphScope: "all",
    };
  }
}

function saveUiState() {
  localStorage.setItem(
    UI_STORAGE_KEY,
    JSON.stringify({
      leftSidebarOpen: state.ui.leftSidebarOpen,
      rightSidebarOpen: state.ui.rightSidebarOpen,
      graphMode: state.graph.mode,
      graphScope: state.graph.scope,
    }),
  );
}

function getNoteById(noteId) {
  return state.notes.find((note) => note.id === noteId) || null;
}

function getActiveTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId) || null;
}

function createNoteTab(noteId) {
  return {
    id: `tab-note-${noteId}`,
    type: "note",
    noteId,
  };
}

function createOverviewTab() {
  return {
    id: OVERVIEW_TAB_ID,
    type: "overview",
  };
}

function createFlowTab() {
  return {
    id: FLOW_TAB_ID,
    type: "flow",
  };
}

function createGraphTab() {
  return {
    id: GRAPH_TAB_ID,
    type: "graph",
  };
}

function ensureAtLeastOneTab() {
  if (state.tabs.length > 0) return;
  const overviewTab = createOverviewTab();
  state.tabs = [overviewTab];
  state.activeTabId = overviewTab.id;
}

function openOverviewTab() {
  let tab = state.tabs.find((item) => item.type === "overview");
  if (!tab) {
    tab = createOverviewTab();
    state.tabs.unshift(tab);
  }
  state.activeTabId = tab.id;
  renderApp();
}

function openFlowTab() {
  let tab = state.tabs.find((item) => item.type === "flow");
  if (!tab) {
    tab = createFlowTab();
    state.tabs.push(tab);
  }
  state.activeTabId = tab.id;
  renderApp();
}

function openNoteTab(noteId) {
  let tab = state.tabs.find((item) => item.type === "note" && item.noteId === noteId);
  if (!tab) {
    tab = createNoteTab(noteId);
    state.tabs.push(tab);
  }

  state.activeTabId = tab.id;
  renderApp();
}

function openGraphTab(mode = state.graph.mode, selectionId = null, scope = null) {
  let tab = state.tabs.find((item) => item.type === "graph");
  if (!tab) {
    tab = createGraphTab();
    state.tabs.push(tab);
  }

  state.graph.mode = mode;
  state.graph.scope = scope || (selectionId ? "selection" : state.graph.scope);
  if (selectionId) {
    state.graph.focusNodeId = selectionId;
  }
  state.graph.pendingSelectionId = selectionId;
  state.activeTabId = tab.id;
  saveUiState();
  renderApp();
}

function closeTab(tabId) {
  const index = state.tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) return;

  const wasActive = state.activeTabId === tabId;
  state.tabs.splice(index, 1);

  if (wasActive) {
    const fallback = state.tabs[index - 1] || state.tabs[index] || null;
    state.activeTabId = fallback?.id || null;
  }

  ensureAtLeastOneTab();
  renderApp();
}

function setActiveTab(tabId) {
  if (state.activeTabId === tabId) return;
  state.activeTabId = tabId;
  renderApp();
}

function updateNote(noteId, patch) {
  const note = getNoteById(noteId);
  if (!note) return;
  Object.assign(note, patch);
  note.updatedAt = nowIso();
  syncNoteOntology(note);
  saveNotes();
}

function resetWorkspace() {
  state.notes = createSeedNotes();
  saveNotes();
  state.tabs = [createOverviewTab()];
  state.activeTabId = state.tabs[0].id;
  state.graph.scope = "all";
  state.graph.focusNodeId = null;
  state.graph.selectedNodeId = null;
  state.graph.pendingSelectionId = null;
  renderApp();
}

function createNewNote() {
  const timestamp = nowIso();
  const note = {
    id: uid("note"),
    title: "새 메모",
    body: [
      "# 메모",
      "",
      "여기에 내용을 적어보세요.",
      "",
      "예: [시스템:PMS], [결정:자동화 도입], [[안건 1. 청소 요청 접수 방식을 태블릿 구글폼으로 전환]]",
    ].join("\n"),
    entities: [],
    relations: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  syncNoteOntology(note);
  state.notes.unshift(note);
  sortNotesByUpdatedAt();
  saveNotes();
  openNoteTab(note.id);
}

function parseWikiLinks(body) {
  return [...body.matchAll(/\[\[([^\]]+)\]\]/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function getLinkedNotes(note) {
  const titleToNote = new Map(state.notes.map((item) => [displayNoteTitle(item), item]));
  const unique = new Map();
  for (const linkedTitle of parseWikiLinks(note.body)) {
    const linkedNote = titleToNote.get(linkedTitle);
    if (!linkedNote || linkedNote.id === note.id) continue;
    unique.set(linkedNote.id, {
      note: linkedNote,
      reason: "링크됨",
      preview: notePreview(linkedNote.body),
      tags: ["wiki link"],
    });
  }
  return [...unique.values()];
}

function getBacklinks(note) {
  return state.notes
    .filter(
      (candidate) =>
        candidate.id !== note.id && parseWikiLinks(candidate.body).includes(displayNoteTitle(note)),
    )
    .map((candidate) => ({
      note: candidate,
      reason: "백링크",
      preview: notePreview(candidate.body),
      tags: ["backlink"],
    }));
}

function getUnlinkedMentions(note) {
  const currentEntityKeys = new Set(
    note.entities.map((entity) => `${entity.type}:${normalizeKey(entity.label)}`),
  );
  const linkedIds = new Set([
    ...getLinkedNotes(note).map((item) => item.note.id),
    ...getBacklinks(note).map((item) => item.note.id),
  ]);

  return state.notes
    .filter((candidate) => candidate.id !== note.id && !linkedIds.has(candidate.id))
    .map((candidate) => {
      const shared = candidate.entities
        .filter((entity) => currentEntityKeys.has(`${entity.type}:${normalizeKey(entity.label)}`))
        .map((entity) => entity.label);

      if (shared.length === 0) return null;
      return {
        note: candidate,
        reason: "공유 개체",
        preview: notePreview(candidate.body),
        tags: shared.slice(0, 3),
      };
    })
    .filter(Boolean);
}

function getFilteredNotes() {
  const query = state.query.trim().toLowerCase();
  if (!query) return [...state.notes];

  return state.notes.filter((note) => {
    const haystack = [
      displayNoteTitle(note),
      note.body,
      ...note.entities.map((entity) => `${entity.label} ${entityTypeLabel(entity.type)}`),
      ...note.relations.map((relation) => relation.label),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function buildDecisionCardsData() {
  return state.notes.map((note) => {
    const primary = getPrimaryNoteEntity(note);
    const decisions = getEntitiesByType(note, "decision");
    const rules = getEntitiesByType(note, "rule");
    const requirements = getEntitiesByType(note, "requirement");
    const systems = getEntitiesByType(note, ["system", "channel"]);
    const processes = getEntitiesByType(note, "process");
    const metrics = getEntitiesByType(note, "metric");

    const summaryLines = extractMarkdownSectionLines(note.body, "결론");
    const contextLines = [
      ...extractMarkdownSectionLines(note.body, "시스템"),
      ...extractMarkdownSectionLines(note.body, "운영 조건"),
      ...extractMarkdownSectionLines(note.body, "검증"),
    ];

    return {
      note,
      primary,
      summary: summaryLines[0] || notePreview(note.body),
      detail: contextLines[0] || notePreview(note.body),
      decisions,
      rules,
      requirements,
      systems,
      processes,
      metrics,
    };
  });
}

function buildFlowStages() {
  const stageConfigs = [
    {
      id: "intake",
      label: "1. 요청 접수",
      description: "손님 요청을 구조화해서 받는 단계",
      matches: ["접수", "구글폼", "종이 요청서"],
    },
    {
      id: "classification",
      label: "2. 자동 분류",
      description: "예약경로와 시간 규칙으로 당일/익일을 나누는 단계",
      matches: ["예약경로", "11시", "익일"],
    },
    {
      id: "dispatch",
      label: "3. 담당자 전달",
      description: "누구에게 어떤 채널로 보낼지 정리하는 단계",
      matches: ["담당자", "메시지", "카카오톡"],
    },
    {
      id: "validation",
      label: "4. 검증",
      description: "병행 운영과 지표로 결과를 확인하는 단계",
      matches: ["병행 운영", "검증", "지표"],
    },
  ];

  return stageConfigs
    .map((stage) => {
      const notes = state.notes
        .filter((note) => {
          const haystack = displayNoteTitle(note).toLowerCase();
          return stage.matches.some((keyword) => haystack.includes(keyword.toLowerCase()));
        })
        .map((note) => ({
          note,
          primary: getPrimaryNoteEntity(note),
          summary:
            extractMarkdownSectionLines(note.body, "결론")[0] ||
            extractMarkdownSectionLines(note.body, "시스템")[0] ||
            notePreview(note.body),
          systems: getEntitiesByType(note, ["system", "channel"]),
          requirements: getEntitiesByType(note, "requirement"),
          metrics: getEntitiesByType(note, "metric"),
          rules: getEntitiesByType(note, "rule"),
        }));

      return {
        ...stage,
        notes,
      };
    })
    .filter((stage) => stage.notes.length > 0);
}

function countEntities() {
  return state.notes.reduce((sum, note) => sum + note.entities.length, 0);
}

function countRelations() {
  return state.notes.reduce((sum, note) => sum + note.relations.length, 0);
}

function applyUiClasses() {
  elements.appShell.classList.toggle("is-left-collapsed", !state.ui.leftSidebarOpen);
  elements.appShell.classList.toggle("is-right-collapsed", !state.ui.rightSidebarOpen);
}

function renderCounters() {
  elements.noteCount.textContent = String(state.notes.length);
  elements.entityCount.textContent = String(countEntities());
  elements.relationCount.textContent = String(countRelations());
}

function renderNoteTree() {
  const filteredNotes = getFilteredNotes();
  const activeContext = getInspectorContext();
  const activeNoteId = activeContext?.kind === "note" ? activeContext.note.id : null;

  elements.filteredNoteCount.textContent = String(filteredNotes.length);

  if (filteredNotes.length === 0) {
    elements.noteTree.innerHTML = `
      <div class="empty-card">
        검색 결과가 없습니다.
      </div>
    `;
    return;
  }

  elements.noteTree.innerHTML = filteredNotes
    .map((note) => {
      const isActive = note.id === activeNoteId;
      return `
        <button class="note-tree-item ${isActive ? "is-active" : ""}" data-note-id="${note.id}" type="button">
          <span class="note-tree-title">${escapeHtml(displayNoteTitle(note))}</span>
          <span class="note-tree-meta">
            <span>${note.entities.length} entities</span>
            <span>${formatDate(note.updatedAt)}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderEntityChipsMarkup(entities, maxItems = 6) {
  if (!entities || entities.length === 0) {
    return `<span class="ghost-tag">없음</span>`;
  }

  return entities
    .slice(0, maxItems)
    .map(
      (entity) => `
        <span class="type-chip" data-type="${entity.type}">
          ${escapeHtml(entity.label)}
        </span>
      `,
    )
    .join("");
}

function renderOverviewView() {
  const cards = buildDecisionCardsData();

  elements.tabPanels.innerHTML = `
    <div class="view-shell overview-shell">
      <div class="document-toolbar">
        <div class="toolbar-meta">
          <p class="toolbar-kicker">summary view</p>
          <h2 class="toolbar-title">호텔 청소 자동화 의사결정 요약</h2>
        </div>
        <div class="toolbar-actions">
          <button class="graph-action-button" data-action="open-flow-tab" type="button">
            프로세스 플로우
          </button>
          <button class="graph-action-button" data-action="open-full-ontology-graph" type="button">
            전체 온톨로지 그래프
          </button>
        </div>
      </div>
      <div class="view-scroll">
        <div class="overview-page">
          <section class="overview-hero-card">
            <p class="toolbar-kicker">meeting</p>
            <h3 class="overview-title">그래프보다 먼저 읽히는 회의 구조</h3>
            <p class="overview-copy">
              이 회의는 "무엇을 하기로 했는가", "그 결정에 어떤 조건이 붙는가", "어떤 도구와 채널이 필요한가",
              "어떻게 검증할 것인가" 순서로 읽는 게 맞습니다. 그래서 아래 카드는 결정 중심, 플로우는 운영 중심,
              그래프는 탐색 중심으로 분리했습니다.
            </p>
            <div class="overview-stat-row">
              <div class="overview-stat-card">
                <span>핵심 안건</span>
                <strong>${state.notes.length}</strong>
              </div>
              <div class="overview-stat-card">
                <span>핵심 결정/규칙</span>
                <strong>${cards.reduce((sum, card) => sum + card.decisions.length + card.rules.length, 0)}</strong>
              </div>
              <div class="overview-stat-card">
                <span>요구사항</span>
                <strong>${cards.reduce((sum, card) => sum + card.requirements.length, 0)}</strong>
              </div>
            </div>
          </section>

          <section class="overview-section">
            <div class="overview-section-head">
              <div>
                <p class="toolbar-kicker">decisions</p>
                <h3 class="overview-section-title">결정 중심 카드</h3>
              </div>
              <span class="section-count">${cards.length} cards</span>
            </div>
            <div class="decision-grid">
              ${cards
                .map((card) => {
                  const primary = card.primary;
                  const primaryType = primary?.type || "note";
                  const primaryNodeId = primary ? entityNodeId(primary) : "";
                  return `
                    <article class="decision-card" data-type="${primaryType}">
                      <div class="decision-card-head">
                        <div>
                          <p class="decision-kicker">${escapeHtml(card.note.title)}</p>
                          <h4 class="decision-title">${escapeHtml(primary?.label || displayNoteTitle(card.note))}</h4>
                        </div>
                        <span class="type-chip" data-type="${primaryType}">
                          ${escapeHtml(entityTypeLabel(primaryType))}
                        </span>
                      </div>
                      <p class="decision-summary">${escapeHtml(card.summary)}</p>
                      <p class="decision-detail">${escapeHtml(card.detail)}</p>
                      <div class="decision-meta-grid">
                        <div class="decision-meta-block">
                          <span class="meta-label">요구사항</span>
                          <div class="ontology-chip-row">${renderEntityChipsMarkup(card.requirements)}</div>
                        </div>
                        <div class="decision-meta-block">
                          <span class="meta-label">도구 / 채널</span>
                          <div class="ontology-chip-row">${renderEntityChipsMarkup(card.systems)}</div>
                        </div>
                        <div class="decision-meta-block">
                          <span class="meta-label">프로세스 / 규칙</span>
                          <div class="ontology-chip-row">${renderEntityChipsMarkup([...card.processes, ...card.rules])}</div>
                        </div>
                        <div class="decision-meta-block">
                          <span class="meta-label">검증 지표</span>
                          <div class="ontology-chip-row">${renderEntityChipsMarkup(card.metrics)}</div>
                        </div>
                      </div>
                      <div class="decision-actions">
                        <button class="action-button" data-action="open-note-tab" data-note-id="${card.note.id}" type="button">
                          메모 열기
                        </button>
                        ${
                          primary
                            ? `<button class="action-button" data-action="open-focused-graph" data-node-id="${primaryNodeId}" type="button">
                                 이 결정만 그래프로 보기
                               </button>`
                            : ""
                        }
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}

function renderFlowView() {
  const stages = buildFlowStages();

  elements.tabPanels.innerHTML = `
    <div class="view-shell flow-shell">
      <div class="document-toolbar">
        <div class="toolbar-meta">
          <p class="toolbar-kicker">flow view</p>
          <h2 class="toolbar-title">운영 프로세스 플로우</h2>
        </div>
        <div class="toolbar-actions">
          <button class="graph-action-button" data-action="open-overview-tab" type="button">
            결정 요약
          </button>
          <button class="graph-action-button" data-action="open-full-note-graph" type="button">
            노트 그래프
          </button>
        </div>
      </div>
      <div class="view-scroll">
        <div class="flow-page">
          <section class="overview-hero-card flow-hero-card">
            <p class="toolbar-kicker">workflow</p>
            <h3 class="overview-title">접수 -> 분류 -> 전달 -> 검증</h3>
            <p class="overview-copy">
              이 회의의 핵심은 그래프가 아니라 운영 흐름입니다. 손님 요청을 어떻게 받고, 어떤 기준으로 나누고,
              누구에게 어떤 채널로 보내고, 마지막에 무엇으로 검증할지를 단계별로 보는 게 더 이해하기 쉽습니다.
            </p>
          </section>
          <section class="flow-lane-grid">
            ${stages
              .map(
                (stage) => `
                  <article class="flow-lane">
                    <div class="flow-lane-head">
                      <div>
                        <p class="toolbar-kicker">${escapeHtml(stage.id)}</p>
                        <h3 class="flow-lane-title">${escapeHtml(stage.label)}</h3>
                      </div>
                      <span class="section-count">${stage.notes.length}</span>
                    </div>
                    <p class="flow-lane-copy">${escapeHtml(stage.description)}</p>
                    <div class="flow-note-stack">
                      ${stage.notes
                        .map((item) => {
                          const primary = item.primary;
                          return `
                            <article class="flow-note-card" data-type="${primary?.type || "note"}">
                              <div class="flow-note-top">
                                <strong>${escapeHtml(displayNoteTitle(item.note))}</strong>
                                ${
                                  primary
                                    ? `<span class="ghost-tag">${escapeHtml(primary.label)}</span>`
                                    : ""
                                }
                              </div>
                              <p>${escapeHtml(item.summary)}</p>
                              <div class="ontology-chip-row">
                                ${renderEntityChipsMarkup(
                                  [...item.rules, ...item.systems, ...item.requirements, ...item.metrics],
                                  5,
                                )}
                              </div>
                              <div class="decision-actions">
                                <button class="action-button" data-action="open-note-tab" data-note-id="${item.note.id}" type="button">
                                  메모 열기
                                </button>
                                ${
                                  primary
                                    ? `<button class="action-button" data-action="open-focused-graph" data-node-id="${entityNodeId(primary)}" type="button">
                                         그래프
                                       </button>`
                                    : ""
                                }
                              </div>
                            </article>
                          `;
                        })
                        .join("")}
                    </div>
                  </article>
                `,
              )
              .join("")}
          </section>
        </div>
      </div>
    </div>
  `;
}

function renderTabs() {
  elements.tabStrip.innerHTML = state.tabs
    .map((tab) => {
      const isActive = tab.id === state.activeTabId;
      const label =
        tab.type === "overview"
          ? "Decision summary"
          : tab.type === "flow"
            ? "Process flow"
            : tab.type === "note"
          ? displayNoteTitle(getNoteById(tab.noteId))
          : state.graph.mode === "ontology"
            ? state.graph.scope === "selection"
              ? "Graph view: Focus"
              : "Graph view: Ontology"
            : state.graph.scope === "selection"
              ? "Graph view: Note focus"
              : "Graph view";

      return `
        <button class="tab-button ${isActive ? "is-active" : ""}" data-tab-id="${tab.id}" type="button">
          <span class="tab-label">${escapeHtml(label)}</span>
          <span class="tab-close" data-close-tab="${tab.id}">x</span>
        </button>
      `;
    })
    .join("");
}

function renderNoteEntityChips(note) {
  const container = elements.tabPanels.querySelector("#noteEntityChips");
  if (!container) return;

  if (note.entities.length === 0) {
    container.innerHTML = `<div class="empty-card">본문에 <code>[타입:이름]</code> 형식으로 개체를 넣으면 여기 나타납니다.</div>`;
    return;
  }

  container.innerHTML = note.entities
    .map(
      (entity) => `
        <button
          class="entity-pill entity-button"
          data-type="${entity.type}"
          data-action="focus-entity"
          data-node-id="${entityNodeId(entity)}"
          type="button"
        >
          <span>${escapeHtml(entity.label)}</span>
          <span>${escapeHtml(entityTypeLabel(entity.type))}</span>
        </button>
      `,
    )
    .join("");
}

function renderNoteRelations(note) {
  const container = elements.tabPanels.querySelector("#noteRelationList");
  if (!container) return;

  if (note.relations.length === 0) {
    container.innerHTML = `<div class="empty-card">이 노트에는 저장된 관계가 없습니다.</div>`;
    return;
  }

  const entityById = new Map(note.entities.map((entity) => [entity.id, entity]));

  container.innerHTML = note.relations
    .map((relation) => {
      const source = entityById.get(relation.sourceId);
      const target = entityById.get(relation.targetId);
      if (!source || !target) return "";

      return `
        <div class="relation-row">
          <strong>${escapeHtml(source.label)} --${escapeHtml(relation.label)}--> ${escapeHtml(target.label)}</strong>
          <span>${escapeHtml(entityTypeLabel(source.type))} -> ${escapeHtml(entityTypeLabel(target.type))}</span>
        </div>
      `;
    })
    .join("");
}

function renderNoteView(note) {
  elements.tabPanels.innerHTML = `
    <div class="view-shell">
      <div class="document-toolbar">
        <div class="toolbar-meta">
          <p class="toolbar-kicker">note view</p>
          <h2 class="toolbar-title">${escapeHtml(displayNoteTitle(note))}</h2>
        </div>
        <div class="toolbar-actions">
          <button class="graph-action-button" data-action="refresh-ontology" type="button">
            온톨로지 다시 읽기
          </button>
          <button class="graph-action-button" data-action="open-ontology-graph" type="button">
            온톨로지 그래프
          </button>
        </div>
      </div>
      <div class="view-scroll">
        <div class="note-editor">
          <input
            class="note-title-input"
            id="activeNoteTitle"
            value="${escapeHtml(note.title)}"
            placeholder="제목 없는 메모"
            autocomplete="off"
          />
          <div class="note-meta-row">
            <span id="noteUpdatedLabel">마지막 수정 ${escapeHtml(formatDate(note.updatedAt))}</span>
            <span id="noteMetaSummary">${note.entities.length} entities · ${note.relations.length} relations</span>
          </div>
          <p class="helper-copy">
            메모 안에 <code>[시스템:PMS]</code>, <code>[결정:자동화 도입]</code>, <code>[[다른 노트 제목]]</code> 같은 표기를 넣으면
            오른쪽 패널과 그래프에 바로 반영됩니다.
          </p>
          <textarea
            class="note-body-input"
            id="activeNoteBody"
            spellcheck="false"
            placeholder="여기에 메모를 작성하세요."
          >${escapeHtml(note.body)}</textarea>
          <div class="note-panels">
            <section class="subpanel">
              <div class="subpanel-header">
                <h3>개체</h3>
                <span class="helper-label" id="noteEntitiesCount">${note.entities.length} items</span>
              </div>
              <div class="chip-row" id="noteEntityChips"></div>
            </section>
            <section class="subpanel">
              <div class="subpanel-header">
                <h3>관계</h3>
                <span class="helper-label" id="noteRelationsCount">${note.relations.length} items</span>
              </div>
              <div class="relation-list" id="noteRelationList"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `;

  renderNoteEntityChips(note);
  renderNoteRelations(note);
}

function refreshNoteHeader(note) {
  const toolbarTitle = elements.tabPanels.querySelector(".toolbar-title");
  const updatedLabel = elements.tabPanels.querySelector("#noteUpdatedLabel");
  const metaSummary = elements.tabPanels.querySelector("#noteMetaSummary");
  const entityCount = elements.tabPanels.querySelector("#noteEntitiesCount");
  const relationCount = elements.tabPanels.querySelector("#noteRelationsCount");

  if (toolbarTitle) {
    toolbarTitle.textContent = displayNoteTitle(note);
  }

  if (updatedLabel) {
    updatedLabel.textContent = `마지막 수정 ${formatDate(note.updatedAt)}`;
  }

  if (metaSummary) {
    metaSummary.textContent = `${note.entities.length} entities · ${note.relations.length} relations`;
  }

  if (entityCount) {
    entityCount.textContent = `${note.entities.length} items`;
  }

  if (relationCount) {
    relationCount.textContent = `${note.relations.length} items`;
  }
}

function buildNoteGraphData() {
  const nodes = state.notes.map((note) => ({
    id: `note:${note.id}`,
    label: displayNoteTitle(note),
    type: "note",
    kind: "note",
    noteId: note.id,
    color: ENTITY_TYPES.note.color,
    size: 18 + Math.min(8, note.entities.length),
  }));

  const byNoteId = new Map(state.notes.map((note) => [note.id, note]));
  const titleToNote = new Map(state.notes.map((note) => [displayNoteTitle(note), note]));
  const linkMap = new Map();

  state.notes.forEach((note) => {
    for (const linkedTitle of parseWikiLinks(note.body)) {
      const target = titleToNote.get(linkedTitle);
      if (!target || target.id === note.id) continue;
      const key = [note.id, target.id].sort().join(":");
      const existing = linkMap.get(key);
      if (existing) {
        existing.weight += 1;
      } else {
        linkMap.set(key, {
          id: `edge:${key}`,
          source: `note:${note.id}`,
          target: `note:${target.id}`,
          label: "",
          kind: "note-link",
          weight: 1,
        });
      }
    }
  });

  for (let index = 0; index < state.notes.length; index += 1) {
    for (let next = index + 1; next < state.notes.length; next += 1) {
      const left = state.notes[index];
      const right = state.notes[next];
      const key = [left.id, right.id].sort().join(":");
      if (linkMap.has(key)) continue;

      const shared = left.entities.filter((entity) =>
        right.entities.some(
          (candidate) =>
            candidate.type === entity.type &&
            normalizeKey(candidate.label) === normalizeKey(entity.label),
        ),
      );

      if (shared.length === 0) continue;

      linkMap.set(key, {
        id: `edge:${key}`,
        source: `note:${left.id}`,
        target: `note:${right.id}`,
        label: "",
        kind: "shared-entity",
        weight: 0.7 + shared.length * 0.15,
      });
    }
  }

  return {
    nodes,
    links: [...linkMap.values()],
    meta: {
      summary: `${nodes.length} notes · ${linkMap.size} edges`,
      kind: "notes",
      byNoteId,
    },
  };
}

function buildOntologyGraphData() {
  const nodeMap = new Map();
  const linkMap = new Map();

  state.notes.forEach((note) => {
    note.entities.forEach((entity) => {
      const key = entityNodeId(entity);
      if (!nodeMap.has(key)) {
        nodeMap.set(key, {
          id: key,
          label: entity.label,
          type: entity.type,
          kind: "entity",
          noteIds: new Set([note.id]),
          color: ENTITY_TYPES[entity.type]?.color || ENTITY_TYPES.topic.color,
          size: 11,
        });
      } else {
        nodeMap.get(key).noteIds.add(note.id);
      }
    });
  });

  state.notes.forEach((note) => {
    const entityById = new Map(note.entities.map((entity) => [entity.id, entity]));
    note.relations.forEach((relation) => {
      const source = entityById.get(relation.sourceId);
      const target = entityById.get(relation.targetId);
      if (!source || !target) return;

      const sourceKey = entityNodeId(source);
      const targetKey = entityNodeId(target);
      const linkKey = `${sourceKey}:${relation.predicateKey}:${targetKey}`;
      if (!linkMap.has(linkKey)) {
        linkMap.set(linkKey, {
          id: `edge:${linkKey}`,
          source: sourceKey,
          target: targetKey,
          label: predicateLabel(relation.predicateKey),
          predicateKey: relation.predicateKey,
          kind: "ontology-relation",
          noteIds: new Set([note.id]),
          weight: 1,
        });
      } else {
        const existing = linkMap.get(linkKey);
        existing.weight += 1;
        existing.noteIds.add(note.id);
      }
    });
  });

  const nodes = [...nodeMap.values()].map((node) => ({
    ...node,
    noteIds: [...node.noteIds],
    size: 10 + Math.min(8, node.noteIds.size * 1.4),
  }));

  return {
    nodes,
    links: [...linkMap.values()].map((link) => ({
      ...link,
      noteIds: [...link.noteIds],
    })),
    meta: {
      summary: `${nodes.length} ontology nodes · ${linkMap.size} relations`,
      kind: "ontology",
    },
  };
}

function getGraphFocusId() {
  return (
    state.graph.pendingSelectionId ||
    state.graph.focusNodeId ||
    state.graph.selectedNodeId ||
    null
  );
}

function filterGraphDataByScope(data) {
  if (state.graph.scope !== "selection") {
    return data;
  }

  const focusId = getGraphFocusId();
  if (!focusId || !data.nodes.some((node) => node.id === focusId)) {
    return data;
  }

  const includedIds = new Set([focusId]);
  data.links.forEach((link) => {
    if (link.source === focusId || link.target === focusId) {
      includedIds.add(link.source);
      includedIds.add(link.target);
    }
  });

  const nodes = data.nodes.filter((node) => includedIds.has(node.id));
  const links = data.links.filter(
    (link) => includedIds.has(link.source) && includedIds.has(link.target),
  );

  return {
    ...data,
    nodes,
    links,
    meta: {
      ...data.meta,
      summary:
        data.meta.kind === "ontology"
          ? `${nodes.length} focused ontology nodes · ${links.length} relations`
          : `${nodes.length} focused notes · ${links.length} edges`,
    },
  };
}

function buildGraphData() {
  const data =
    state.graph.mode === "ontology" ? buildOntologyGraphData() : buildNoteGraphData();
  return filterGraphDataByScope(data);
}

function nodeColor(type) {
  return ENTITY_TYPES[type]?.color || ENTITY_TYPES.topic.color;
}

function stopGraphScene() {
  if (state.graph.scene?.frameId) {
    cancelAnimationFrame(state.graph.scene.frameId);
  }
  state.graph.scene = null;
}

function updateGraphToolbarState() {
  const selectionButton = document.getElementById("graphScopeSelectionButton");
  if (!selectionButton) return;
  selectionButton.disabled = !getGraphFocusId();
}

function setGraphSelection(nodeId) {
  state.graph.selectedNodeId = nodeId;
  state.graph.focusNodeId = nodeId;
  updateGraphFocusState();
  updateGraphToolbarState();
  renderInspector();
  renderStatusBar();
}

function clearGraphSelection() {
  if (!state.graph.selectedNodeId) return;
  state.graph.selectedNodeId = null;
  updateGraphFocusState();
  updateGraphToolbarState();
  renderInspector();
  renderStatusBar();
}

function buildAdjacency(links) {
  const adjacency = new Map();

  links.forEach((link) => {
    if (!adjacency.has(link.source)) adjacency.set(link.source, new Set());
    if (!adjacency.has(link.target)) adjacency.set(link.target, new Set());
    adjacency.get(link.source).add(link.target);
    adjacency.get(link.target).add(link.source);
  });

  return adjacency;
}

function fitGraphToViewport(scene) {
  if (!scene || scene.nodes.length === 0) return;
  const padding = 90;
  const xs = scene.nodes.map((node) => node.x);
  const ys = scene.nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const graphWidth = Math.max(1, maxX - minX);
  const graphHeight = Math.max(1, maxY - minY);
  const scale = Math.min(
    (scene.width - padding) / graphWidth,
    (scene.height - padding) / graphHeight,
    1.85,
  );

  scene.transform.scale = Number.isFinite(scale) ? scale : 1;
  scene.transform.x = scene.width / 2 - ((minX + maxX) / 2) * scene.transform.scale;
  scene.transform.y = scene.height / 2 - ((minY + maxY) / 2) * scene.transform.scale;
}

function applyGraphTransform(scene) {
  scene.viewport.setAttribute(
    "transform",
    `translate(${scene.transform.x} ${scene.transform.y}) scale(${scene.transform.scale})`,
  );
}

function screenToWorld(scene, clientX, clientY) {
  const rect = scene.svg.getBoundingClientRect();
  return {
    x: (clientX - rect.left - scene.transform.x) / scene.transform.scale,
    y: (clientY - rect.top - scene.transform.y) / scene.transform.scale,
  };
}

function createGraphScene(data) {
  const svg = document.getElementById("graphSvg");
  const viewport = document.getElementById("graphViewport");
  const hitArea = document.getElementById("graphHitArea");
  const linkLayer = document.getElementById("graphLinkLayer");
  const labelLayer = document.getElementById("graphLabelLayer");
  const nodeLayer = document.getElementById("graphNodeLayer");
  const empty = document.getElementById("graphEmpty");
  const summary = document.getElementById("graphSummaryText");
  const hint = document.getElementById("graphHintText");

  const bounds = svg.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${bounds.width || 1000} ${bounds.height || 700}`);

  const scene = {
    svg,
    viewport,
    hitArea,
    linkLayer,
    labelLayer,
    nodeLayer,
    empty,
    summary,
    hint,
    width: bounds.width || 1000,
    height: bounds.height || 700,
    nodes: [],
    links: [],
    nodeMap: new Map(),
    adjacency: buildAdjacency(data.links),
    transform: {
      x: (bounds.width || 1000) / 2,
      y: (bounds.height || 700) / 2,
      scale: 1,
    },
    frameId: null,
    dragNodeId: null,
    dragPointerId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    panPointerId: null,
    panMoved: false,
    panLastX: 0,
    panLastY: 0,
  };

  empty.classList.toggle("is-visible", data.nodes.length === 0);
  summary.textContent = data.meta.summary;
  hint.textContent = "드래그로 노드를 옮기고, 빈 공간 드래그로 이동, 휠로 확대/축소";

  if (data.nodes.length === 0) {
    state.graph.scene = scene;
    return;
  }

  const radiusBase = data.meta.kind === "ontology" ? 160 : 220;

  scene.nodes = data.nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(data.nodes.length, 1);
    const radius = radiusBase + (index % 5) * 22;
    return {
      ...node,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      element: null,
      circle: null,
      labelElement: null,
    };
  });

  scene.links = data.links.map((link) => ({
    ...link,
    sourceNode: null,
    targetNode: null,
    element: null,
    labelElement: null,
  }));

  scene.nodes.forEach((node) => {
    scene.nodeMap.set(node.id, node);
  });

  scene.links.forEach((link) => {
    link.sourceNode = scene.nodeMap.get(link.source);
    link.targetNode = scene.nodeMap.get(link.target);
  });

  scene.links.forEach((link) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("graph-link");
    scene.linkLayer.append(line);
    link.element = line;

    if (link.label) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.classList.add("graph-link-label");
      label.textContent = link.label;
      scene.labelLayer.append(label);
      link.labelElement = label;
    }
  });

  scene.nodes.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("graph-node");
    group.dataset.nodeId = node.id;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.classList.add("graph-node-circle");
    circle.setAttribute("r", String(node.size));
    circle.style.setProperty("--node-fill", `${node.color}22`);
    circle.style.setProperty("--node-stroke", node.color);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.classList.add("graph-node-label");
    label.setAttribute("y", String(node.size + 18));
    label.textContent = node.label;

    group.append(circle, label);
    scene.nodeLayer.append(group);

    node.element = group;
    node.circle = circle;
    node.labelElement = label;

    group.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const world = screenToWorld(scene, event.clientX, event.clientY);
      scene.dragNodeId = node.id;
      scene.dragPointerId = event.pointerId;
      scene.dragOffsetX = node.x - world.x;
      scene.dragOffsetY = node.y - world.y;
      setGraphSelection(node.id);
      group.setPointerCapture(event.pointerId);
    });

    group.addEventListener("dblclick", () => {
      if (node.kind === "note" && node.noteId) {
        openNoteTab(node.noteId);
        return;
      }
      if (node.kind === "entity" && Array.isArray(node.noteIds) && node.noteIds.length === 1) {
        openNoteTab(node.noteIds[0]);
      }
    });
  });

  hitArea.addEventListener("pointerdown", (event) => {
    scene.panPointerId = event.pointerId;
    scene.panMoved = false;
    scene.panLastX = event.clientX;
    scene.panLastY = event.clientY;
    hitArea.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (scene.dragPointerId === event.pointerId && scene.dragNodeId) {
      const node = scene.nodeMap.get(scene.dragNodeId);
      if (!node) return;
      const world = screenToWorld(scene, event.clientX, event.clientY);
      node.x = world.x + scene.dragOffsetX;
      node.y = world.y + scene.dragOffsetY;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    if (scene.panPointerId === event.pointerId) {
      scene.panMoved = true;
      scene.transform.x += event.clientX - scene.panLastX;
      scene.transform.y += event.clientY - scene.panLastY;
      scene.panLastX = event.clientX;
      scene.panLastY = event.clientY;
      applyGraphTransform(scene);
    }
  });

  svg.addEventListener("pointerup", (event) => {
    if (scene.dragPointerId === event.pointerId) {
      scene.dragNodeId = null;
      scene.dragPointerId = null;
    }

    if (scene.panPointerId === event.pointerId) {
      const shouldClear = !scene.panMoved;
      scene.panPointerId = null;
      if (shouldClear) {
        clearGraphSelection();
      }
    }
  });

  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    const worldBefore = screenToWorld(scene, event.clientX, event.clientY);
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    scene.transform.scale = Math.min(2.8, Math.max(0.4, scene.transform.scale * factor));
    const rect = scene.svg.getBoundingClientRect();
    scene.transform.x =
      event.clientX - rect.left - worldBefore.x * scene.transform.scale;
    scene.transform.y =
      event.clientY - rect.top - worldBefore.y * scene.transform.scale;
    applyGraphTransform(scene);
  });

  fitGraphToViewport(scene);
  applyGraphTransform(scene);
  state.graph.scene = scene;
  updateGraphFocusState();
  tickGraphScene();
}

function updateGraphFocusState() {
  const scene = state.graph.scene;
  if (!scene || scene.nodes.length === 0) return;

  const selectedNodeId = state.graph.selectedNodeId;
  const connected = selectedNodeId ? scene.adjacency.get(selectedNodeId) || new Set() : null;

  scene.nodes.forEach((node) => {
    const isActive = selectedNodeId === node.id;
    const isNeighbor = connected?.has(node.id);
    node.element.classList.toggle("is-active", isActive);
    node.element.classList.toggle(
      "is-dimmed",
      Boolean(selectedNodeId && !isActive && !isNeighbor),
    );
  });

  scene.links.forEach((link) => {
    const related =
      !selectedNodeId ||
      link.source === selectedNodeId ||
      link.target === selectedNodeId ||
      (connected?.has(link.source) && link.target === selectedNodeId) ||
      (connected?.has(link.target) && link.source === selectedNodeId);

    link.element.classList.toggle("is-dimmed", !related);
    if (link.labelElement) {
      link.labelElement.classList.toggle("is-dimmed", !related);
    }
  });
}

function tickGraphScene() {
  const scene = state.graph.scene;
  if (!scene || scene.nodes.length === 0) return;

  const repulsion = state.graph.mode === "ontology" ? 8400 : 11000;
  const springStrength = state.graph.mode === "ontology" ? 0.0034 : 0.0023;
  const centerStrength = state.graph.mode === "ontology" ? 0.0026 : 0.0016;
  const collisionGap = state.graph.mode === "ontology" ? 18 : 24;

  for (let index = 0; index < scene.nodes.length; index += 1) {
    const node = scene.nodes[index];
    for (let next = index + 1; next < scene.nodes.length; next += 1) {
      const other = scene.nodes[next];
      let dx = other.x - node.x;
      let dy = other.y - node.y;
      let distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < 0.01) {
        dx = 0.1;
        dy = 0.1;
        distanceSquared = dx * dx + dy * dy;
      }

      const distance = Math.sqrt(distanceSquared);
      const repel = repulsion / distanceSquared;
      const fx = (repel * dx) / distance;
      const fy = (repel * dy) / distance;

      node.vx -= fx;
      node.vy -= fy;
      other.vx += fx;
      other.vy += fy;

      const minDistance = node.size + other.size + collisionGap;
      if (distance < minDistance) {
        const overlap = (minDistance - distance) * 0.025;
        const pushX = (overlap * dx) / distance;
        const pushY = (overlap * dy) / distance;
        node.vx -= pushX;
        node.vy -= pushY;
        other.vx += pushX;
        other.vy += pushY;
      }
    }
  }

  scene.links.forEach((link) => {
    if (!link.sourceNode || !link.targetNode) return;
    const dx = link.targetNode.x - link.sourceNode.x;
    const dy = link.targetNode.y - link.sourceNode.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const desired = state.graph.mode === "ontology" ? 136 : 180;
    const delta = distance - desired;
    const strength = springStrength * (link.weight || 1);
    const fx = (delta * strength * dx) / distance;
    const fy = (delta * strength * dy) / distance;

    link.sourceNode.vx += fx;
    link.sourceNode.vy += fy;
    link.targetNode.vx -= fx;
    link.targetNode.vy -= fy;
  });

  scene.nodes.forEach((node) => {
    if (scene.dragNodeId === node.id) return;
    node.vx += -node.x * centerStrength;
    node.vy += -node.y * centerStrength;
    node.vx *= 0.88;
    node.vy *= 0.88;
    node.x += node.vx;
    node.y += node.vy;
  });

  renderGraphFrame(scene);
  scene.frameId = requestAnimationFrame(tickGraphScene);
}

function renderGraphFrame(scene) {
  scene.links.forEach((link) => {
    const source = link.sourceNode;
    const target = link.targetNode;
    if (!source || !target) return;

    link.element.setAttribute("x1", String(source.x));
    link.element.setAttribute("y1", String(source.y));
    link.element.setAttribute("x2", String(target.x));
    link.element.setAttribute("y2", String(target.y));

    if (link.labelElement) {
      link.labelElement.setAttribute("x", String((source.x + target.x) / 2));
      link.labelElement.setAttribute("y", String((source.y + target.y) / 2 - 6));
    }
  });

  scene.nodes.forEach((node) => {
    node.element.setAttribute("transform", `translate(${node.x} ${node.y})`);
  });
}

function renderGraphView() {
  const hasFocus = Boolean(getGraphFocusId());
  elements.tabPanels.innerHTML = `
    <div class="graph-shell">
      <div class="document-toolbar">
        <div class="toolbar-meta">
          <p class="toolbar-kicker">graph view</p>
          <h2 class="toolbar-title">Graph view</h2>
        </div>
        <div class="graph-controls">
          <button class="mode-button ${state.graph.mode === "notes" ? "is-active" : ""}" data-action="set-graph-mode" data-mode="notes" type="button">
            Notes
          </button>
          <button class="mode-button ${state.graph.mode === "ontology" ? "is-active" : ""}" data-action="set-graph-mode" data-mode="ontology" type="button">
            Ontology
          </button>
          <button class="mode-button ${state.graph.scope === "all" ? "is-active" : ""}" id="graphScopeAllButton" data-action="set-graph-scope" data-scope="all" type="button">
            전체
          </button>
          <button class="mode-button ${state.graph.scope === "selection" ? "is-active" : ""}" id="graphScopeSelectionButton" data-action="set-graph-scope" data-scope="selection" type="button" ${hasFocus ? "" : "disabled"}>
            선택 주변
          </button>
          <button class="graph-action-button" data-action="fit-graph" type="button">
            Fit
          </button>
        </div>
      </div>
      <div class="graph-stage">
        <svg class="graph-svg" id="graphSvg">
          <rect id="graphHitArea" x="0" y="0" width="100%" height="100%" fill="transparent"></rect>
          <g id="graphViewport">
            <g id="graphLinkLayer"></g>
            <g id="graphLabelLayer"></g>
            <g id="graphNodeLayer"></g>
          </g>
        </svg>
        <div class="graph-empty" id="graphEmpty">
          아직 그릴 노드가 없습니다.
        </div>
      </div>
      <div class="graph-footer">
        <span id="graphSummaryText"></span>
        <span id="graphHintText"></span>
      </div>
    </div>
  `;

  state.graph.data = buildGraphData();
  stopGraphScene();
  createGraphScene(state.graph.data);
  updateGraphToolbarState();

  if (
    state.graph.pendingSelectionId &&
    state.graph.scene?.nodeMap.has(state.graph.pendingSelectionId)
  ) {
    setGraphSelection(state.graph.pendingSelectionId);
  } else if (
    state.graph.selectedNodeId &&
    state.graph.scene?.nodeMap.has(state.graph.selectedNodeId)
  ) {
    updateGraphFocusState();
  } else {
    state.graph.selectedNodeId = null;
  }

  state.graph.pendingSelectionId = null;
}

function getInspectorContext() {
  const activeTab = getActiveTab();
  if (!activeTab) return null;

  if (activeTab.type === "note") {
    const note = getNoteById(activeTab.noteId);
    return note ? { kind: "note", note } : null;
  }

  if (activeTab.type === "graph" && state.graph.selectedNodeId && state.graph.scene) {
    const node = state.graph.scene.nodeMap.get(state.graph.selectedNodeId);
    if (!node) return null;
    if (node.kind === "note" && node.noteId) {
      const note = getNoteById(node.noteId);
      return note ? { kind: "note", note } : null;
    }
    if (node.kind === "entity") {
      return { kind: "entity", node };
    }
  }

  return { kind: "overview" };
}

function renderMentionList(container, items) {
  if (items.length === 0) {
    container.innerHTML = `<div class="empty-card">표시할 항목이 없습니다.</div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <button class="mention-card" data-note-id="${item.note.id}" type="button">
          <strong>${escapeHtml(displayNoteTitle(item.note))}</strong>
          <span>${escapeHtml(item.preview)}</span>
          <div class="mention-badges">
            <span class="ghost-tag">${escapeHtml(item.reason)}</span>
            ${item.tags.map((tag) => `<span class="ghost-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </button>
      `,
    )
    .join("");
}

function renderNoteInspector(note) {
  elements.inspectorTitle.textContent = displayNoteTitle(note);

  const linked = [...getLinkedNotes(note), ...getBacklinks(note)];
  const unlinked = getUnlinkedMentions(note);

  elements.linkedMentionCount.textContent = String(linked.length);
  elements.unlinkedMentionCount.textContent = String(unlinked.length);

  renderMentionList(elements.linkedMentionsList, linked);
  renderMentionList(elements.unlinkedMentionsList, unlinked);

  const relationCards = note.relations
    .map((relation) => {
      const source = note.entities.find((entity) => entity.id === relation.sourceId);
      const target = note.entities.find((entity) => entity.id === relation.targetId);
      if (!source || !target) return "";
      return `
        <div class="ontology-card">
          <strong>${escapeHtml(source.label)} --${escapeHtml(relation.label)}--> ${escapeHtml(target.label)}</strong>
          <span>${escapeHtml(entityTypeLabel(source.type))} · ${escapeHtml(entityTypeLabel(target.type))}</span>
        </div>
      `;
    })
    .join("");

  elements.ontologySummary.innerHTML = `
    <div class="ontology-card">
      <div class="ontology-card-title">
        <span class="graph-legend-dot" style="--swatch: ${ENTITY_TYPES.note.color}"></span>
        <strong>${escapeHtml(displayNoteTitle(note))}</strong>
      </div>
      <span>${escapeHtml(notePreview(note.body))}</span>
    </div>
    <div class="ontology-card">
      <strong>개체</strong>
      <div class="ontology-chip-row">
        ${
          note.entities.length > 0
            ? note.entities
                .map(
                  (entity) => `
                    <span class="type-chip" data-type="${entity.type}">
                      ${escapeHtml(entity.label)}
                    </span>
                  `,
                )
                .join("")
            : '<span class="empty-card">개체가 없습니다.</span>'
        }
      </div>
    </div>
    ${
      relationCards
        ? `<div class="ontology-list">${relationCards}</div>`
        : '<div class="empty-card">관계가 없습니다.</div>'
    }
  `;
}

function renderEntityInspector(node) {
  elements.inspectorTitle.textContent = node.label;

  const notes = state.notes.filter((note) =>
    note.entities.some((entity) => entityNodeId(entity) === node.id),
  );

  const linkedItems = notes.map((note) => ({
    note,
    reason: "포함된 노트",
    preview: notePreview(note.body),
    tags: [entityTypeLabel(node.type)],
  }));

  const relatedLinks = state.graph.data?.links.filter(
    (link) => link.source === node.id || link.target === node.id,
  ) || [];

  const connectedEntityIds = new Set();
  relatedLinks.forEach((link) => {
    connectedEntityIds.add(link.source === node.id ? link.target : link.source);
  });

  const unlinkedItems = [...connectedEntityIds]
    .map((entityId) => state.graph.data.nodes.find((candidate) => candidate.id === entityId))
    .filter(Boolean)
    .map((candidate) => ({
      note: { id: candidate.id, title: candidate.label, body: candidate.type },
      reason: "연결된 개체",
      preview: `${entityTypeLabel(candidate.type)} · ${candidate.noteIds?.length || 0} notes`,
      tags: [candidate.label],
    }));

  elements.linkedMentionCount.textContent = String(linkedItems.length);
  elements.unlinkedMentionCount.textContent = String(unlinkedItems.length);

  renderMentionList(elements.linkedMentionsList, linkedItems);
  renderMentionList(elements.unlinkedMentionsList, unlinkedItems);

  elements.ontologySummary.innerHTML = `
    <div class="ontology-card">
      <div class="ontology-card-title">
        <span class="graph-legend-dot" style="--swatch: ${node.color}"></span>
        <strong>${escapeHtml(node.label)}</strong>
      </div>
      <span>${escapeHtml(entityTypeLabel(node.type))} · ${node.noteIds?.length || 0} notes</span>
    </div>
    <div class="ontology-list">
      ${
        relatedLinks.length > 0
          ? relatedLinks
              .map((link) => {
                const targetId = link.source === node.id ? link.target : link.source;
                const relatedNode = state.graph.data.nodes.find((candidate) => candidate.id === targetId);
                if (!relatedNode) return "";
                return `
                  <div class="ontology-card">
                    <strong>${escapeHtml(link.label || "연결")} · ${escapeHtml(relatedNode.label)}</strong>
                    <span>${escapeHtml(entityTypeLabel(relatedNode.type))}</span>
                  </div>
                `;
              })
              .join("")
          : '<div class="empty-card">연결된 관계가 없습니다.</div>'
      }
    </div>
  `;
}

function renderOverviewInspector() {
  elements.inspectorTitle.textContent = "Linked mentions";
  elements.linkedMentionCount.textContent = "0";
  elements.unlinkedMentionCount.textContent = "0";
  elements.linkedMentionsList.innerHTML = `
    <div class="empty-card">
      Summary나 Flow에서 메모를 열거나, 그래프에서 노드를 클릭하면 여기서 관련 메모를 볼 수 있습니다.
    </div>
  `;
  elements.unlinkedMentionsList.innerHTML = `
    <div class="empty-card">
      같은 개체를 공유하지만 직접 링크되지 않은 노트가 있으면 여기에 표시됩니다.
    </div>
  `;
  elements.ontologySummary.innerHTML = `
    <div class="ontology-card">
      <strong>Workspace summary</strong>
      <span>${state.notes.length} notes · ${countEntities()} entities · ${countRelations()} relations</span>
    </div>
    <div class="ontology-card">
      <strong>Tips</strong>
      <span><code>[[노트 제목]]</code> 은 노트 링크, <code>[시스템:PMS]</code> 는 온톨로지 개체입니다. 사람에게는 Summary/Flow가 먼저, 그래프는 탐색용이 더 잘 맞습니다.</span>
    </div>
  `;
}

function renderInspector() {
  const context = getInspectorContext();
  if (!context || context.kind === "overview") {
    renderOverviewInspector();
    return;
  }

  if (context.kind === "note") {
    renderNoteInspector(context.note);
    return;
  }

  if (context.kind === "entity") {
    renderEntityInspector(context.node);
  }
}

function renderStatusBar() {
  const context = getInspectorContext();
  const activeTab = getActiveTab();

  if (activeTab?.type === "overview") {
    elements.statusLeft.textContent = "decision summary";
    elements.statusCenter.textContent = `${state.notes.length} agenda cards`;
    elements.statusRight.textContent = `${countEntities()} entities ${countRelations()} relations`;
    return;
  }

  if (activeTab?.type === "flow") {
    elements.statusLeft.textContent = "process flow";
    elements.statusCenter.textContent = `${buildFlowStages().length} stages`;
    elements.statusRight.textContent = `${state.notes.length} notes mapped`;
    return;
  }

  if (context?.kind === "note") {
    const backlinks = getBacklinks(context.note).length;
    elements.statusLeft.textContent = `${backlinks} backlinks`;
    elements.statusCenter.textContent = displayNoteTitle(context.note);
    elements.statusRight.textContent = `${noteWordCount(context.note.body)} words ${context.note.body.length} characters`;
    return;
  }

  if (activeTab?.type === "graph" && state.graph.data) {
    elements.statusLeft.textContent = state.graph.mode === "ontology" ? "ontology graph" : "note graph";
    elements.statusCenter.textContent = state.graph.data.meta.summary;
    elements.statusRight.textContent = state.graph.selectedNodeId
      ? "1 node selected"
      : "no node selected";
    return;
  }

  elements.statusLeft.textContent = "0 backlinks";
  elements.statusCenter.textContent = `${state.notes.length} notes`;
  elements.statusRight.textContent = `${countEntities()} entities ${countRelations()} relations`;
}

function renderActivePanel() {
  const activeTab = getActiveTab();
  if (!activeTab) {
    elements.tabPanels.innerHTML = `
      <div class="view-placeholder">
        <div>
          <h3>탭이 없습니다.</h3>
          <p>새 메모를 만들거나 그래프 뷰를 열어보세요.</p>
        </div>
      </div>
    `;
    stopGraphScene();
    return;
  }

  if (activeTab.type === "overview") {
    stopGraphScene();
    renderOverviewView();
    return;
  }

  if (activeTab.type === "flow") {
    stopGraphScene();
    renderFlowView();
    return;
  }

  if (activeTab.type === "graph") {
    renderGraphView();
    return;
  }

  stopGraphScene();
  const note = getNoteById(activeTab.noteId);
  if (!note) {
    elements.tabPanels.innerHTML = `
      <div class="view-placeholder">
        <div>
          <h3>메모를 찾을 수 없습니다.</h3>
        </div>
      </div>
    `;
    return;
  }

  renderNoteView(note);
}

function renderApp() {
  applyUiClasses();
  renderCounters();
  renderNoteTree();
  renderTabs();
  renderActivePanel();
  renderInspector();
  renderStatusBar();
}

function handleTabStripClick(event) {
  const closeTarget = event.target.closest("[data-close-tab]");
  if (closeTarget) {
    closeTab(closeTarget.dataset.closeTab);
    return;
  }

  const tabTarget = event.target.closest("[data-tab-id]");
  if (tabTarget) {
    setActiveTab(tabTarget.dataset.tabId);
  }
}

function handleNoteTreeClick(event) {
  const button = event.target.closest("[data-note-id]");
  if (!button) return;
  openNoteTab(button.dataset.noteId);
}

function handleInspectorClick(event) {
  const card = event.target.closest("[data-note-id]");
  if (!card) return;

  const activeGraph = getActiveTab()?.type === "graph";
  if (activeGraph && card.dataset.noteId.startsWith("entity:")) {
    state.graph.pendingSelectionId = card.dataset.noteId;
    renderApp();
    return;
  }

  const note = getNoteById(card.dataset.noteId);
  if (note) {
    openNoteTab(note.id);
  }
}

function handleWorkspaceClick(event) {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const activeTab = getActiveTab();
  if (!activeTab) return;

  switch (actionTarget.dataset.action) {
    case "open-overview-tab": {
      openOverviewTab();
      return;
    }
    case "open-flow-tab": {
      openFlowTab();
      return;
    }
    case "open-note-tab": {
      const noteId = actionTarget.dataset.noteId;
      if (noteId) {
        openNoteTab(noteId);
      }
      return;
    }
    case "open-full-ontology-graph": {
      state.graph.focusNodeId = null;
      state.graph.selectedNodeId = null;
      openGraphTab("ontology", null, "all");
      return;
    }
    case "open-full-note-graph": {
      state.graph.focusNodeId = null;
      state.graph.selectedNodeId = null;
      openGraphTab("notes", null, "all");
      return;
    }
    case "open-focused-graph": {
      const nodeId = actionTarget.dataset.nodeId;
      if (nodeId) {
        openGraphTab("ontology", nodeId, "selection");
      }
      return;
    }
    case "refresh-ontology": {
      if (activeTab.type !== "note") return;
      const note = getNoteById(activeTab.noteId);
      if (!note) return;
      syncNoteOntology(note);
      note.updatedAt = nowIso();
      sortNotesByUpdatedAt();
      saveNotes();
      refreshNoteHeader(note);
      renderNoteEntityChips(note);
      renderNoteRelations(note);
      renderNoteTree();
      renderInspector();
      renderStatusBar();
      return;
    }
    case "open-ontology-graph": {
      if (activeTab.type !== "note") return;
      openGraphTab("ontology", null, "all");
      return;
    }
    case "focus-entity": {
      const nodeId = actionTarget.dataset.nodeId;
      openGraphTab("ontology", nodeId, "selection");
      return;
    }
    case "set-graph-mode": {
      state.graph.mode = actionTarget.dataset.mode === "ontology" ? "ontology" : "notes";
      state.graph.selectedNodeId = null;
      state.graph.pendingSelectionId = null;
      saveUiState();
      renderApp();
      return;
    }
    case "set-graph-scope": {
      const scope = actionTarget.dataset.scope === "selection" ? "selection" : "all";
      if (scope === "selection" && !getGraphFocusId()) return;
      state.graph.scope = scope;
      if (scope === "all") {
        state.graph.selectedNodeId = null;
      }
      saveUiState();
      renderApp();
      return;
    }
    case "fit-graph": {
      if (state.graph.scene) {
        fitGraphToViewport(state.graph.scene);
        applyGraphTransform(state.graph.scene);
      }
      return;
    }
    default:
      return;
  }
}

function handleWorkspaceInput(event) {
  const activeTab = getActiveTab();
  if (!activeTab || activeTab.type !== "note") return;

  const note = getNoteById(activeTab.noteId);
  if (!note) return;

  if (event.target.id === "activeNoteTitle") {
    note.title = event.target.value;
    note.updatedAt = nowIso();
    sortNotesByUpdatedAt();
    saveNotes();
    refreshNoteHeader(note);
    renderTabs();
    renderNoteTree();
    renderInspector();
    renderStatusBar();
    return;
  }

  if (event.target.id === "activeNoteBody") {
    note.body = event.target.value;
    note.updatedAt = nowIso();
    syncNoteOntology(note);
    sortNotesByUpdatedAt();
    saveNotes();
    refreshNoteHeader(note);
    renderNoteEntityChips(note);
    renderNoteRelations(note);
    renderNoteTree();
    renderInspector();
    renderStatusBar();
  }
}

function toggleLeftSidebar() {
  state.ui.leftSidebarOpen = !state.ui.leftSidebarOpen;
  saveUiState();
  applyUiClasses();
  requestAnimationFrame(handleResize);
}

function toggleRightSidebar() {
  state.ui.rightSidebarOpen = !state.ui.rightSidebarOpen;
  saveUiState();
  applyUiClasses();
  requestAnimationFrame(handleResize);
}

function handleResize() {
  const scene = state.graph.scene;
  if (!scene) return;
  const bounds = scene.svg.getBoundingClientRect();
  scene.width = bounds.width || 1000;
  scene.height = bounds.height || 700;
  scene.svg.setAttribute("viewBox", `0 0 ${scene.width} ${scene.height}`);
  if (!state.graph.selectedNodeId) {
    fitGraphToViewport(scene);
  }
  applyGraphTransform(scene);
}

function bindEvents() {
  elements.toggleLeftSidebarButton.addEventListener("click", toggleLeftSidebar);
  elements.headerLeftToggle.addEventListener("click", toggleLeftSidebar);
  elements.toggleRightSidebarButton.addEventListener("click", toggleRightSidebar);
  elements.headerRightToggle.addEventListener("click", toggleRightSidebar);

  [
    elements.openOverviewButton,
    elements.openOverviewSidebarButton,
    elements.openOverviewHeaderButton,
  ].forEach((button) => {
    button.addEventListener("click", openOverviewTab);
  });

  [
    elements.openFlowButton,
    elements.openFlowSidebarButton,
    elements.openFlowHeaderButton,
  ].forEach((button) => {
    button.addEventListener("click", openFlowTab);
  });

  [
    elements.openGraphButton,
    elements.openGraphSidebarButton,
    elements.newGraphHeaderButton,
    elements.addGraphTabButton,
  ].forEach((button) => {
    button.addEventListener("click", () => openGraphTab(state.graph.mode, null, "all"));
  });

  [
    elements.newNoteRailButton,
    elements.newNoteButton,
    elements.newNoteHeaderButton,
  ].forEach((button) => {
    button.addEventListener("click", createNewNote);
  });

  elements.resetWorkspaceButton.addEventListener("click", resetWorkspace);
  elements.noteSearchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderNoteTree();
  });
  elements.noteTree.addEventListener("click", handleNoteTreeClick);
  elements.tabStrip.addEventListener("click", handleTabStripClick);
  elements.tabPanels.addEventListener("click", handleWorkspaceClick);
  elements.tabPanels.addEventListener("input", handleWorkspaceInput);
  elements.linkedMentionsList.addEventListener("click", handleInspectorClick);
  elements.unlinkedMentionsList.addEventListener("click", handleInspectorClick);
  elements.ontologySummary.addEventListener("click", handleInspectorClick);
  window.addEventListener("resize", handleResize);
}

function initialize() {
  const uiState = loadUiState();
  state.ui.leftSidebarOpen = uiState.leftSidebarOpen;
  state.ui.rightSidebarOpen = uiState.rightSidebarOpen;
  state.graph.mode = uiState.graphMode;
  state.graph.scope = uiState.graphScope;
  state.notes = loadNotes();
  ensureAtLeastOneTab();
  bindEvents();
  renderApp();
}

initialize();

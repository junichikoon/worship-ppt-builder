(function () {
  "use strict";

  const STORAGE_KEY = "church-ppt-builder-state-v1";
  const TEMPLATE_KEY = "church-ppt-builder-templates-v1";
  const AUTH_KEY = "church-ppt-builder-auth-v1";
  const TEMPLATE_SCHEMA_VERSION = 1;
  const ANNOUNCEMENTS_PER_SLIDE = 3;
  const DEFAULT_COLLAPSED_SECTION_KEYS = new Set(["background", "titleStyle", "detailStyle", "boxColor"]);
  const DEFAULT_LOGO_POSITION = "top-right";

  const COLORS = {
    black: "#121212",
    white: "#FFFFFF",
    ivory: "#F8F5EE",
    orange: "#F97316",
    amber: "#F59E0B",
    red: "#FF0000",
    deepTeal: "#173B3F",
    zinc: "#18181B",
  };

  const BACKGROUND_OPTIONS = [
    { name: "검정", value: COLORS.black },
    { name: "흰색", value: COLORS.white },
    { name: "아이보리", value: COLORS.ivory },
    { name: "주황", value: COLORS.orange },
    { name: "호박", value: COLORS.amber },
    { name: "빨강", value: COLORS.red },
    { name: "딥그린", value: COLORS.deepTeal },
    { name: "딥그레이", value: COLORS.zinc },
  ];

  const TEXT_COLOR_OPTIONS = [
    { name: "검정", value: "#000000" },
    { name: "흰색", value: "#FFFFFF" },
  ];

  const TEXT_ALIGN_OPTIONS = [
    { name: "왼쪽 정렬", value: "left" },
    { name: "가운데 정렬", value: "center" },
    { name: "오른쪽 정렬", value: "right" },
  ];

  const CUSTOM_CONTENT_PRESETS = [
    {
      id: "apostles-creed",
      title: "사도신경",
      content:
        "나는 전능하신 아버지 하나님, 천지의 창조주를 믿습니다.\n나는 그의 유일하신 아들, 우리 주 예수 그리스도를 믿습니다.\n그는 성령으로 잉태되어 동정녀 마리아에게서 나시고,\n본디오 빌라도에게 고난을 받아 십자가에 못 박혀 죽으시고,\n장사된 지 사흘만에 죽은 자 가운데서 다시 살아나셨으며,\n하늘에 오르시어 전능하신 아버지 하나님 우편에 앉아 계시다가,\n거기로부터 살아있는 자와 죽은 자를 심판하러 오십니다.\n나는 성령을 믿으며, 거룩한 공교회와 성도의 교제와\n죄를 용서 받는 것과 몸의 부활과 영생을 믿습니다. 아멘.",
    },
    {
      id: "lords-prayer",
      title: "주기도문",
      content:
        "하늘에 계신 우리 아버지,\n아버지의 이름을 거룩하게 하시며\n아버지의 나라가 오게 하시며\n아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서.\n오늘 우리에게 일용할 양식을 주시고\n우리가 우리에게 잘못한 사람을 용서하여 준 것 같이\n우리 죄를 용서하여 주시고\n우리를 시험에 빠지지 않게 하시고 악에서 구하소서.\n나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.",
    },
    {
      id: "welcome",
      title: "환영합니다",
      content:
        "오늘 예배에 오신 모든 분들을 주님의 이름으로 환영합니다.\n함께 예배하며 하나님의 은혜를 누리는 시간이 되기를 소망합니다.",
    },
  ];

  const TEMPLATE_BACKGROUND_OPTIONS = [
    {
      name: "새벽 예배",
      value: "linear-gradient(135deg, #071015 0%, #173B3F 54%, #F97316 100%)",
      fallback: "#173B3F",
    },
    {
      name: "깊은 밤",
      value: "linear-gradient(135deg, #111827 0%, #1E3A8A 52%, #2F68BA 100%)",
      fallback: "#111827",
    },
    {
      name: "따뜻한 빛",
      value: "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 58%, #D8911F 100%)",
      fallback: "#FDE68A",
    },
    {
      name: "고요한 숲",
      value: "linear-gradient(135deg, #052E2B 0%, #14532D 64%, #84CC16 100%)",
      fallback: "#14532D",
    },
  ];

  const DUMMY = {
    praise: [
      {
        id: "praise-1",
        title: "은혜의 길",
        meta: "샘플 워십",
        lines: [
          "오늘도 주의 빛 안에 서네",
          "흔들린 마음 다시 붙드시네",
          "작은 고백을 기쁘게 받으시고",
          "은혜의 길로 나를 이끄시네",
          "주의 사랑은 끝이 없고",
          "주의 평안은 깊고 넓네",
          "내 삶의 모든 순간마다",
          "주 이름 높여 찬양하리",
        ],
      },
      {
        id: "praise-2",
        title: "새벽의 노래",
        meta: "더미 찬양팀",
        lines: [
          "어둠이 지나고 아침이 오면",
          "주의 손길이 나를 깨우네",
          "잠잠한 마음에 소망을 주고",
          "새 노래로 하루를 여시네",
          "할렐루야 주를 바라봅니다",
          "할렐루야 주를 따르겠습니다",
        ],
      },
      {
        id: "praise-3",
        title: "예배의 자리",
        meta: "MVP 샘플",
        lines: [
          "이곳에 모여 주 앞에 서니",
          "우리의 마음 하나 되네",
          "말씀과 찬양 기도로 드려",
          "삶의 예배를 시작하네",
          "주께서 부르신 그 자리에서",
          "기쁨으로 응답하리",
        ],
      },
      {
        id: "praise-4",
        title: "평안의 주",
        meta: "샘플 작곡",
        lines: [
          "거친 바람 속에도 주는 평안",
          "깊은 밤길에도 주는 빛이라",
          "내 손을 잡고 나를 세우시니",
          "나는 두려움 없이 걸어가리",
        ],
      },
      {
        id: "praise-5",
        title: "감사의 고백",
        meta: "테스트 데이터",
        lines: [
          "작은 숨결마다 감사가 되고",
          "걸음마다 은혜를 보네",
          "나의 오늘과 내일을 드려",
          "주께 감사의 고백 올리네",
        ],
      },
    ],
    hymn: [
      {
        id: "hymn-001",
        title: "001 감사의 찬송",
        meta: "더미 찬송가",
        scoreImage: "db://hymn-scores/001.png",
        lines: [
          "감사의 찬송을 주께 드리세",
          "마음과 정성을 모두 모아서",
          "한없는 사랑을 기억하면서",
          "기쁨의 목소리 높여 부르세",
          "아멘 아멘 주께 영광",
          "아멘 아멘 길이 찬양",
        ],
      },
      {
        id: "hymn-002",
        title: "012 주 앞에 모여",
        meta: "더미 찬송가",
        scoreImage: "db://hymn-scores/012.png",
        lines: [
          "주 앞에 모여서 예배드리니",
          "겸손한 마음을 받아주소서",
          "말씀의 빛으로 길을 밝히사",
          "순종의 발걸음 되게 하소서",
        ],
      },
      {
        id: "hymn-003",
        title: "085 평화의 노래",
        meta: "더미 찬송가",
        scoreImage: "db://hymn-scores/085.png",
        lines: [
          "평화의 노래가 울려 퍼지네",
          "상한 마음 위로하시는 주",
          "우리의 손길이 사랑이 되어",
          "세상에 따뜻한 빛을 전하네",
        ],
      },
      {
        id: "hymn-004",
        title: "132 소망의 아침",
        meta: "더미 찬송가",
        scoreImage: "db://hymn-scores/132.png",
        lines: [
          "소망의 아침을 허락하신 주",
          "새 힘과 믿음을 부어주소서",
          "오늘의 삶 속에 동행하시며",
          "주의 뜻 이루게 인도하소서",
        ],
      },
      {
        id: "hymn-005",
        title: "214 은혜를 따라",
        meta: "더미 찬송가",
        scoreImage: "db://hymn-scores/214.png",
        lines: [
          "은혜를 따라서 걸어갑니다",
          "주의 약속 붙들고 나아갑니다",
          "넘어져도 다시 일어서리니",
          "주는 나의 힘과 노래입니다",
        ],
      },
    ],
    bible: {
      versions: ["더미개역", "더미새번역", "더미표준"],
      testaments: {
        old: {
          label: "구약",
          books: {
            창세기: {
              1: {
                1: "샘플 말씀 1장 1절입니다. 시작의 자리에서 하나님을 기억합니다.",
                2: "샘플 말씀 1장 2절입니다. 혼돈 가운데 빛을 기다립니다.",
                3: "샘플 말씀 1장 3절입니다. 말씀하심으로 밝음이 임합니다.",
                4: "샘플 말씀 1장 4절입니다. 그 빛을 보시고 선하다 하십니다.",
                5: "샘플 말씀 1장 5절입니다. 저녁이 되고 아침이 됩니다.",
              },
              2: {
                1: "샘플 말씀 2장 1절입니다. 모든 일이 질서 안에서 마칩니다.",
                2: "샘플 말씀 2장 2절입니다. 쉼의 복을 배우게 하십니다.",
                3: "샘플 말씀 2장 3절입니다. 거룩한 시간을 구별합니다.",
              },
            },
            시편: {
              23: {
                1: "샘플 시편 23편 1절입니다. 주님이 나의 목자가 되십니다.",
                2: "샘플 시편 23편 2절입니다. 푸른 자리와 잔잔한 물가로 이끄십니다.",
                3: "샘플 시편 23편 3절입니다. 지친 영혼을 다시 세우십니다.",
                4: "샘플 시편 23편 4절입니다. 두려움 속에서도 함께하십니다.",
              },
            },
          },
        },
        new: {
          label: "신약",
          books: {
            마태복음: {
              5: {
                1: "샘플 말씀 5장 1절입니다. 무리가 모이고 가르침이 시작됩니다.",
                2: "샘플 말씀 5장 2절입니다. 입을 열어 복된 길을 말씀하십니다.",
                3: "샘플 말씀 5장 3절입니다. 마음이 가난한 자에게 위로가 있습니다.",
                4: "샘플 말씀 5장 4절입니다. 애통하는 자에게 위로가 있습니다.",
              },
            },
            요한복음: {
              3: {
                16: "샘플 말씀 3장 16절입니다. 사랑으로 생명의 길을 열어주십니다.",
                17: "샘플 말씀 3장 17절입니다. 정죄보다 구원의 뜻을 보이십니다.",
                18: "샘플 말씀 3장 18절입니다. 믿음 안에서 빛을 향하게 하십니다.",
              },
            },
          },
        },
      },
    },
  };

  const els = {};
  let state = loadState();
  let auth = loadAuth();
  let templates = loadTemplates();
  let recommendedTemplates = createRecommendedTemplates();
  let currentSlides = [];
  let draggingModuleId = null;
  let toastTimer = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    render();
  }

  function cacheElements() {
    [
      "editorView",
      "loginView",
      "projectSummary",
      "authBadge",
      "authActionBtn",
      "saveTemplateBtn",
      "panelSaveTemplateBtn",
      "builderPanel",
      "templateBrowser",
      "settingsPanel",
      "templateListPanel",
      "aspectWideBtn",
      "aspectStandardBtn",
      "logoOnBtn",
      "logoOffBtn",
      "logoSettingsDetail",
      "logoUploadInput",
      "logoUploadLabel",
      "logoDeleteBtn",
      "logoCurrentBlock",
      "logoPreviewBox",
      "generatePptBtn",
      "shareBtn",
      "resetDemoBtn",
      "templateNameField",
      "moduleCount",
      "moduleList",
      "previewTitle",
      "slideCounter",
      "slideStage",
      "thumbnailStrip",
      "loginForm",
      "emailInput",
      "backToEditorBtn",
      "templateModal",
      "templateNameInput",
      "closeTemplateModalBtn",
      "confirmTemplateSaveBtn",
      "cancelTemplateSaveBtn",
      "shareModal",
      "shareTemplateName",
      "shareTemplateMeta",
      "shareLinkInput",
      "closeShareModalBtn",
      "copyShareLinkBtn",
      "cancelShareBtn",
      "toast",
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    document.querySelector(".side-nav").addEventListener("click", handleMenuClick);
    els.saveTemplateBtn.addEventListener("click", () => requireAuth("save"));
    els.authActionBtn.addEventListener("click", handleAuthAction);
    els.panelSaveTemplateBtn.addEventListener("click", () => requireAuth("save"));
    els.generatePptBtn.addEventListener("click", () => requireAuth("ppt"));
    els.shareBtn.addEventListener("click", () => requireAuth("share"));
    els.resetDemoBtn.addEventListener("click", resetDemo);
    els.templateNameField.addEventListener("input", () => {
      state.templateName = els.templateNameField.value.trim() || "새로운 템플릿";
      persistState();
    });
    els.backToEditorBtn.addEventListener("click", () => {
      state.view = "editor";
      state.pendingAction = null;
      state.pendingTemplateLoad = null;
      persistState();
      render();
    });

    els.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      auth = { loggedIn: true, email: els.emailInput.value.trim() || "demo@church.test" };
      persistAuth();
      templates = loadTemplates();
      const nextAction = state.pendingAction;
      state.view = "editor";
      state.pendingAction = null;
      persistState();
      render();
      showToast("로그인되었습니다.");
      if (nextAction === "save") beginTemplateSaveFlow();
      if (nextAction === "save-before-template-load") openTemplateModal();
      if (nextAction === "ppt") downloadPpt();
      if (nextAction === "share") openShareModal();
    });

    els.closeTemplateModalBtn.addEventListener("click", closeTemplateModal);
    els.cancelTemplateSaveBtn.addEventListener("click", closeTemplateModal);
    els.confirmTemplateSaveBtn.addEventListener("click", saveTemplateFromModal);
    els.closeShareModalBtn.addEventListener("click", closeShareModal);
    els.cancelShareBtn.addEventListener("click", closeShareModal);
    els.copyShareLinkBtn.addEventListener("click", copyShareLink);
    els.templateListPanel.addEventListener("click", handleTemplatePanelClick);
    els.templateListPanel.addEventListener("input", handleTemplatePanelInput);
    els.settingsPanel.addEventListener("click", handleSettingsPanelClick);
    els.logoUploadInput.addEventListener("change", handleLogoUpload);

    document.querySelectorAll(".nav-item.disabled").forEach((button) => {
      button.addEventListener("click", () => showToast("MVP에서는 제작 메뉴만 사용합니다."));
    });

    document.querySelector(".add-grid").addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-type]");
      if (!button) return;
      addModule(button.dataset.addType);
    });

    els.moduleList.addEventListener("click", handleModuleClick);
    els.moduleList.addEventListener("input", handleModuleInput);
    els.moduleList.addEventListener("change", handleModuleChange);
    els.moduleList.addEventListener("dragstart", handleDragStart);
    els.moduleList.addEventListener("dragend", handleDragEnd);
    els.moduleList.addEventListener("dragover", handleDragOver);
    els.moduleList.addEventListener("drop", handleDrop);

    els.thumbnailStrip.addEventListener("click", (event) => {
      const thumb = event.target.closest("[data-slide-id]");
      if (!thumb) return;
      state.selectedSlideId = thumb.dataset.slideId;
      state.selectedModuleId = thumb.dataset.moduleId;
      persistState();
      render();
    });
  }

  function defaultStyle() {
    return {
      fontFamily: "Malgun Gothic",
      fontSize: 44,
      lineHeight: 1.18,
      letterSpacing: 0,
      fontWeight: 800,
      textColor: "#FFFFFF",
      textAlign: "center",
      background: COLORS.black,
    };
  }

  function defaultSermonTextStyle(size, weight, textAlign = "left") {
    return {
      fontFamily: "Georgia",
      fontSize: size,
      fontWeight: weight,
      textColor: "#000000",
      textAlign,
    };
  }

  function defaultPresentationSettings() {
    return {
      aspectRatio: "16:9",
      logoEnabled: false,
      logoDataUrl: "",
      logoPosition: DEFAULT_LOGO_POSITION,
    };
  }

  function createAnnouncementItem(title = "초등부 여름 성경학교", detail = "날짜: 7월 15일 - 7월 17일\n등록: 사무실에서 신청서 작성 후 제출") {
    return {
      id: makeId("announcement-item"),
      title,
      detail,
      collapsed: false,
      collapsedSections: {
        titleStyle: true,
        detailStyle: true,
        boxColor: true,
      },
      boxColor: COLORS.white,
      titleStyle: defaultSermonTextStyle(32, 800),
      detailStyle: defaultSermonTextStyle(22, 400),
    };
  }

  function createModule(type) {
    const id = makeId(type);
    const base = {
      id,
      type,
      collapsed: false,
      splitMode: "4",
      searchQuery: "",
      searchResultsOpen: false,
      customText: "",
      style: defaultStyle(),
    };

    if (type === "praise") {
      return { ...base, selectedId: DUMMY.praise[0].id };
    }
    if (type === "hymn") {
      return { ...base, selectedId: DUMMY.hymn[0].id };
    }
    if (type === "sermon") {
      return {
        ...base,
        sermonTitle: "안녕",
        sermonSeries: "잘가요",
        titleStyle: defaultSermonTextStyle(64, 800),
        seriesStyle: defaultSermonTextStyle(34, 500),
        style: {
          ...defaultStyle(),
          background: COLORS.white,
          textColor: "#000000",
        },
      };
    }
    if (type === "announcement") {
      return {
        ...base,
        announcements: [
          createAnnouncementItem("초등부 여름 성경학교", "날짜: 7월 15일 - 7월 17일\n등록: 사무실에서 신청서 작성 후 제출"),
          createAnnouncementItem("청년부 여름 수련회", "날짜: 8월 10일 - 8월 12일\n장소: 강원도 횡성"),
          createAnnouncementItem("주일학교 교사 모집", "모집 부서: 유치부, 초등부\n자격: 세례 받은 교인, 교육에 관심 있는 분"),
        ],
        style: {
          ...defaultStyle(),
          background: "#F0EFEB",
          textColor: "#000000",
        },
      };
    }
    if (type === "custom") {
      return {
        ...base,
        customSlideType: "title",
        customTitle: "말씀의 빛 아래로",
        customSubtitle: "안녕하세요",
        customContentTitle: CUSTOM_CONTENT_PRESETS[0].title,
        customContentText: CUSTOM_CONTENT_PRESETS[0].content,
        customPresetId: CUSTOM_CONTENT_PRESETS[0].id,
        customTitleStyle: defaultSermonTextStyle(64, 700, "center"),
        customSubtitleStyle: defaultSermonTextStyle(32, 400, "center"),
        customContentTitleStyle: defaultSermonTextStyle(46, 700, "center"),
        customContentBodyStyle: defaultSermonTextStyle(38, 400),
        style: {
          ...defaultStyle(),
          background: "#F0EFEB",
          textColor: "#000000",
        },
      };
    }
    return {
      ...base,
      testament: "old",
      book: "창세기",
      chapter: "1",
      verseStart: 1,
      verseEnd: 4,
      verseRangeInput: "1-4",
      version: DUMMY.bible.versions[0],
    };
  }

  function createRecommendedTemplates() {
    const sundayModules = [createModule("praise"), createModule("bible"), createModule("sermon"), createModule("announcement")];
    sundayModules[2].sermonTitle = "말씀의 빛 아래로";
    sundayModules[2].sermonSeries = "주일 예배";

    const midweekModules = [createModule("praise"), createModule("bible"), createModule("custom")];
    midweekModules[1].book = "시편";
    midweekModules[1].chapter = "23";
    midweekModules[1].verseStart = 1;
    midweekModules[1].verseEnd = 6;
    midweekModules[1].verseRangeInput = "1-6";
    ensureCustomModule(midweekModules[2]);
    midweekModules[2].customSlideType = "content";
    midweekModules[2].customPresetId = "lords-prayer";
    midweekModules[2].customContentTitle = "주기도문";
    midweekModules[2].customContentText = CUSTOM_CONTENT_PRESETS.find((item) => item.id === "lords-prayer")?.content || "";

    return [
      createTemplateRecord({
        id: "recommended-sunday-basic",
        source: "recommended",
        name: "주일예배 기본",
        meta: { description: "찬양, 성경, 설교, 광고로 구성된 기본 예배 흐름입니다." },
        snapshot: createTemplateSnapshot("주일예배 기본", sundayModules, defaultPresentationSettings()),
      }),
      createTemplateRecord({
        id: "recommended-midweek-prayer",
        source: "recommended",
        name: "수요기도회",
        meta: { description: "찬양, 말씀, 기도문 중심의 간단한 예배 템플릿입니다." },
        snapshot: createTemplateSnapshot("수요기도회", midweekModules, defaultPresentationSettings()),
      }),
    ];
  }

  function makeDefaultState() {
    const modules = [createModule("praise"), createModule("bible")];
    return {
      view: "editor",
      activeMenu: "builder",
      templateSections: {},
      settingsSections: {},
      pendingAction: null,
      pendingTemplateLoad: null,
      templatePreviewRef: null,
      templateName: "새로운 템플릿",
      currentTemplateId: "",
      presentationSettings: defaultPresentationSettings(),
      selectedModuleId: modules[0].id,
      selectedSlideId: "",
      modules,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return makeDefaultState();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.modules)) return makeDefaultState();
      const defaultState = makeDefaultState();
      return {
        ...defaultState,
        ...parsed,
        view: parsed.view === "login" ? "login" : "editor",
        activeMenu: ["builder", "templates", "settings"].includes(parsed.activeMenu) ? parsed.activeMenu : "builder",
        settingsSections: parsed.settingsSections && typeof parsed.settingsSections === "object" ? parsed.settingsSections : {},
        templatePreviewRef: parsed.templatePreviewRef && typeof parsed.templatePreviewRef === "object" ? parsed.templatePreviewRef : null,
        presentationSettings: {
          ...defaultState.presentationSettings,
          ...(parsed.presentationSettings && typeof parsed.presentationSettings === "object" ? parsed.presentationSettings : {}),
        },
      };
    } catch (_error) {
      return makeDefaultState();
    }
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadTemplates() {
    if (!auth.loggedIn) return [];
    try {
      const storageKey = getTemplateStorageKey();
      const scopedRaw = storageKey ? localStorage.getItem(storageKey) : "";
      const legacyRaw = localStorage.getItem(TEMPLATE_KEY);
      const raw = scopedRaw || legacyRaw;
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed.map((template) => normalizeTemplateRecord(template, "saved")).filter(Boolean);
      if (!scopedRaw && legacyRaw && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      }
      return normalized;
    } catch (_error) {
      return [];
    }
  }

  function persistTemplates() {
    const storageKey = getTemplateStorageKey();
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(templates));
  }

  function getTemplateStorageKey() {
    const email = auth.loggedIn && typeof auth.email === "string" ? auth.email.trim().toLowerCase() : "";
    return email ? `${TEMPLATE_KEY}:${email}` : "";
  }

  function createTemplateSnapshot(name = state.templateName || "새로운 템플릿", modules = state.modules, presentationSettings = getPresentationSettings()) {
    const clonedModules = structuredCloneSafe(modules);
    const selectedModuleId = clonedModules.some((module) => module.id === state.selectedModuleId) ? state.selectedModuleId : clonedModules[0]?.id || "";
    return {
      schemaVersion: TEMPLATE_SCHEMA_VERSION,
      name,
      moduleOrder: clonedModules.map((module) => module.id),
      moduleTypes: clonedModules.map((module) => module.type),
      selectedModuleId,
      selectedSlideId: selectedModuleId === state.selectedModuleId ? state.selectedSlideId || "" : selectedModuleId ? `${selectedModuleId}-slide-0` : "",
      presentationSettings: structuredCloneSafe(presentationSettings),
      modules: clonedModules,
    };
  }

  function createTemplateRecord({ id = makeId("template"), name, source = "saved", snapshot, createdAt, updatedAt, meta = {} }) {
    const now = new Date().toISOString();
    const templateName = name || snapshot?.name || "이름 없는 템플릿";
    const templateSnapshot = snapshot || createTemplateSnapshot(templateName);
    return {
      id,
      source,
      name: templateName,
      createdAt: createdAt || now,
      updatedAt: updatedAt || now,
      meta,
      snapshot: {
        ...templateSnapshot,
        schemaVersion: TEMPLATE_SCHEMA_VERSION,
        name: templateName,
      },
    };
  }

  function normalizeTemplateRecord(template, fallbackSource = "saved") {
    if (!template || typeof template !== "object") return null;
    const rawSnapshot = template.snapshot && typeof template.snapshot === "object" ? template.snapshot : template;
    const modules = Array.isArray(rawSnapshot.modules) ? rawSnapshot.modules : [];
    if (!modules.length) return null;
    const name = template.name || rawSnapshot.name || "이름 없는 템플릿";
    const snapshot = {
      schemaVersion: TEMPLATE_SCHEMA_VERSION,
      name,
      moduleOrder: Array.isArray(rawSnapshot.moduleOrder) ? rawSnapshot.moduleOrder : modules.map((module) => module.id),
      moduleTypes: Array.isArray(rawSnapshot.moduleTypes) ? rawSnapshot.moduleTypes : modules.map((module) => module.type),
      selectedModuleId: rawSnapshot.selectedModuleId || modules[0]?.id || "",
      selectedSlideId: rawSnapshot.selectedSlideId || "",
      presentationSettings: {
        ...defaultPresentationSettings(),
        ...(rawSnapshot.presentationSettings && typeof rawSnapshot.presentationSettings === "object" ? rawSnapshot.presentationSettings : {}),
      },
      modules: structuredCloneSafe(modules),
    };
    return createTemplateRecord({
      id: template.id || makeId("template"),
      name,
      source: template.source || fallbackSource,
      snapshot,
      createdAt: template.createdAt || template.savedAt,
      updatedAt: template.updatedAt || template.savedAt,
      meta: template.meta || {},
    });
  }

  function loadAuth() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : { loggedIn: false, email: "" };
    } catch (_error) {
      return { loggedIn: false, email: "" };
    }
  }

  function persistAuth() {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  function render() {
    normalizePresentationSettings();
    currentSlides = buildSlides();
    syncSelection();
    applyPresentationAspect();

    els.editorView.classList.toggle("hidden", state.view !== "editor");
    els.loginView.classList.toggle("hidden", state.view !== "login");
    els.projectSummary.textContent = `${state.modules.length}개 모듈 · ${currentSlides.length}장`;
    els.moduleCount.textContent = state.modules.length;
    els.authBadge.textContent = auth.loggedIn ? auth.email : "로그인 전";
    els.authBadge.classList.toggle("logged-in", auth.loggedIn);
    els.authActionBtn.textContent = auth.loggedIn ? "로그아웃" : "로그인";
    els.authActionBtn.setAttribute("aria-label", auth.loggedIn ? "로그아웃" : "로그인");
    if (document.activeElement !== els.templateNameField) {
      els.templateNameField.value = state.templateName || "새로운 템플릿";
    }

    renderMenu();
    els.builderPanel.classList.toggle("hidden", state.activeMenu !== "builder");
    els.templateBrowser.classList.toggle("hidden", state.activeMenu !== "templates");
    els.settingsPanel.classList.toggle("hidden", state.activeMenu !== "settings");
    renderModules();
    renderTemplateBrowser();
    renderSettingsPanel();
    renderPreview();
    renderThumbnails();
    persistState();
  }

  function renderMenu() {
    document.querySelectorAll("[data-menu]").forEach((button) => {
      const isActive = button.dataset.menu === state.activeMenu;
      button.classList.toggle("active", isActive);
    });
  }

  function getPresentationSettings() {
    return {
      ...defaultPresentationSettings(),
      ...(state.presentationSettings && typeof state.presentationSettings === "object" ? state.presentationSettings : {}),
    };
  }

  function normalizePresentationSettings() {
    state.presentationSettings = getPresentationSettings();
    if (!["16:9", "4:3"].includes(state.presentationSettings.aspectRatio)) {
      state.presentationSettings.aspectRatio = "16:9";
    }
    if (typeof state.presentationSettings.logoEnabled !== "boolean") {
      state.presentationSettings.logoEnabled = Boolean(state.presentationSettings.logoDataUrl);
    }
    if (!["top-left", "top-right", "bottom-left", "bottom-right"].includes(state.presentationSettings.logoPosition)) {
      state.presentationSettings.logoPosition = DEFAULT_LOGO_POSITION;
    }
  }

  function applyPresentationAspect() {
    const settings = getPresentationSettings();
    const root = document.documentElement;
    if (settings.aspectRatio === "4:3") {
      root.style.setProperty("--slide-aspect-ratio", "4 / 3");
      root.style.setProperty("--slide-aspect-value", "1.3333333");
      return;
    }
    root.style.setProperty("--slide-aspect-ratio", "16 / 9");
    root.style.setProperty("--slide-aspect-value", "1.7777778");
  }

  function renderSettingsPanel() {
    if (!els.settingsPanel) return;
    const settings = getPresentationSettings();
    els.settingsPanel.querySelectorAll("[data-settings-section]").forEach((section) => {
      const key = section.dataset.settingsSection;
      const isCollapsed = isSettingsSectionCollapsed(key);
      section.classList.toggle("is-collapsed", isCollapsed);
      const toggle = section.querySelector("[data-toggle-settings-section]");
      const icon = toggle?.querySelector("[data-settings-section-icon]");
      if (toggle) toggle.setAttribute("aria-expanded", String(!isCollapsed));
      if (icon) icon.textContent = isCollapsed ? "⌄" : "⌃";
    });
    els.aspectWideBtn.classList.toggle("active", settings.aspectRatio === "16:9");
    els.aspectStandardBtn.classList.toggle("active", settings.aspectRatio === "4:3");
    els.logoOnBtn.classList.toggle("active", settings.logoEnabled);
    els.logoOffBtn.classList.toggle("active", !settings.logoEnabled);
    els.logoSettingsDetail.classList.toggle("hidden", !settings.logoEnabled);
    els.settingsPanel.querySelectorAll("[data-logo-position]").forEach((button) => {
      button.classList.toggle("active", button.dataset.logoPosition === settings.logoPosition);
    });
    els.logoUploadLabel.textContent = settings.logoDataUrl ? "변경" : "이미지 삽입";
    els.logoDeleteBtn.classList.toggle("hidden", !settings.logoDataUrl);
    els.logoCurrentBlock.classList.toggle("hidden", !settings.logoDataUrl);
    els.logoPreviewBox.innerHTML = settings.logoDataUrl
      ? `<img src="${escapeAttr(settings.logoDataUrl)}" alt="업로드한 로고" />`
      : `<span>로고 없음</span>`;
  }

  function renderTemplateBrowser() {
    if (!els.templateListPanel) return;
    const previewTemplate = getTemplatePreview();
    if (previewTemplate) {
      els.templateListPanel.innerHTML = renderTemplatePreview(previewTemplate);
      return;
    }

    els.templateListPanel.innerHTML = `
      ${renderTemplateSection("saved", "저장된 템플릿", templates, renderSavedTemplateCard, auth.loggedIn ? "저장된 템플릿이 없습니다." : "로그인 후 저장한 템플릿을 볼 수 있습니다.")}
      ${renderTemplateSection("recommended", "추천 템플릿", recommendedTemplates, renderRecommendedTemplateCard, "표시할 템플릿이 없습니다.")}
    `;
  }

  function renderTemplateSection(key, label, items, cardRenderer, emptyMessage = "저장된 템플릿이 없습니다.") {
    const body = items.length
      ? items.map(cardRenderer).join("")
      : `<div class="empty-note">${escapeHtml(emptyMessage)}</div>`;
    return `
      <section class="template-section" data-template-section="${key}">
        <h3 class="template-section-title">${escapeHtml(label)}</h3>
        <div class="template-section-body">${body}</div>
      </section>
    `;
  }

  function renderSavedTemplateCard(template) {
    return `
      <article class="template-card template-thumbnail-card">
        <button class="template-card-select" type="button" data-template-card="${template.id}" data-template-source="${template.source}" aria-label="${escapeAttr(template.name)} 미리보기">
          ${renderTemplateCardThumbnail(template)}
          <span class="template-card-title">${escapeHtml(template.name)}</span>
        </button>
        <button class="template-card-delete" type="button" data-template-delete="${template.id}" aria-label="템플릿 삭제">×</button>
      </article>
    `;
  }

  function renderRecommendedTemplateCard(template) {
    return `
      <button class="template-card template-thumbnail-card template-card-select" type="button" data-template-card="${template.id}" data-template-source="${template.source}" aria-label="${escapeAttr(template.name)} 미리보기">
        ${renderTemplateCardThumbnail(template)}
        <span class="template-card-title">${escapeHtml(template.name)}</span>
      </button>
    `;
  }

  function renderTemplateCardThumbnail(template) {
    const slide = getTemplateSlides(template)[0];
    if (!slide) {
      return `<span class="template-card-thumbnail template-card-thumbnail-empty">미리보기 없음</span>`;
    }
    return `<span class="template-card-thumbnail">${renderCompactSlidePreview(slide, getTemplatePresentationSettings(template), "template-thumbnail-preview")}</span>`;
  }

  function renderTemplatePreview(template) {
    const slides = getTemplateSlides(template);
    const settings = getTemplatePresentationSettings(template);
    const description = templatePreviewDescription(template);
    const slideThumbs = slides.length
      ? slides
          .map(
            (slide) => `
              <div class="template-preview-slide" aria-label="${escapeAttr(slide.moduleName)} 미리보기">
                ${renderCompactSlidePreview(slide, settings, "template-preview-slide-frame")}
              </div>
            `
          )
          .join("")
      : `<div class="empty-note">미리보기 슬라이드가 없습니다.</div>`;

    return `
      <div class="template-preview-panel">
        <button class="template-preview-back" type="button" data-template-preview-back>
          <span aria-hidden="true">←</span>
          <span>뒤로가기</span>
        </button>
        <div class="template-preview-heading">
          <h3>${escapeHtml(template.name)}</h3>
          <p>${escapeHtml(description)}</p>
        </div>
        <button class="template-preview-apply" type="button" data-template-apply="${template.id}" data-template-source="${template.source}">
          적용하기
        </button>
        <div class="template-preview-grid">${slideThumbs}</div>
      </div>
    `;
  }

  function getTemplatePreview() {
    const ref = state.templatePreviewRef;
    if (!ref?.id) return null;
    const template = findTemplateByRef(ref.id, ref.source);
    if (template) return template;
    state.templatePreviewRef = null;
    persistState();
    return null;
  }

  function openTemplatePreview(template) {
    state.templatePreviewRef = {
      id: template.id,
      source: template.source,
    };
    persistState();
    renderTemplateBrowser();
  }

  function getTemplateSlides(template) {
    const modules = structuredCloneSafe(template.snapshot?.modules || []);
    return buildSlidesFromModules(modules);
  }

  function getTemplatePresentationSettings(template) {
    return {
      ...defaultPresentationSettings(),
      ...(template.snapshot?.presentationSettings && typeof template.snapshot.presentationSettings === "object" ? template.snapshot.presentationSettings : {}),
    };
  }

  function templatePreviewDescription(template) {
    const settings = getTemplatePresentationSettings(template);
    const baseDescription = template.meta?.description || templateMeta(template);
    const hasLogo = Boolean(settings.logoEnabled && settings.logoDataUrl);
    return `${baseDescription} · PPT 비율: ${settings.aspectRatio} · 로고: ${hasLogo ? "있음" : "없음"}`;
  }

  function templateMeta(template) {
    const moduleCount = template.snapshot?.modules?.length || 0;
    const slideTypes = template.snapshot?.moduleTypes?.map(typeLabel).join(", ") || "모듈 없음";
    return `${moduleCount}개 모듈 · ${slideTypes}`;
  }

  function isTemplateSectionCollapsed(key) {
    return Boolean(state.templateSections?.[key]);
  }

  function isSettingsSectionCollapsed(key) {
    return Boolean(state.settingsSections?.[key]);
  }

  function syncSelection() {
    if (!state.modules.some((module) => module.id === state.selectedModuleId)) {
      state.selectedModuleId = state.modules[0]?.id || "";
    }
    if (!currentSlides.some((slide) => slide.id === state.selectedSlideId)) {
      state.selectedSlideId = currentSlides[0]?.id || "";
    }
    const selectedSlide = currentSlides.find((slide) => slide.id === state.selectedSlideId);
    if (selectedSlide) {
      state.selectedModuleId = selectedSlide.moduleId;
    }
  }

  function renderModules() {
    if (!state.modules.length) {
      els.moduleList.innerHTML = `<div class="empty-note">모듈을 추가하세요.</div>`;
      return;
    }

    els.moduleList.innerHTML = state.modules.map(renderModuleCard).join("");
  }

  function renderModuleCard(module) {
    const slideCount = currentSlides.filter((slide) => slide.moduleId === module.id).length;
    const isSelected = module.id === state.selectedModuleId;
    return `
      <article class="module-card ${isSelected ? "is-selected" : ""}" draggable="true" data-module-id="${module.id}">
        <header class="module-header">
          <span class="drag-handle" aria-hidden="true">⋮⋮</span>
          <button class="module-title ghost-reset" type="button" data-select-module="${module.id}">
            <strong>${escapeHtml(getModuleName(module))}</strong>
            <span>${escapeHtml(typeLabel(module.type))}</span>
          </button>
          <div class="module-actions">
            <span class="module-slide-chip">${slideCount}장</span>
            <button class="icon-button" type="button" data-toggle-module="${module.id}" aria-label="접기">${module.collapsed ? "⌄" : "⌃"}</button>
            <button class="icon-button" type="button" data-duplicate-module="${module.id}" aria-label="같은 모듈 추가">＋</button>
            <button class="icon-button danger" type="button" data-delete-module="${module.id}" aria-label="모듈 삭제">−</button>
          </div>
        </header>
        ${module.collapsed ? "" : `<div class="module-body">${renderModuleBody(module)}</div>`}
      </article>
    `;
  }

  function renderModuleBody(module) {
    if (module.type === "sermon") {
      return renderSermonControls(module);
    }
    if (module.type === "announcement") {
      return renderAnnouncementControls(module);
    }
    if (module.type === "custom") {
      return renderCustomControls(module);
    }

    const specific =
      module.type === "bible" ? renderBibleControls(module) : renderSongControls(module, module.type === "praise" ? DUMMY.praise : DUMMY.hymn);
    if (module.type === "hymn") {
      return `
        ${specific}
        ${renderHymnImageStatus(module)}
      `;
    }
    return `
      ${specific}
      ${renderSplitControls(module)}
      ${renderStyleControls(module)}
    `;
  }

  function renderToggleSection({ label, collapsed, attrs, body }) {
    return `
      <section class="toggle-section ${collapsed ? "is-collapsed" : ""}">
        <button class="toggle-section-header" type="button" ${attrs} aria-expanded="${!collapsed}">
          <span>${escapeHtml(label)}</span>
          <span class="toggle-section-icon" aria-hidden="true">${collapsed ? "⌄" : "⌃"}</span>
        </button>
        ${collapsed ? "" : `<div class="toggle-section-body">${body}</div>`}
      </section>
    `;
  }

  function renderSermonControls(module) {
    return `
      <div class="control-group">
        <label class="control-label" for="sermon-title-${module.id}">설교 제목</label>
        <input id="sermon-title-${module.id}" type="text" value="${escapeAttr(module.sermonTitle)}" data-module-field="sermonTitle" data-module-id="${module.id}" placeholder="설교 제목" />
      </div>
      ${renderSermonTextStyleControls(module, "titleStyle", "제목")}
      <div class="control-group">
        <label class="control-label" for="sermon-series-${module.id}">설교 시리즈</label>
        <input id="sermon-series-${module.id}" type="text" value="${escapeAttr(module.sermonSeries)}" data-module-field="sermonSeries" data-module-id="${module.id}" placeholder="설교 시리즈" />
      </div>
      ${renderSermonTextStyleControls(module, "seriesStyle", "시리즈")}
      ${renderBackgroundControls(module)}
    `;
  }

  function renderSermonTextStyleControls(module, scope, label) {
    const style = module[scope] || defaultSermonTextStyle(scope === "titleStyle" ? 64 : 34, scope === "titleStyle" ? 800 : 500);
    const activeTextColor = normalizeColor(style.textColor || "#000000");
    const customTextColor = !TEXT_COLOR_OPTIONS.some((option) => normalizeColor(option.value) === activeTextColor);
    const sectionKey = `sermon-${scope}`;
    return renderToggleSection({
      label: `${label} 폰트`,
      collapsed: isSectionCollapsed(module, sectionKey),
      attrs: `data-toggle-module-section data-module-id="${module.id}" data-section-key="${sectionKey}"`,
      body: `
        <div class="style-inline-row">
          <select data-sermon-style-field="fontFamily" data-sermon-style-scope="${scope}" data-module-id="${module.id}">
            ${["Georgia", "Malgun Gothic", "Arial", "Verdana"].map((font) => `<option value="${font}" ${font === style.fontFamily ? "selected" : ""}>${font}</option>`).join("")}
          </select>
          <label class="number-field">
            <span>크기</span>
            <input type="number" min="18" max="96" step="1" value="${style.fontSize}" data-sermon-style-field="fontSize" data-sermon-style-scope="${scope}" data-module-id="${module.id}" />
          </label>
        </div>
        <label class="range-line">
          <span>굵기</span>
          <input type="range" min="400" max="900" step="100" value="${style.fontWeight}" data-sermon-style-field="fontWeight" data-sermon-style-scope="${scope}" data-module-id="${module.id}" />
        </label>
        <div class="text-color-row">
          <span class="control-label">글자 색상</span>
          <div class="color-swatch-row">
            ${TEXT_COLOR_OPTIONS
              .map(
                (option) => `
                  <button class="color-swatch text-color-choice ${activeTextColor === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-sermon-text-color="${option.value}" data-sermon-style-scope="${scope}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
            <label class="color-swatch rainbow-swatch ${customTextColor ? "active" : ""}" aria-label="직접 색상">
              <input type="color" value="${colorInputValue(style.textColor, "#000000")}" data-sermon-style-field="textColor" data-sermon-style-scope="${scope}" data-module-id="${module.id}" />
            </label>
          </div>
        </div>
        ${renderTextAlignControls(style.textAlign, "left", (align) => `data-sermon-text-align="${align}" data-sermon-style-scope="${scope}" data-module-id="${module.id}"`)}
      `,
    });
  }

  function renderAnnouncementControls(module) {
    const items = getAnnouncementItems(module);
    return `
      <div class="announcement-editor-list">
        ${items.map((item, index) => renderAnnouncementItemControls(module, item, index)).join("")}
      </div>
      <button class="ghost-button announcement-add-button" type="button" data-add-announcement="${module.id}">+ 광고 추가</button>
      ${renderBackgroundControls(module)}
    `;
  }

  function renderAnnouncementItemControls(module, item, index) {
    const isCollapsed = Boolean(item.collapsed);
    return `
      <section class="announcement-editor-card ${isCollapsed ? "is-collapsed" : ""}" data-announcement-index="${index}">
        <div class="announcement-editor-heading">
          <button class="announcement-item-toggle ghost-reset" type="button" data-toggle-announcement-item="${item.id}" data-module-id="${module.id}" aria-expanded="${!isCollapsed}">
            <strong>${index + 1}번</strong>
            <span>${escapeHtml(item.title || "광고")}</span>
          </button>
          <div class="announcement-editor-actions">
            <button class="icon-button" type="button" data-toggle-announcement-item="${item.id}" data-module-id="${module.id}" aria-label="광고 접기">${isCollapsed ? "⌄" : "⌃"}</button>
            ${getAnnouncementItems(module).length > 1 ? `<button class="icon-button danger" type="button" data-delete-announcement="${item.id}" data-module-id="${module.id}" aria-label="광고 삭제">−</button>` : ""}
          </div>
        </div>
        ${
          isCollapsed
            ? ""
            : `<div class="announcement-editor-body">
                <div class="control-group">
                  <label class="control-label" for="announcement-title-${item.id}">광고 내용</label>
                  <input id="announcement-title-${item.id}" type="text" value="${escapeAttr(item.title)}" data-ad-field="title" data-announcement-id="${item.id}" data-module-id="${module.id}" placeholder="광고 내용 입력" />
                </div>
                ${renderAnnouncementTextStyleControls(module, item, "titleStyle", "내용")}
                <div class="control-group">
                  <label class="control-label" for="announcement-detail-${item.id}">광고 세부 내용</label>
                  <textarea id="announcement-detail-${item.id}" data-ad-field="detail" data-announcement-id="${item.id}" data-module-id="${module.id}" placeholder="광고 세부 내용 입력">${escapeHtml(item.detail)}</textarea>
                </div>
                ${renderAnnouncementTextStyleControls(module, item, "detailStyle", "세부")}
                ${renderAnnouncementBoxColorControls(module, item)}
              </div>`
        }
      </section>
    `;
  }

  function renderAnnouncementTextStyleControls(module, item, scope, label) {
    const style = item[scope] || defaultSermonTextStyle(scope === "titleStyle" ? 32 : 22, scope === "titleStyle" ? 800 : 400);
    const activeTextColor = normalizeColor(style.textColor || "#000000");
    const customTextColor = !TEXT_COLOR_OPTIONS.some((option) => normalizeColor(option.value) === activeTextColor);
    return renderToggleSection({
      label: `${label} 폰트`,
      collapsed: isSectionCollapsed(item, scope),
      attrs: `data-toggle-announcement-section data-module-id="${module.id}" data-announcement-id="${item.id}" data-section-key="${scope}"`,
      body: `
        <div class="style-inline-row">
          <select data-ad-style-field="fontFamily" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}">
            ${["Georgia", "Malgun Gothic", "Arial", "Verdana"].map((font) => `<option value="${font}" ${font === style.fontFamily ? "selected" : ""}>${font}</option>`).join("")}
          </select>
          <label class="number-field">
            <span>크기</span>
            <input type="number" min="14" max="72" step="1" value="${style.fontSize}" data-ad-style-field="fontSize" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}" />
          </label>
        </div>
        <label class="range-line">
          <span>굵기</span>
          <input type="range" min="400" max="900" step="100" value="${style.fontWeight}" data-ad-style-field="fontWeight" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}" />
        </label>
        <div class="text-color-row">
          <span class="control-label">글자 색상</span>
          <div class="color-swatch-row">
            ${TEXT_COLOR_OPTIONS
              .map(
                (option) => `
                  <button class="color-swatch text-color-choice ${activeTextColor === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-ad-text-color="${option.value}" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
            <label class="color-swatch rainbow-swatch ${customTextColor ? "active" : ""}" aria-label="직접 색상">
              <input type="color" value="${colorInputValue(style.textColor, "#000000")}" data-ad-style-field="textColor" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}" />
            </label>
          </div>
        </div>
        ${renderTextAlignControls(style.textAlign, "left", (align) => `data-ad-text-align="${align}" data-ad-style-scope="${scope}" data-announcement-id="${item.id}" data-module-id="${module.id}"`)}
      `,
    });
  }

  function renderAnnouncementBoxColorControls(module, item) {
    const options = [
      { name: "흰색", value: "#FFFFFF" },
      { name: "검은색", value: "#000000" },
    ];
    const activeBoxColor = normalizeColor(item.boxColor || "#FFFFFF");
    return renderToggleSection({
      label: "박스 배경색",
      collapsed: isSectionCollapsed(item, "boxColor"),
      attrs: `data-toggle-announcement-section data-module-id="${module.id}" data-announcement-id="${item.id}" data-section-key="boxColor"`,
      body: `
        <div class="color-swatch-row">
          ${options
            .map(
              (option) => `
                <button class="color-swatch box-color-choice ${activeBoxColor === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-ad-box-color="${option.value}" data-announcement-id="${item.id}" data-module-id="${module.id}" aria-label="${option.name}"></button>
              `
            )
            .join("")}
        </div>
      `,
    });
  }

  function renderCustomControls(module) {
    ensureCustomModule(module);
    const isTitleSlide = module.customSlideType !== "content";
    return `
      <div class="control-group">
        <span class="control-label">종류</span>
        <div class="custom-type-grid">
          ${renderCustomTypeButton(module, "title", "제목 슬라이드", "제목", "부제목")}
          ${renderCustomTypeButton(module, "content", "내용 슬라이드", "제목", "내용")}
        </div>
      </div>
      ${
        isTitleSlide
          ? renderCustomTitleSlideControls(module)
          : renderCustomContentSlideControls(module)
      }
      ${renderBackgroundControls(module)}
    `;
  }

  function renderCustomTypeButton(module, type, label, primary, secondary) {
    const isActive = (module.customSlideType || "title") === type;
    return `
      <button class="custom-type-card ${isActive ? "active" : ""}" type="button" data-custom-slide-type="${type}" data-module-id="${module.id}">
        <span class="custom-type-preview ${type === "content" ? "content" : ""}">
          <strong>${primary}</strong>
          <em>${secondary}</em>
        </span>
        <span>${label}</span>
      </button>
    `;
  }

  function renderCustomTitleSlideControls(module) {
    return `
      <div class="control-group">
        <label class="control-label" for="custom-title-${module.id}">제목</label>
        <input id="custom-title-${module.id}" type="text" value="${escapeAttr(module.customTitle)}" data-custom-field="customTitle" data-module-id="${module.id}" placeholder="제목 입력" />
      </div>
      ${renderCustomTextStyleControls(module, "customTitleStyle", "제목")}
      <div class="control-group">
        <label class="control-label" for="custom-subtitle-${module.id}">부제목</label>
        <input id="custom-subtitle-${module.id}" type="text" value="${escapeAttr(module.customSubtitle)}" data-custom-field="customSubtitle" data-module-id="${module.id}" placeholder="부제목 입력" />
      </div>
      ${renderCustomTextStyleControls(module, "customSubtitleStyle", "부제목")}
    `;
  }

  function renderCustomContentSlideControls(module) {
    return `
      <div class="control-group">
        <span class="control-label">자주 쓰는 내용</span>
        <div class="custom-preset-row">
          ${CUSTOM_CONTENT_PRESETS.map(
            (preset) => `
              <button class="ghost-button ${module.customPresetId === preset.id ? "active" : ""}" type="button" data-custom-preset="${preset.id}" data-module-id="${module.id}">${escapeHtml(preset.title)}</button>
            `
          ).join("")}
        </div>
      </div>
      <div class="control-group">
        <label class="control-label" for="custom-content-title-${module.id}">제목</label>
        <input id="custom-content-title-${module.id}" type="text" value="${escapeAttr(module.customContentTitle)}" data-custom-field="customContentTitle" data-module-id="${module.id}" placeholder="제목 입력" />
      </div>
      ${renderCustomTextStyleControls(module, "customContentTitleStyle", "제목")}
      <div class="control-group">
        <label class="control-label" for="custom-content-${module.id}">내용</label>
        <textarea id="custom-content-${module.id}" data-custom-field="customContentText" data-module-id="${module.id}" placeholder="내용 입력">${escapeHtml(module.customContentText)}</textarea>
      </div>
      ${renderCustomTextStyleControls(module, "customContentBodyStyle", "내용")}
    `;
  }

  function renderCustomTextStyleControls(module, scope, label) {
    const style = module[scope] || getCustomStyleFallback(scope);
    const activeTextColor = normalizeColor(style.textColor || "#000000");
    const customTextColor = !TEXT_COLOR_OPTIONS.some((option) => normalizeColor(option.value) === activeTextColor);
    return renderToggleSection({
      label: `${label} 폰트`,
      collapsed: isSectionCollapsed(module, `custom-${scope}`),
      attrs: `data-toggle-module-section data-module-id="${module.id}" data-section-key="custom-${scope}"`,
      body: `
        <div class="style-inline-row">
          <select data-custom-style-field="fontFamily" data-custom-style-scope="${scope}" data-module-id="${module.id}">
            ${["Georgia", "Malgun Gothic", "Arial", "Verdana"].map((font) => `<option value="${font}" ${font === style.fontFamily ? "selected" : ""}>${font}</option>`).join("")}
          </select>
          <label class="number-field">
            <span>크기</span>
            <input type="number" min="14" max="96" step="1" value="${style.fontSize}" data-custom-style-field="fontSize" data-custom-style-scope="${scope}" data-module-id="${module.id}" />
          </label>
        </div>
        <label class="range-line">
          <span>굵기</span>
          <input type="range" min="400" max="900" step="100" value="${style.fontWeight}" data-custom-style-field="fontWeight" data-custom-style-scope="${scope}" data-module-id="${module.id}" />
        </label>
        <div class="text-color-row">
          <span class="control-label">글자 색상</span>
          <div class="color-swatch-row">
            ${TEXT_COLOR_OPTIONS
              .map(
                (option) => `
                  <button class="color-swatch text-color-choice ${activeTextColor === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-custom-text-color="${option.value}" data-custom-style-scope="${scope}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
            <label class="color-swatch rainbow-swatch ${customTextColor ? "active" : ""}" aria-label="직접 색상">
              <input type="color" value="${colorInputValue(style.textColor, "#000000")}" data-custom-style-field="textColor" data-custom-style-scope="${scope}" data-module-id="${module.id}" />
            </label>
          </div>
        </div>
        ${renderTextAlignControls(style.textAlign, customDefaultAlign(scope), (align) => `data-custom-text-align="${align}" data-custom-style-scope="${scope}" data-module-id="${module.id}"`)}
      `,
    });
  }

  function renderTextAlignControls(value, fallback, attrsForAlign) {
    const activeAlign = normalizeTextAlign(value, fallback);
    return `
      <div class="text-align-row">
        <span class="control-label">글자 정렬</span>
        <div class="color-swatch-row text-align-button-row">
          ${TEXT_ALIGN_OPTIONS.map(
            (option) => `
              <button class="color-swatch text-align-choice ${activeAlign === option.value ? "active" : ""}" type="button" ${attrsForAlign(option.value)} aria-label="${option.name}">
                <span class="text-align-icon align-${option.value}" aria-hidden="true">
                  <span></span><span></span><span></span><span></span>
                </span>
              </button>
            `
          ).join("")}
        </div>
      </div>
    `;
  }

  function normalizeTextAlign(value, fallback = "center") {
    return TEXT_ALIGN_OPTIONS.some((option) => option.value === value) ? value : fallback;
  }

  function textAlignToJustify(value, fallback = "center") {
    const align = normalizeTextAlign(value, fallback);
    if (align === "left") return "flex-start";
    if (align === "right") return "flex-end";
    return "center";
  }

  function textAlignToPpt(value, fallback = "center") {
    const align = normalizeTextAlign(value, fallback);
    if (align === "left") return "l";
    if (align === "right") return "r";
    return "ctr";
  }

  function customDefaultAlign(scope) {
    return scope === "customContentBodyStyle" ? "left" : "center";
  }

  function renderSongControls(module, list) {
    const isDropdownOpen = module.searchQuery.trim() && module.searchResultsOpen !== false;
    return `
      <div class="control-group song-search-control">
        <label class="control-label" for="search-${module.id}">곡 검색</label>
        <div class="search-dropdown-anchor">
          <div class="field-row">
            <input id="search-${module.id}" type="text" value="${escapeAttr(module.searchQuery)}" data-module-field="searchQuery" data-module-id="${module.id}" placeholder="곡명 입력" />
            <button class="ghost-button" type="button" data-render-only="${module.id}">검색</button>
          </div>
          <div class="result-list ${isDropdownOpen ? "is-open" : ""}" data-result-list="${module.id}">
            ${renderSongResultItems(module, list)}
          </div>
        </div>
      </div>
    `;
  }

  function renderSongResultItems(module, list) {
    const query = module.searchQuery.trim().toLowerCase();
    if (!query) {
      return "";
    }
    if (module.searchResultsOpen === false) {
      return "";
    }

    const results = list.filter((item) => {
      const haystack = `${item.title} ${item.meta}`.toLowerCase();
      return haystack.includes(query);
    });

    return (
      results
        .map(
          (item) => `
            <button class="result-button ${item.id === module.selectedId ? "active" : ""}" type="button" data-select-item="${item.id}" data-module-id="${module.id}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(getSongMeta(module, item))}</span>
            </button>
          `,
        )
        .join("") || `<div class="empty-note">검색 결과가 없습니다.</div>`
    );
  }

  function getSongMeta(module, item) {
    if (module.type === "hymn" && item.scoreImage) {
      return `${item.meta} · 악보 이미지 연결`;
    }
    return item.meta;
  }

  function renderHymnImageStatus(module) {
    const item = getSelectedSongItem(module);
    return `
      <div class="control-group">
        <span class="control-label">악보 이미지</span>
        <div class="hymn-image-card">
          <div class="hymn-image-thumb" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.scoreImage || "db://hymn-scores/placeholder.png")}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderBibleControls(module) {
    const testament = DUMMY.bible.testaments[module.testament] || DUMMY.bible.testaments.old;
    const books = Object.keys(testament.books);
    const book = testament.books[module.book] ? module.book : books[0];
    const chapters = Object.keys(testament.books[book]);
    const chapter = testament.books[book][module.chapter] ? module.chapter : chapters[0];
    const verses = Object.keys(testament.books[book][chapter]).map(Number);
    const minVerse = Math.min(...verses);
    const maxVerse = Math.max(...verses);
    const validation = validateBibleModule(module);
    const rangeValue = module.verseRangeInput || `${module.verseStart}-${module.verseEnd}`;

    return `
      <div class="control-group">
        <span class="control-label">성경 선택</span>
        <div class="segmented">
          <button type="button" class="${module.testament === "old" ? "active" : ""}" data-testament="old" data-module-id="${module.id}">구약</button>
          <button type="button" class="${module.testament === "new" ? "active" : ""}" data-testament="new" data-module-id="${module.id}">신약</button>
          <select data-module-field="version" data-module-id="${module.id}">
            ${DUMMY.bible.versions.map((version) => `<option value="${escapeAttr(version)}" ${version === module.version ? "selected" : ""}>${escapeHtml(version)}</option>`).join("")}
          </select>
        </div>
        <div class="field-row three">
          <select data-module-field="book" data-module-id="${module.id}">
            ${books.map((name) => `<option value="${escapeAttr(name)}" ${name === book ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
          </select>
          <select data-module-field="chapter" data-module-id="${module.id}">
            ${chapters.map((num) => `<option value="${num}" ${num === chapter ? "selected" : ""}>${num}장</option>`).join("")}
          </select>
          <input class="${validation.valid ? "" : "is-invalid"}" type="text" value="${escapeAttr(rangeValue)}" data-verse-range="${module.id}" aria-label="절 범위" />
        </div>
        <div class="empty-note">범위: ${minVerse}-${maxVerse}절</div>
        ${validation.valid ? "" : `<div class="field-error">${escapeHtml(validation.message)}</div>`}
      </div>
    `;
  }

  function validateBibleModule(module) {
    if (module.type !== "bible") return { valid: true, message: "" };

    const testament = DUMMY.bible.testaments[module.testament];
    if (!testament) {
      return { valid: false, message: "DB에 없는 성경 구분입니다." };
    }

    const book = testament.books[module.book];
    if (!book) {
      return { valid: false, message: `${module.book || "선택한 성경"}은 DB에 없습니다.` };
    }

    const chapter = book[module.chapter];
    if (!chapter) {
      return { valid: false, message: `${module.book} ${module.chapter}장은 DB에 없습니다.` };
    }

    const verseNumbers = Object.keys(chapter).map(Number).sort((a, b) => a - b);
    const minVerse = verseNumbers[0];
    const maxVerse = verseNumbers[verseNumbers.length - 1];
    const range = parseBibleRange(module);

    if (!range.valid) {
      return { valid: false, message: "절 범위를 숫자로 입력하세요. 예: 1-4" };
    }
    if (range.start > range.end) {
      return { valid: false, message: "시작 절은 끝 절보다 작거나 같아야 합니다." };
    }
    if (range.start < minVerse || range.end > maxVerse) {
      return { valid: false, message: `DB에 있는 절 범위는 ${minVerse}-${maxVerse}절입니다.` };
    }

    return { valid: true, message: "", start: range.start, end: range.end };
  }

  function parseBibleRange(module) {
    const value = module.verseRangeInput || `${module.verseStart || ""}-${module.verseEnd || ""}`;
    const parts = String(value).match(/\d+/g);
    if (!parts || !parts.length) {
      return { valid: false, start: NaN, end: NaN };
    }
    const start = Number(parts[0]);
    const end = Number(parts[1] || parts[0]);
    return {
      valid: Number.isFinite(start) && Number.isFinite(end),
      start,
      end,
    };
  }

  function renderSplitControls(module) {
    return `
      <div class="control-group">
        <span class="control-label">슬라이드 분할</span>
        <div class="segmented">
          <button type="button" class="${module.splitMode === "2" ? "active" : ""}" data-split-mode="2" data-module-id="${module.id}">2줄</button>
          <button type="button" class="${module.splitMode === "4" ? "active" : ""}" data-split-mode="4" data-module-id="${module.id}">4줄</button>
          <button type="button" class="${module.splitMode === "custom" ? "active" : ""}" data-split-mode="custom" data-module-id="${module.id}">직접 입력</button>
        </div>
        ${
          module.splitMode === "custom"
            ? `<textarea data-module-field="customText" data-module-id="${module.id}" placeholder="가사 또는 구절을 직접 입력하세요.">${escapeHtml(module.customText)}</textarea>
              <div class="hint-note">빈 줄, 즉 Enter 두 번 기준으로 새 슬라이드가 생성됩니다.</div>`
            : ""
        }
      </div>
    `;
  }

  function renderStyleControls(module) {
    const activeTextColor = normalizeColor(module.style.textColor);
    const customTextColor = !TEXT_COLOR_OPTIONS.some((option) => normalizeColor(option.value) === activeTextColor);

    return `
      ${renderToggleSection({
        label: "폰트",
        collapsed: isSectionCollapsed(module, "font"),
        attrs: `data-toggle-module-section data-module-id="${module.id}" data-section-key="font"`,
        body: `
        <div class="style-inline-row">
          <select data-style-field="fontFamily" data-module-id="${module.id}">
            ${["Malgun Gothic", "Arial", "Georgia", "Verdana"].map((font) => `<option value="${font}" ${font === module.style.fontFamily ? "selected" : ""}>${font}</option>`).join("")}
          </select>
          <label class="number-field">
            <span>크기</span>
            <input type="number" min="30" max="80" step="1" value="${module.style.fontSize}" data-style-field="fontSize" data-module-id="${module.id}" />
          </label>
        </div>
        <label class="range-line">
          <span>굵기</span>
          <input type="range" min="400" max="900" step="100" value="${module.style.fontWeight}" data-style-field="fontWeight" data-module-id="${module.id}" />
        </label>
        <label class="range-line">
          <span>자간</span>
          <input type="range" min="-2" max="10" step="0.2" value="${module.style.letterSpacing || 0}" data-style-field="letterSpacing" data-module-id="${module.id}" />
        </label>
        <label class="range-line">
          <span>행간</span>
          <input type="range" min="1" max="1.6" step="0.02" value="${module.style.lineHeight}" data-style-field="lineHeight" data-module-id="${module.id}" />
        </label>
        <div class="text-color-row">
          <span class="control-label">글자 색상</span>
          <div class="color-swatch-row">
            ${TEXT_COLOR_OPTIONS
              .map(
                (option) => `
                  <button class="color-swatch text-color-choice ${activeTextColor === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-text-color="${option.value}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
            <label class="color-swatch rainbow-swatch ${customTextColor ? "active" : ""}" aria-label="직접 색상">
              <input type="color" value="${colorInputValue(module.style.textColor, "#FFFFFF")}" data-style-field="textColor" data-module-id="${module.id}" />
            </label>
          </div>
        </div>
        ${renderTextAlignControls(module.style.textAlign, "center", (align) => `data-text-align="${align}" data-module-id="${module.id}"`)}
        `,
      })}
      ${renderBackgroundControls(module)}
    `;
  }

  function renderBackgroundControls(module) {
    const activeBackground = module.style.background || COLORS.black;
    const uploadedBackground = isImageBackground(activeBackground);
    return renderToggleSection({
      label: "배경",
      collapsed: isSectionCollapsed(module, "background"),
      attrs: `data-toggle-module-section data-module-id="${module.id}" data-section-key="background"`,
      body: `
        <div class="background-section">
          <span class="background-section-title">단색 배경</span>
          <div class="background-options">
            ${BACKGROUND_OPTIONS
              .map(
                (option) => `
                  <button class="background-choice ${normalizeColor(activeBackground) === normalizeColor(option.value) ? "active" : ""}" type="button" style="background:${option.value}" data-background="${option.value}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="background-section">
          <span class="background-section-title">템플릿 배경</span>
          <div class="background-options">
            ${TEMPLATE_BACKGROUND_OPTIONS
              .map(
                (option) => `
                  <button class="background-choice template-background-choice ${activeBackground === option.value ? "active" : ""}" type="button" style="background:${option.value}" data-background="${escapeAttr(option.value)}" data-module-id="${module.id}" aria-label="${option.name}"></button>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="background-section">
          <span class="background-section-title">이미지 배경</span>
          <label class="background-choice background-upload-choice ${uploadedBackground ? "active has-image" : ""}" style="${uploadedBackground ? `background:${escapeAttr(toCssBackground(activeBackground))}` : ""}" aria-label="이미지 업로드">
            <input type="file" accept="image/*" data-background-upload data-module-id="${module.id}" />
          </label>
        </div>
      `,
    });
  }

  function renderSlideFrame(content, compact = false, presentationSettings = getPresentationSettings()) {
    return `${renderLogoOverlay(compact, presentationSettings)}${content}`;
  }

  function renderLogoOverlay(compact = false, settings = getPresentationSettings()) {
    if (!settings.logoEnabled || !settings.logoDataUrl) return "";
    const position = ["top-left", "top-right", "bottom-left", "bottom-right"].includes(settings.logoPosition)
      ? settings.logoPosition
      : DEFAULT_LOGO_POSITION;
    return `<img class="slide-logo ${compact ? "compact " : ""}${position}" src="${escapeAttr(settings.logoDataUrl)}" alt="로고" />`;
  }

  function renderCompactSlidePreview(slide, presentationSettings = getPresentationSettings(), extraClass = "") {
    const firstLine = slide.lines.find(Boolean) || slide.moduleName;
    const className = `thumb-preview${extraClass ? ` ${extraClass}` : ""}`;
    if (slide.kind === "hymn-image") {
      return `<div class="${className} hymn-thumb-preview">${renderSlideFrame(`<img class="thumb-image-content" src="${escapeAttr(slide.imageDataUrl)}" alt="${escapeAttr(slide.imageAlt)}" />`, true, presentationSettings)}</div>`;
    }
    if (slide.kind === "sermon") {
      return `<div class="${className}" style="background:${escapeAttr(toCssBackground(slide.style.background))};">${renderSlideFrame(renderSermonSlideContent(slide, true), true, presentationSettings)}</div>`;
    }
    if (slide.kind === "announcement-cover" || slide.kind === "announcement-list") {
      return `<div class="${className}" style="background:${escapeAttr(toCssBackground(slide.style.background))};">${renderSlideFrame(renderAnnouncementSlideContent(slide, true), true, presentationSettings)}</div>`;
    }
    if (slide.kind === "custom-title" || slide.kind === "custom-content") {
      return `<div class="${className}" style="background:${escapeAttr(toCssBackground(slide.style.background))};">${renderSlideFrame(renderCustomSlideContent(slide, true), true, presentationSettings)}</div>`;
    }
    return `<div class="${className}" style="background:${escapeAttr(toCssBackground(slide.style.background))}; color:${escapeAttr(slide.style.textColor)}; font-family:${escapeAttr(slide.style.fontFamily)}; text-align:${normalizeTextAlign(slide.style.textAlign, "center")};">${renderSlideFrame(`<span>${escapeHtml(firstLine)}</span>`, true, presentationSettings)}</div>`;
  }

  function renderPreview() {
    const slide = getSelectedSlide();
    if (!slide) {
      els.previewTitle.textContent = "슬라이드";
      els.slideCounter.textContent = "0 / 0";
      els.slideStage.style.background = COLORS.black;
      els.slideStage.style.color = "#ffffff";
      els.slideStage.innerHTML = `<div class="slide-empty">모듈을 추가하세요</div>`;
      return;
    }

    const index = currentSlides.findIndex((item) => item.id === slide.id) + 1;
    els.previewTitle.textContent = `${slide.moduleName} · ${slide.localIndex + 1}`;
    els.slideCounter.textContent = `${index} / ${currentSlides.length}`;
    if (slide.kind === "hymn-image") {
      els.slideStage.style.background = "#f8f5ee";
      els.slideStage.style.color = COLORS.black;
      els.slideStage.innerHTML = renderSlideFrame(`
        <img class="slide-image-content" src="${escapeAttr(slide.imageDataUrl)}" alt="${escapeAttr(slide.imageAlt)}" />
      `);
      return;
    }
    if (slide.kind === "sermon") {
      applySlideStyle(els.slideStage, slide.style);
      els.slideStage.innerHTML = renderSlideFrame(renderSermonSlideContent(slide, false));
      return;
    }
    if (slide.kind === "announcement-cover" || slide.kind === "announcement-list") {
      applySlideStyle(els.slideStage, slide.style);
      els.slideStage.innerHTML = renderSlideFrame(renderAnnouncementSlideContent(slide, false));
      return;
    }
    if (slide.kind === "custom-title" || slide.kind === "custom-content") {
      applySlideStyle(els.slideStage, slide.style);
      els.slideStage.innerHTML = renderSlideFrame(renderCustomSlideContent(slide, false));
      return;
    }

    applySlideStyle(els.slideStage, slide.style);
    const previewFontSize = ((Number(slide.style.fontSize) || 44) / 1020) * 100;
    els.slideStage.innerHTML = renderSlideFrame(`
      <div class="slide-content" style="font-family:${escapeAttr(slide.style.fontFamily)}; font-size:clamp(12px, ${previewFontSize.toFixed(3)}cqw, ${slide.style.fontSize}px); line-height:${slide.style.lineHeight}; font-weight:${slide.style.fontWeight}; letter-spacing:${Number(slide.style.letterSpacing || 0)}px; text-align:${normalizeTextAlign(slide.style.textAlign, "center")};">
        ${slide.lines.map((line) => `<span class="slide-line">${escapeHtml(line)}</span>`).join("")}
      </div>
    `);
  }

  function renderThumbnails() {
    if (!currentSlides.length) {
      els.thumbnailStrip.innerHTML = "";
      return;
    }

    let slideNumber = 0;
    els.thumbnailStrip.innerHTML = state.modules
      .map((module) => {
        const moduleSlides = currentSlides.filter((slide) => slide.moduleId === module.id);
        if (!moduleSlides.length) return "";

        const thumbs = moduleSlides
          .map((slide) => {
            slideNumber += 1;
            const firstLine = slide.lines.find(Boolean) || slide.moduleName;
            const preview = renderCompactSlidePreview(slide);
            return `
              <button class="thumb ${slide.id === state.selectedSlideId ? "active" : ""}" type="button" data-slide-id="${slide.id}" data-module-id="${slide.moduleId}" title="${escapeAttr(firstLine)}">
                ${preview}
              </button>
            `;
          })
          .join("");

        return `
          <section class="thumb-group" aria-label="${escapeAttr(getModuleName(module))} 슬라이드">
            <div class="thumb-group-title">
              <strong>${escapeHtml(getModuleName(module))}</strong>
              <span class="thumb-group-count">${moduleSlides.length}</span>
            </div>
            <div class="thumb-group-track">${thumbs}</div>
          </section>
        `;
      })
      .join("");
  }

  function buildSlides() {
    return buildSlidesFromModules(state.modules);
  }

  function buildSlidesFromModules(modules) {
    const slides = [];
    modules.forEach((module) => {
      if (module.type === "hymn") {
        slides.push(buildHymnSlide(module));
        return;
      }
      if (module.type === "sermon") {
        slides.push(buildSermonSlide(module));
        return;
      }
      if (module.type === "announcement") {
        slides.push(...buildAnnouncementSlides(module));
        return;
      }
      if (module.type === "custom") {
        slides.push(buildCustomSlide(module));
        return;
      }

      const moduleSlides = splitModuleIntoSlides(module);
      moduleSlides.forEach((lines, localIndex) => {
        slides.push({
          id: `${module.id}-slide-${localIndex}`,
          moduleId: module.id,
          moduleName: getModuleName(module),
          localIndex,
          lines,
          style: module.style,
        });
      });
    });
    return slides;
  }

  function buildHymnSlide(module) {
    const item = getSelectedSongItem(module);
    return {
      id: `${module.id}-slide-0`,
      moduleId: module.id,
      moduleName: getModuleName(module),
      localIndex: 0,
      kind: "hymn-image",
      lines: [item.title],
      style: {
        ...defaultStyle(),
        background: "#F8F5EE",
        textColor: COLORS.black,
      },
      imageAlt: `${item.title} 악보 이미지`,
      imageSource: item.scoreImage,
      imageDataUrl: hymnScoreImageDataUrl(item),
    };
  }

  function buildSermonSlide(module) {
    return {
      id: `${module.id}-slide-0`,
      moduleId: module.id,
      moduleName: getModuleName(module),
      localIndex: 0,
      kind: "sermon",
      lines: [module.sermonTitle || "설교 제목"],
      style: {
        ...defaultStyle(),
        ...(module.style || {}),
      },
      sermonTitle: module.sermonTitle || "설교 제목",
      sermonSeries: module.sermonSeries || "",
      titleStyle: module.titleStyle || defaultSermonTextStyle(64, 800),
      seriesStyle: module.seriesStyle || defaultSermonTextStyle(34, 500),
    };
  }

  function buildAnnouncementSlides(module) {
    const style = {
      ...defaultStyle(),
      ...(module.style || {}),
    };
    const announcements = getAnnouncementItems(module).map((item) => ({
      ...item,
      titleStyle: item.titleStyle || defaultSermonTextStyle(32, 800),
      detailStyle: item.detailStyle || defaultSermonTextStyle(22, 400),
    }));

    const slides = [
      {
        id: `${module.id}-slide-0`,
        moduleId: module.id,
        moduleName: getModuleName(module),
        localIndex: 0,
        kind: "announcement-cover",
        lines: ["교회소식"],
        style,
      },
    ];

    for (let startIndex = 0; startIndex < announcements.length; startIndex += ANNOUNCEMENTS_PER_SLIDE) {
      const group = announcements.slice(startIndex, startIndex + ANNOUNCEMENTS_PER_SLIDE);
      const localIndex = slides.length;
      slides.push({
        id: `${module.id}-slide-${localIndex}`,
        moduleId: module.id,
        moduleName: getModuleName(module),
        localIndex,
        kind: "announcement-list",
        lines: group.map((item) => item.title),
        style,
        announcements: group,
        announcementStartIndex: startIndex,
      });
    }

    return slides;
  }

  function buildCustomSlide(module) {
    ensureCustomModule(module);
    const style = {
      ...defaultStyle(),
      ...(module.style || {}),
    };
    const isContent = module.customSlideType === "content";
    return {
      id: `${module.id}-slide-0`,
      moduleId: module.id,
      moduleName: getModuleName(module),
      localIndex: 0,
      kind: isContent ? "custom-content" : "custom-title",
      lines: [isContent ? module.customContentTitle : module.customTitle],
      style,
      customTitle: module.customTitle,
      customSubtitle: module.customSubtitle,
      customContentTitle: module.customContentTitle,
      customContentText: module.customContentText,
      customTitleStyle: module.customTitleStyle,
      customSubtitleStyle: module.customSubtitleStyle,
      customContentTitleStyle: module.customContentTitleStyle,
      customContentBodyStyle: module.customContentBodyStyle,
    };
  }

  function renderSermonSlideContent(slide, compact) {
    const titleSize = compact ? 12 : ((Number(slide.titleStyle.fontSize) || 64) / 1020) * 100;
    const seriesSize = compact ? 7 : ((Number(slide.seriesStyle.fontSize) || 34) / 1020) * 100;
    const titleFontSize = compact ? `${titleSize}px` : `clamp(20px, ${titleSize.toFixed(3)}cqw, ${slide.titleStyle.fontSize}px)`;
    const seriesFontSize = compact ? `${seriesSize}px` : `clamp(10px, ${seriesSize.toFixed(3)}cqw, ${slide.seriesStyle.fontSize}px)`;
    return `
      <div class="sermon-slide-content ${compact ? "compact" : ""}">
        <span class="sermon-divider" aria-hidden="true"></span>
        <div class="sermon-text-stack">
          <span class="sermon-series" style="font-family:${escapeAttr(slide.seriesStyle.fontFamily)}; font-size:${seriesFontSize}; font-weight:${slide.seriesStyle.fontWeight}; color:${slide.seriesStyle.textColor}; text-align:${normalizeTextAlign(slide.seriesStyle.textAlign, "left")};">${escapeHtml(slide.sermonSeries)}</span>
          <span class="sermon-title" style="font-family:${escapeAttr(slide.titleStyle.fontFamily)}; font-size:${titleFontSize}; font-weight:${slide.titleStyle.fontWeight}; color:${slide.titleStyle.textColor}; text-align:${normalizeTextAlign(slide.titleStyle.textAlign, "left")};">${escapeHtml(slide.sermonTitle)}</span>
        </div>
      </div>
    `;
  }

  function renderAnnouncementSlideContent(slide, compact) {
    if (slide.kind === "announcement-cover") {
      return `
        <div class="announcement-slide-content announcement-cover ${compact ? "compact" : ""}">
          <div class="announcement-cover-lockup">
            <div class="announcement-cover-title">
              <span aria-hidden="true">[</span>
              <strong>교회소식</strong>
              <span aria-hidden="true">]</span>
            </div>
            <p>이번 주 교회 소식을 전해드립니다.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="announcement-slide-content announcement-list ${compact ? "compact" : ""}">
        <div class="announcement-list-stack">
          ${(slide.announcements || [])
            .map((item, index) => renderAnnouncementRow(item, (slide.announcementStartIndex || 0) + index, compact))
            .join("")}
        </div>
      </div>
    `;
  }

  function renderAnnouncementRow(item, index, compact) {
    const titleStyle = item.titleStyle || defaultSermonTextStyle(32, 800);
    const detailStyle = item.detailStyle || defaultSermonTextStyle(22, 400);
    const titleFontSize = announcementFontSize(titleStyle, compact);
    const detailFontSize = announcementFontSize(detailStyle, compact);
    const circleColor = titleStyle.textColor || COLORS.black;
    const boxColor = item.boxColor || COLORS.white;
    const numberColor = announcementNumberColor(item);
    return `
      <article class="announcement-row" style="background:${escapeAttr(boxColor)};">
        <span class="announcement-number" style="background:${escapeAttr(circleColor)}; color:${escapeAttr(numberColor)};">${String(index + 1).padStart(2, "0")}</span>
        <strong class="announcement-row-title" style="font-family:${escapeAttr(titleStyle.fontFamily)}; font-size:${titleFontSize}; font-weight:${titleStyle.fontWeight}; color:${escapeAttr(titleStyle.textColor)}; text-align:${normalizeTextAlign(titleStyle.textAlign, "left")};">${escapeHtml(item.title)}</strong>
        <p class="announcement-row-detail" style="font-family:${escapeAttr(detailStyle.fontFamily)}; font-size:${detailFontSize}; font-weight:${detailStyle.fontWeight}; color:${escapeAttr(detailStyle.textColor)}; text-align:${normalizeTextAlign(detailStyle.textAlign, "left")};">${escapeHtml(item.detail).replace(/\n/g, "<br>")}</p>
      </article>
    `;
  }

  function announcementNumberColor(item) {
    const circleColor = item.titleStyle?.textColor || COLORS.black;
    const boxColor = item.boxColor || COLORS.white;
    if (normalizeColor(boxColor) === normalizeColor(circleColor)) {
      return normalizeColor(circleColor) === normalizeColor(COLORS.black) ? COLORS.white : COLORS.black;
    }
    return boxColor;
  }

  function announcementFontSize(style, compact) {
    const size = Number(style.fontSize) || 24;
    if (compact) return `${Math.max(5, Math.round(size / 4.8))}px`;
    const cqw = (size / 1020) * 100;
    return `clamp(10px, ${cqw.toFixed(3)}cqw, ${size}px)`;
  }

  function renderCustomSlideContent(slide, compact) {
    if (slide.kind === "custom-content") {
      const titleStyle = slide.customContentTitleStyle || getCustomStyleFallback("customContentTitleStyle");
      const bodyStyle = slide.customContentBodyStyle || getCustomStyleFallback("customContentBodyStyle");
      return `
        <div class="custom-slide-content custom-content-slide ${compact ? "compact" : ""}">
          <h3 style="font-family:${escapeAttr(titleStyle.fontFamily)}; font-size:${customFontSize(titleStyle, compact, 5.1)}; font-weight:${titleStyle.fontWeight}; color:${escapeAttr(titleStyle.textColor)}; text-align:${normalizeTextAlign(titleStyle.textAlign, "center")};">${escapeHtml(slide.customContentTitle)}</h3>
          <div class="custom-content-box">
            <p style="font-family:${escapeAttr(bodyStyle.fontFamily)}; font-size:${customFontSize(bodyStyle, compact, 4.3)}; font-weight:${bodyStyle.fontWeight}; color:${escapeAttr(bodyStyle.textColor)}; text-align:${normalizeTextAlign(bodyStyle.textAlign, "left")};">${escapeHtml(slide.customContentText).replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `;
    }

    const titleStyle = slide.customTitleStyle || getCustomStyleFallback("customTitleStyle");
    const subtitleStyle = slide.customSubtitleStyle || getCustomStyleFallback("customSubtitleStyle");
    return `
      <div class="custom-slide-content custom-title-slide ${compact ? "compact" : ""}">
        <span class="custom-dove" aria-hidden="true"></span>
        <span class="custom-silhouette" aria-hidden="true"></span>
        <div class="custom-title-lockup">
          <div class="custom-title-bracket" style="justify-content:${textAlignToJustify(titleStyle.textAlign, "center")};">
            <span aria-hidden="true">[</span>
            <strong style="font-family:${escapeAttr(titleStyle.fontFamily)}; font-size:${customFontSize(titleStyle, compact, 5.6)}; font-weight:${titleStyle.fontWeight}; color:${escapeAttr(titleStyle.textColor)};">${escapeHtml(slide.customTitle)}</strong>
            <span aria-hidden="true">]</span>
          </div>
          <p style="font-family:${escapeAttr(subtitleStyle.fontFamily)}; font-size:${customFontSize(subtitleStyle, compact, 4.8)}; font-weight:${subtitleStyle.fontWeight}; color:${escapeAttr(subtitleStyle.textColor)}; text-align:${normalizeTextAlign(subtitleStyle.textAlign, "center")};">${escapeHtml(slide.customSubtitle)}</p>
        </div>
      </div>
    `;
  }

  function customFontSize(style, compact, divisor) {
    const size = Number(style.fontSize) || 36;
    if (compact) return `${Math.max(5, Math.round(size / divisor))}px`;
    const cqw = (size / 1020) * 100;
    return `clamp(10px, ${cqw.toFixed(3)}cqw, ${size}px)`;
  }

  function splitModuleIntoSlides(module) {
    if (module.type === "bible") {
      const validation = validateBibleModule(module);
      if (!validation.valid) {
        return [[validation.message]];
      }
    }

    if (module.splitMode === "custom") {
      const groups = module.customText
        .split(/\n\s*\n/g)
        .map((group) => group.split(/\n/g).map((line) => line.trim()).filter(Boolean))
        .filter((group) => group.length);
      return groups.length ? groups : [["직접 입력 내용을 작성하세요."]];
    }

    const lines = getModuleSourceLines(module);
    const size = Number(module.splitMode) || 4;
    const chunks = [];
    for (let index = 0; index < lines.length; index += size) {
      chunks.push(lines.slice(index, index + size));
    }
    return chunks.length ? chunks : [["선택된 내용이 없습니다."]];
  }

  function getModuleSourceLines(module) {
    if (module.type === "praise" || module.type === "hymn") {
      const item = getSelectedSongItem(module);
      return item.lines;
    }

    const validation = validateBibleModule(module);
    if (!validation.valid) return [];

    const testament = DUMMY.bible.testaments[module.testament];
    const book = testament.books[module.book];
    const chapter = book[module.chapter];
    const verseNumbers = Object.keys(chapter).map(Number).sort((a, b) => a - b);
    const start = validation.start || verseNumbers[0];
    const end = validation.end || start;
    return verseNumbers
      .filter((number) => number >= Math.min(start, end) && number <= Math.max(start, end))
      .map((number) => `${number}. ${chapter[number]}`);
  }

  function getSelectedSongItem(module) {
    const list = module.type === "hymn" ? DUMMY.hymn : DUMMY.praise;
    return list.find((entry) => entry.id === module.selectedId) || list[0];
  }

  function getSelectedSlide() {
    return currentSlides.find((slide) => slide.id === state.selectedSlideId) || currentSlides[0];
  }

  function getAnnouncementItems(module) {
    if (!Array.isArray(module.announcements) || !module.announcements.length) {
      module.announcements = [createAnnouncementItem()];
    }
    module.announcements.forEach((item, index) => {
      item.id = item.id || makeId("announcement-item");
      item.title = item.title || `광고 ${index + 1}`;
      item.detail = item.detail || "광고 세부 내용을 입력하세요.";
      item.collapsed = Boolean(item.collapsed);
      item.collapsedSections = item.collapsedSections || {};
      item.boxColor = item.boxColor || COLORS.white;
      item.titleStyle = item.titleStyle || defaultSermonTextStyle(32, 800);
      item.detailStyle = item.detailStyle || defaultSermonTextStyle(22, 400);
    });
    return module.announcements;
  }

  function isSectionCollapsed(target, key) {
    if (!target || !key) return false;
    if (Object.prototype.hasOwnProperty.call(target.collapsedSections || {}, key)) {
      return Boolean(target.collapsedSections[key]);
    }
    return DEFAULT_COLLAPSED_SECTION_KEYS.has(key);
  }

  function toggleSection(target, key) {
    if (!target || !key) return;
    target.collapsedSections = target.collapsedSections || {};
    target.collapsedSections[key] = !isSectionCollapsed(target, key);
  }

  function ensureCustomModule(module) {
    if (!module || module.type !== "custom") return;
    const preset = CUSTOM_CONTENT_PRESETS.find((item) => item.id === module.customPresetId) || CUSTOM_CONTENT_PRESETS[0];
    module.customSlideType = module.customSlideType === "content" ? "content" : "title";
    module.customTitle = module.customTitle || "말씀의 빛 아래로";
    module.customSubtitle = module.customSubtitle || "안녕하세요";
    module.customContentTitle = module.customContentTitle || preset.title;
    module.customContentText = module.customContentText || preset.content;
    module.customPresetId = module.customPresetId || preset.id;
    module.customTitleStyle = module.customTitleStyle || getCustomStyleFallback("customTitleStyle");
    module.customSubtitleStyle = module.customSubtitleStyle || getCustomStyleFallback("customSubtitleStyle");
    module.customContentTitleStyle = module.customContentTitleStyle || getCustomStyleFallback("customContentTitleStyle");
    module.customContentBodyStyle = module.customContentBodyStyle || getCustomStyleFallback("customContentBodyStyle");
  }

  function getCustomStyleFallback(scope) {
    const defaults = {
      customTitleStyle: [64, 700, "center"],
      customSubtitleStyle: [32, 400, "center"],
      customContentTitleStyle: [46, 700, "center"],
      customContentBodyStyle: [38, 400, "left"],
    };
    const [size, weight, textAlign] = defaults[scope] || [36, 400, "left"];
    return defaultSermonTextStyle(size, weight, textAlign);
  }

  function getModuleName(module) {
    if (module.type === "custom") {
      ensureCustomModule(module);
      return module.customSlideType === "content" ? module.customContentTitle : module.customTitle;
    }
    if (module.type === "announcement") {
      return "교회소식";
    }
    if (module.type === "sermon") {
      return module.sermonTitle || "설교";
    }
    if (module.type === "praise") {
      return getListItem(DUMMY.praise, module.selectedId).title;
    }
    if (module.type === "hymn") {
      return getListItem(DUMMY.hymn, module.selectedId).title;
    }
    return `${module.book} ${module.chapter}:${module.verseStart}-${module.verseEnd}`;
  }

  function getModuleSubline(module) {
    if (module.type === "custom") return "커스텀";
    if (module.type === "announcement") return "광고";
    if (module.type === "sermon") return module.sermonSeries || "설교";
    if (module.type === "praise") return "찬양";
    if (module.type === "hymn") return "찬송가";
    return `${module.version} · ${DUMMY.bible.testaments[module.testament]?.label || "성경"}`;
  }

  function getListItem(list, id) {
    return list.find((item) => item.id === id) || list[0];
  }

  function addModule(type, afterId = "") {
    const module = createModule(type);
    const index = afterId ? state.modules.findIndex((item) => item.id === afterId) : -1;
    if (index >= 0) {
      state.modules.splice(index + 1, 0, module);
    } else {
      state.modules.push(module);
    }
    state.selectedModuleId = module.id;
    state.selectedSlideId = `${module.id}-slide-0`;
    render();
    showToast(`${typeLabel(type)} 모듈을 추가했습니다.`);
  }

  function duplicateModule(id) {
    const original = findModule(id);
    if (!original) return;
    const module = {
      ...structuredCloneSafe(original),
      id: makeId(original.type),
      collapsed: false,
      searchResultsOpen: false,
    };
    const index = state.modules.findIndex((item) => item.id === id);
    state.modules.splice(index + 1, 0, module);
    state.selectedModuleId = module.id;
    state.selectedSlideId = `${module.id}-slide-0`;
    render();
    showToast(`${getModuleName(original)} 모듈을 복제했습니다.`);
  }

  function typeLabel(type) {
    return { praise: "찬양", hymn: "찬송가", bible: "성경", sermon: "설교", announcement: "광고", custom: "커스텀" }[type] || "모듈";
  }

  function handleMenuClick(event) {
    const button = event.target.closest("[data-menu]");
    if (!button) return;
    if (button.classList.contains("disabled")) return;
    state.activeMenu = ["builder", "templates", "settings"].includes(button.dataset.menu) ? button.dataset.menu : "builder";
    persistState();
    render();
  }

  function handleSettingsPanelClick(event) {
    const sectionToggle = event.target.closest("[data-toggle-settings-section]");
    if (sectionToggle) {
      state.settingsSections = state.settingsSections || {};
      const key = sectionToggle.dataset.toggleSettingsSection;
      state.settingsSections[key] = !isSettingsSectionCollapsed(key);
      persistState();
      renderSettingsPanel();
      return;
    }

    const aspectButton = event.target.closest("[data-aspect-ratio]");
    if (aspectButton) {
      state.presentationSettings.aspectRatio = aspectButton.dataset.aspectRatio === "4:3" ? "4:3" : "16:9";
      render();
      return;
    }

    const logoEnabledButton = event.target.closest("[data-logo-enabled]");
    if (logoEnabledButton) {
      state.presentationSettings.logoEnabled = logoEnabledButton.dataset.logoEnabled === "true";
      render();
      return;
    }

    const logoDeleteButton = event.target.closest("#logoDeleteBtn");
    if (logoDeleteButton) {
      state.presentationSettings.logoDataUrl = "";
      render();
      showToast("로고를 삭제했습니다.");
      return;
    }

    const positionButton = event.target.closest("[data-logo-position]");
    if (positionButton) {
      state.presentationSettings.logoPosition = positionButton.dataset.logoPosition;
      render();
    }
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.presentationSettings.logoDataUrl = String(reader.result || "");
      state.presentationSettings.logoEnabled = true;
      state.presentationSettings.logoPosition = state.presentationSettings.logoPosition || DEFAULT_LOGO_POSITION;
      event.target.value = "";
      render();
      showToast("로고를 적용했습니다.");
    });
    reader.readAsDataURL(file);
  }

  function handleTemplatePanelClick(event) {
    const back = event.target.closest("[data-template-preview-back]");
    if (back) {
      state.templatePreviewRef = null;
      persistState();
      renderTemplateBrowser();
      return;
    }

    const apply = event.target.closest("[data-template-apply]");
    if (apply) {
      const template = findTemplateByRef(apply.dataset.templateApply, apply.dataset.templateSource);
      if (template) requestTemplateLoad(template);
      return;
    }

    const toggle = event.target.closest("[data-toggle-template-section]");
    if (toggle) {
      state.templateSections = state.templateSections || {};
      const key = toggle.dataset.toggleTemplateSection;
      state.templateSections[key] = !state.templateSections[key];
      persistState();
      renderTemplateBrowser();
      return;
    }

    const remove = event.target.closest("[data-template-delete]");
    if (remove) {
      const template = templates.find((item) => item.id === remove.dataset.templateDelete);
      if (!template) return;
      const ok = window.confirm(`"${template.name}" 템플릿을 삭제할까요?`);
      if (!ok) return;
      templates = templates.filter((item) => item.id !== template.id);
      if (state.currentTemplateId === template.id) {
        state.currentTemplateId = "";
      }
      if (state.templatePreviewRef?.id === template.id) {
        state.templatePreviewRef = null;
      }
      persistTemplates();
      persistState();
      renderTemplateBrowser();
      showToast("템플릿을 삭제했습니다.");
      return;
    }

    const card = event.target.closest("[data-template-card]");
    if (card && !event.target.closest("input")) {
      const template = findTemplateByRef(card.dataset.templateCard, card.dataset.templateSource);
      if (template) openTemplatePreview(template);
    }
  }

  function handleTemplatePanelInput(event) {
    const input = event.target.closest("[data-template-rename]");
    if (!input) return;
    const template = templates.find((item) => item.id === input.dataset.templateRename);
    if (!template) return;
    const name = input.value.trim() || "이름 없는 템플릿";
    template.name = name;
    template.updatedAt = new Date().toISOString();
    template.snapshot.name = name;
    if (state.currentTemplateId === template.id) {
      state.templateName = name;
    }
    persistTemplates();
    persistState();
  }

  function findTemplateByRef(id, source = "") {
    const list = source === "recommended" ? recommendedTemplates : source === "saved" ? templates : [...templates, ...recommendedTemplates];
    return list.find((template) => template.id === id) || null;
  }

  function requestTemplateLoad(template) {
    if (!hasUnsavedWorkspaceChanges()) {
      loadTemplate(template);
      return;
    }

    state.pendingTemplateLoad = {
      id: template.id,
      source: template.source,
    };

    const currentTemplate = getCurrentSavedTemplate();
    if (currentTemplate && !isWorkspaceMatchingTemplate(currentTemplate)) {
      const shouldOverwrite = window.confirm("현재 템플릿에 덮어쓸까요?");
      if (shouldOverwrite) {
        overwriteTemplate(currentTemplate, { renderAfter: false, showToastAfter: false });
        loadPendingTemplateAfterSave();
        return;
      }

      const shouldSaveAsNew = window.confirm("변경된 내용을 새 템플릿으로 저장할까요?");
      if (!shouldSaveAsNew) {
        loadPendingTemplateAfterSave();
        return;
      }
    } else {
      const shouldSave = window.confirm("현재 작업을 저장하시겠습니까?");
      if (!shouldSave) {
        loadPendingTemplateAfterSave();
        return;
      }
    }

    state.pendingAction = "save-before-template-load";
    if (!auth.loggedIn) {
      state.view = "login";
      persistState();
      render();
      return;
    }
    persistState();
    openTemplateModal();
  }

  function loadTemplate(template) {
    const snapshot = template.snapshot;
    if (!snapshot || !Array.isArray(snapshot.modules)) return;
    state.modules = structuredCloneSafe(snapshot.modules);
    state.templateName = template.name || snapshot.name || "새로운 템플릿";
    state.currentTemplateId = template.source === "saved" ? template.id : "";
    state.presentationSettings = {
      ...defaultPresentationSettings(),
      ...(snapshot.presentationSettings && typeof snapshot.presentationSettings === "object" ? snapshot.presentationSettings : {}),
    };
    state.selectedModuleId = snapshot.selectedModuleId || state.modules[0]?.id || "";
    state.selectedSlideId = snapshot.selectedSlideId || (state.selectedModuleId ? `${state.selectedModuleId}-slide-0` : "");
    state.activeMenu = "builder";
    state.pendingAction = null;
    state.pendingTemplateLoad = null;
    state.templatePreviewRef = null;
    persistState();
    render();
    showToast("템플릿을 불러왔습니다.");
  }

  function loadPendingTemplateAfterSave() {
    const pending = state.pendingTemplateLoad;
    if (!pending) return false;
    const template = findTemplateByRef(pending.id, pending.source);
    state.pendingAction = null;
    state.pendingTemplateLoad = null;
    if (!template) {
      persistState();
      showToast("불러올 템플릿을 찾을 수 없습니다.");
      return true;
    }
    loadTemplate(template);
    return true;
  }

  function hasUnsavedWorkspaceChanges() {
    const currentTemplate = getCurrentSavedTemplate();
    if (currentTemplate) {
      return !isWorkspaceMatchingTemplate(currentTemplate);
    }
    return !isWorkspaceAtDefaultState();
  }

  function isWorkspaceMatchingTemplate(template) {
    const snapshot = template?.snapshot;
    if (!snapshot || !Array.isArray(snapshot.modules)) return false;
    const currentComparable = {
      modules: state.modules,
      presentationSettings: getPresentationSettings(),
    };
    const templateComparable = {
      modules: snapshot.modules,
      presentationSettings: {
        ...defaultPresentationSettings(),
        ...(snapshot.presentationSettings && typeof snapshot.presentationSettings === "object" ? snapshot.presentationSettings : {}),
      },
    };
    return stableStringifyForTemplateCompare(currentComparable) === stableStringifyForTemplateCompare(templateComparable);
  }

  function isWorkspaceAtDefaultState() {
    const defaultState = makeDefaultState();
    if (stableStringifyForTemplateCompare(getPresentationSettings()) !== stableStringifyForTemplateCompare(defaultState.presentationSettings)) {
      return false;
    }
    if (state.modules.length !== defaultState.modules.length) return false;
    return state.modules.every((module, index) => isModuleAtDefaultState(module, defaultState.modules[index]));
  }

  function isModuleAtDefaultState(module, defaultModule) {
    if (!module || !defaultModule || module.type !== defaultModule.type) return false;
    const comparableKeys = Object.keys(defaultModule).filter((key) => !["id", "collapsed", "collapsedSections", "searchResultsOpen"].includes(key));
    return comparableKeys.every((key) => stableStringifyForTemplateCompare(module[key]) === stableStringifyForTemplateCompare(defaultModule[key]));
  }

  function stableStringifyForTemplateCompare(value) {
    return JSON.stringify(stripTemplateRuntimeValues(value));
  }

  function stripTemplateRuntimeValues(value) {
    if (Array.isArray(value)) {
      return value.map(stripTemplateRuntimeValues);
    }
    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce((result, key) => {
          if (["id", "collapsed", "collapsedSections", "searchResultsOpen"].includes(key)) return result;
          result[key] = stripTemplateRuntimeValues(value[key]);
          return result;
        }, {});
    }
    return value;
  }

  function handleModuleClick(event) {
    const selectModule = event.target.closest("[data-select-module]");
    if (selectModule) {
      state.selectedModuleId = selectModule.dataset.selectModule;
      const firstSlide = currentSlides.find((slide) => slide.moduleId === state.selectedModuleId);
      state.selectedSlideId = firstSlide?.id || "";
      render();
      return;
    }

    const toggle = event.target.closest("[data-toggle-module]");
    if (toggle) {
      const module = findModule(toggle.dataset.toggleModule);
      if (!module) return;
      module.collapsed = !module.collapsed;
      render();
      return;
    }

    const moduleSection = event.target.closest("[data-toggle-module-section]");
    if (moduleSection) {
      const module = findModule(moduleSection.dataset.moduleId);
      if (!module) return;
      toggleSection(module, moduleSection.dataset.sectionKey);
      state.selectedModuleId = module.id;
      render();
      return;
    }

    const duplicate = event.target.closest("[data-duplicate-module]");
    if (duplicate) {
      duplicateModule(duplicate.dataset.duplicateModule);
      return;
    }

    const remove = event.target.closest("[data-delete-module]");
    if (remove) {
      deleteModule(remove.dataset.deleteModule);
      return;
    }

    const toggleAnnouncementItem = event.target.closest("[data-toggle-announcement-item]");
    if (toggleAnnouncementItem) {
      const module = findModule(toggleAnnouncementItem.dataset.moduleId);
      const item = findAnnouncementItem(module, toggleAnnouncementItem.dataset.toggleAnnouncementItem);
      if (!module || !item) return;
      item.collapsed = !item.collapsed;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const announcementSection = event.target.closest("[data-toggle-announcement-section]");
    if (announcementSection) {
      const module = findModule(announcementSection.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementSection.dataset.announcementId);
      if (!module || !item) return;
      toggleSection(item, announcementSection.dataset.sectionKey);
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const addAnnouncement = event.target.closest("[data-add-announcement]");
    if (addAnnouncement) {
      const module = findModule(addAnnouncement.dataset.addAnnouncement);
      if (!module) return;
      getAnnouncementItems(module).push(createAnnouncementItem(`광고 ${module.announcements.length + 1}`, "광고 세부 내용을 입력하세요."));
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const deleteAnnouncement = event.target.closest("[data-delete-announcement]");
    if (deleteAnnouncement) {
      const module = findModule(deleteAnnouncement.dataset.moduleId);
      if (!module) return;
      module.announcements = getAnnouncementItems(module).filter((item) => item.id !== deleteAnnouncement.dataset.deleteAnnouncement);
      if (!module.announcements.length) {
        module.announcements = [createAnnouncementItem()];
      }
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const customSlideType = event.target.closest("[data-custom-slide-type]");
    if (customSlideType) {
      const module = findModule(customSlideType.dataset.moduleId);
      if (!module) return;
      ensureCustomModule(module);
      module.customSlideType = customSlideType.dataset.customSlideType === "content" ? "content" : "title";
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const customPreset = event.target.closest("[data-custom-preset]");
    if (customPreset) {
      const module = findModule(customPreset.dataset.moduleId);
      if (!module) return;
      const preset = CUSTOM_CONTENT_PRESETS.find((item) => item.id === customPreset.dataset.customPreset);
      if (!preset) return;
      ensureCustomModule(module);
      module.customSlideType = "content";
      module.customPresetId = preset.id;
      module.customContentTitle = preset.title;
      module.customContentText = preset.content;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const item = event.target.closest("[data-select-item]");
    if (item) {
      const module = findModule(item.dataset.moduleId);
      if (!module) return;
      module.selectedId = item.dataset.selectItem;
      const list = module.type === "praise" ? DUMMY.praise : module.type === "hymn" ? DUMMY.hymn : [];
      const selectedItem = list.find((entry) => entry.id === module.selectedId);
      if ((module.type === "praise" || module.type === "hymn") && selectedItem) {
        module.searchQuery = selectedItem.title;
        module.searchResultsOpen = false;
      }
      state.selectedModuleId = module.id;
      state.selectedSlideId = "";
      render();
      return;
    }

    const split = event.target.closest("[data-split-mode]");
    if (split) {
      const module = findModule(split.dataset.moduleId);
      if (!module) return;
      module.splitMode = split.dataset.splitMode;
      if (module.splitMode === "custom") {
        ensureCustomText(module);
      }
      state.selectedModuleId = module.id;
      state.selectedSlideId = "";
      render();
      return;
    }

    const testament = event.target.closest("[data-testament]");
    if (testament) {
      const module = findModule(testament.dataset.moduleId);
      if (!module) return;
      module.testament = testament.dataset.testament;
      const firstBook = Object.keys(DUMMY.bible.testaments[module.testament].books)[0];
      module.book = firstBook;
      module.chapter = Object.keys(DUMMY.bible.testaments[module.testament].books[firstBook])[0];
      module.verseStart = 1;
      module.verseEnd = 4;
      module.verseRangeInput = "1-4";
      state.selectedModuleId = module.id;
      state.selectedSlideId = "";
      render();
      return;
    }

    const background = event.target.closest("[data-background]");
    if (background) {
      const module = findModule(background.dataset.moduleId);
      if (!module) return;
      module.style.background = background.dataset.background;
      render();
      return;
    }

    const textColor = event.target.closest("[data-text-color]");
    if (textColor) {
      const module = findModule(textColor.dataset.moduleId);
      if (!module) return;
      module.style.textColor = textColor.dataset.textColor;
      render();
      return;
    }

    const textAlign = event.target.closest("[data-text-align]");
    if (textAlign) {
      const module = findModule(textAlign.dataset.moduleId);
      if (!module) return;
      module.style.textAlign = normalizeTextAlign(textAlign.dataset.textAlign, "center");
      state.selectedModuleId = module.id;
      state.selectedSlideId = currentSlides.find((slide) => slide.moduleId === module.id)?.id || "";
      render();
      return;
    }

    const sermonTextColor = event.target.closest("[data-sermon-text-color]");
    if (sermonTextColor) {
      const module = findModule(sermonTextColor.dataset.moduleId);
      if (!module) return;
      const scope = sermonTextColor.dataset.sermonStyleScope;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(64, 800) : defaultSermonTextStyle(34, 500);
      module[scope] = module[scope] || fallback;
      module[scope].textColor = sermonTextColor.dataset.sermonTextColor;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const sermonTextAlign = event.target.closest("[data-sermon-text-align]");
    if (sermonTextAlign) {
      const module = findModule(sermonTextAlign.dataset.moduleId);
      if (!module) return;
      const scope = sermonTextAlign.dataset.sermonStyleScope;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(64, 800) : defaultSermonTextStyle(34, 500);
      module[scope] = module[scope] || fallback;
      module[scope].textAlign = normalizeTextAlign(sermonTextAlign.dataset.sermonTextAlign, "left");
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const customTextColor = event.target.closest("[data-custom-text-color]");
    if (customTextColor) {
      const module = findModule(customTextColor.dataset.moduleId);
      if (!module) return;
      ensureCustomModule(module);
      const scope = customTextColor.dataset.customStyleScope;
      module[scope] = module[scope] || getCustomStyleFallback(scope);
      module[scope].textColor = customTextColor.dataset.customTextColor;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const customTextAlign = event.target.closest("[data-custom-text-align]");
    if (customTextAlign) {
      const module = findModule(customTextAlign.dataset.moduleId);
      if (!module) return;
      ensureCustomModule(module);
      const scope = customTextAlign.dataset.customStyleScope;
      module[scope] = module[scope] || getCustomStyleFallback(scope);
      module[scope].textAlign = normalizeTextAlign(customTextAlign.dataset.customTextAlign, customDefaultAlign(scope));
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const announcementTextColor = event.target.closest("[data-ad-text-color]");
    if (announcementTextColor) {
      const module = findModule(announcementTextColor.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementTextColor.dataset.announcementId);
      if (!module || !item) return;
      const scope = announcementTextColor.dataset.adStyleScope;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(32, 800) : defaultSermonTextStyle(22, 400);
      item[scope] = item[scope] || fallback;
      item[scope].textColor = announcementTextColor.dataset.adTextColor;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const announcementTextAlign = event.target.closest("[data-ad-text-align]");
    if (announcementTextAlign) {
      const module = findModule(announcementTextAlign.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementTextAlign.dataset.announcementId);
      if (!module || !item) return;
      const scope = announcementTextAlign.dataset.adStyleScope;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(32, 800) : defaultSermonTextStyle(22, 400);
      item[scope] = item[scope] || fallback;
      item[scope].textAlign = normalizeTextAlign(announcementTextAlign.dataset.adTextAlign, "left");
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const announcementBoxColor = event.target.closest("[data-ad-box-color]");
    if (announcementBoxColor) {
      const module = findModule(announcementBoxColor.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementBoxColor.dataset.announcementId);
      if (!module || !item) return;
      item.boxColor = announcementBoxColor.dataset.adBoxColor;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const renderOnly = event.target.closest("[data-render-only]");
    if (renderOnly) {
      const input = document.getElementById(`search-${renderOnly.dataset.renderOnly}`);
      const module = findModule(renderOnly.dataset.renderOnly);
      if (module && input) {
        module.searchQuery = input.value;
        module.searchResultsOpen = true;
        render();
      }
    }
  }

  function handleModuleInput(event) {
    const customModuleField = event.target.closest("[data-custom-field]");
    if (customModuleField) {
      const module = findModule(customModuleField.dataset.moduleId);
      if (!module) return;
      ensureCustomModule(module);
      module[customModuleField.dataset.customField] = customModuleField.value;
      if (customModuleField.dataset.customField === "customContentTitle" || customModuleField.dataset.customField === "customContentText") {
        module.customPresetId = "";
      }
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      refreshSlidesAfterInlineEdit(module);
      return;
    }

    const announcementField = event.target.closest("[data-ad-field]");
    if (announcementField) {
      const module = findModule(announcementField.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementField.dataset.announcementId);
      if (!module || !item) return;
      item[announcementField.dataset.adField] = announcementField.value;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      refreshSlidesAfterInlineEdit(module);
      return;
    }

    const sermonTextField = event.target.closest('[data-module-field="sermonTitle"], [data-module-field="sermonSeries"]');
    if (sermonTextField) {
      const module = findModule(sermonTextField.dataset.moduleId);
      if (!module) return;
      module[sermonTextField.dataset.moduleField] = sermonTextField.value;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      refreshSlidesAfterInlineEdit(module);
      return;
    }

    const searchField = event.target.closest('[data-module-field="searchQuery"]');
    if (searchField) {
      const module = findModule(searchField.dataset.moduleId);
      if (!module) return;
      module.searchQuery = searchField.value;
      module.searchResultsOpen = Boolean(module.searchQuery.trim());
      persistState();

      const list = module.type === "praise" ? DUMMY.praise : module.type === "hymn" ? DUMMY.hymn : null;
      const resultList = els.moduleList.querySelector(`[data-result-list="${module.id}"]`);
      if (list && resultList) {
        resultList.innerHTML = renderSongResultItems(module, list);
        resultList.classList.toggle("is-open", Boolean(module.searchQuery.trim()) && module.searchResultsOpen !== false);
      }
      return;
    }

    const customField = event.target.closest('[data-module-field="customText"]');
    if (!customField) return;

    const module = findModule(customField.dataset.moduleId);
    if (!module) return;
    module.customText = customField.value;
    state.selectedModuleId = module.id;
    state.selectedSlideId = "";
    refreshSlidesAfterInlineEdit(module);
  }

  function ensureCustomText(module) {
    if (!(module.type === "praise" || module.type === "bible")) return;
    if (module.customText.trim()) return;
    module.customText = getModuleSourceLines(module).join("\n");
  }

  function refreshSlidesAfterInlineEdit(module) {
    currentSlides = buildSlides();
    syncSelection();
    els.projectSummary.textContent = `${state.modules.length}개 모듈 · ${currentSlides.length}장`;
    const chip = els.moduleList.querySelector(`[data-module-id="${module.id}"] .module-slide-chip`);
    if (chip) {
      chip.textContent = `${currentSlides.filter((slide) => slide.moduleId === module.id).length}장`;
    }
    renderPreview();
    renderThumbnails();
    persistState();
  }

  function handleModuleChange(event) {
    const backgroundUpload = event.target.closest("[data-background-upload]");
    if (backgroundUpload) {
      const module = findModule(backgroundUpload.dataset.moduleId);
      const file = backgroundUpload.files?.[0];
      if (!module || !file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        module.style.background = String(reader.result || COLORS.black);
        state.selectedModuleId = module.id;
        state.selectedSlideId = "";
        render();
        showToast("배경 이미지를 적용했습니다.");
      });
      reader.readAsDataURL(file);
      return;
    }

    const field = event.target.closest("[data-module-field]");
    if (field) {
      const module = findModule(field.dataset.moduleId);
      if (!module) return;
      if (field.dataset.moduleField === "searchQuery") {
        module.searchQuery = field.value;
        persistState();
        return;
      }
      if (field.dataset.moduleField === "customText") {
        module.customText = field.value;
        persistState();
        return;
      }
      module[field.dataset.moduleField] = field.value;
      if (field.dataset.moduleField === "book") {
        const book = DUMMY.bible.testaments[module.testament].books[module.book];
        module.chapter = Object.keys(book)[0];
        module.verseStart = 1;
        module.verseEnd = 4;
        module.verseRangeInput = "1-4";
      }
      if (field.dataset.moduleField === "chapter") {
        module.verseStart = 1;
        module.verseEnd = 4;
        module.verseRangeInput = "1-4";
      }
      state.selectedModuleId = module.id;
      state.selectedSlideId = "";
      render();
      return;
    }

    const sermonStyleField = event.target.closest("[data-sermon-style-field]");
    if (sermonStyleField) {
      const module = findModule(sermonStyleField.dataset.moduleId);
      if (!module) return;
      const scope = sermonStyleField.dataset.sermonStyleScope;
      const key = sermonStyleField.dataset.sermonStyleField;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(64, 800) : defaultSermonTextStyle(34, 500);
      module[scope] = module[scope] || fallback;
      module[scope][key] = key === "fontSize" || key === "fontWeight" ? Number(sermonStyleField.value) : sermonStyleField.value;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const announcementStyleField = event.target.closest("[data-ad-style-field]");
    if (announcementStyleField) {
      const module = findModule(announcementStyleField.dataset.moduleId);
      const item = findAnnouncementItem(module, announcementStyleField.dataset.announcementId);
      if (!module || !item) return;
      const scope = announcementStyleField.dataset.adStyleScope;
      const key = announcementStyleField.dataset.adStyleField;
      const fallback = scope === "titleStyle" ? defaultSermonTextStyle(32, 800) : defaultSermonTextStyle(22, 400);
      item[scope] = item[scope] || fallback;
      item[scope][key] = key === "fontSize" || key === "fontWeight" ? Number(announcementStyleField.value) : announcementStyleField.value;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-1`;
      render();
      return;
    }

    const customStyleField = event.target.closest("[data-custom-style-field]");
    if (customStyleField) {
      const module = findModule(customStyleField.dataset.moduleId);
      if (!module) return;
      ensureCustomModule(module);
      const scope = customStyleField.dataset.customStyleScope;
      const key = customStyleField.dataset.customStyleField;
      module[scope] = module[scope] || getCustomStyleFallback(scope);
      module[scope][key] = key === "fontSize" || key === "fontWeight" ? Number(customStyleField.value) : customStyleField.value;
      state.selectedModuleId = module.id;
      state.selectedSlideId = `${module.id}-slide-0`;
      render();
      return;
    }

    const styleField = event.target.closest("[data-style-field]");
    if (styleField) {
      const module = findModule(styleField.dataset.moduleId);
      if (!module) return;
      const key = styleField.dataset.styleField;
      module.style[key] = key === "fontSize" || key === "fontWeight" || key === "lineHeight" || key === "letterSpacing" ? Number(styleField.value) : styleField.value;
      state.selectedModuleId = module.id;
      render();
      return;
    }

    const verseRange = event.target.closest("[data-verse-range]");
    if (verseRange) {
      const module = findModule(verseRange.dataset.verseRange);
      if (!module) return;
      module.verseRangeInput = verseRange.value.trim();
      const parts = verseRange.value.match(/\d+/g) || [];
      module.verseStart = parts.length ? Number(parts[0]) : NaN;
      module.verseEnd = parts.length ? Number(parts[1] || parts[0]) : NaN;
      state.selectedModuleId = module.id;
      state.selectedSlideId = "";
      render();
    }
  }

  function deleteModule(id) {
    const module = findModule(id);
    if (!module) return;
    const ok = window.confirm(`${getModuleName(module)} 모듈을 삭제할까요?`);
    if (!ok) return;
    state.modules = state.modules.filter((item) => item.id !== id);
    state.selectedSlideId = "";
    render();
  }

  function findModule(id) {
    return state.modules.find((module) => module.id === id);
  }

  function findAnnouncementItem(module, id) {
    if (!module || module.type !== "announcement") return null;
    return getAnnouncementItems(module).find((item) => item.id === id) || null;
  }

  function handleDragStart(event) {
    const card = event.target.closest(".module-card");
    if (!card) return;
    draggingModuleId = card.dataset.moduleId;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggingModuleId);
  }

  function handleDragEnd(event) {
    const card = event.target.closest(".module-card");
    if (card) card.classList.remove("dragging");
    draggingModuleId = null;
  }

  function handleDragOver(event) {
    if (!draggingModuleId) return;
    event.preventDefault();
    autoScrollModuleList(event.clientY);
    event.dataTransfer.dropEffect = "move";
  }

  function autoScrollModuleList(pointerY) {
    const scroller = els.moduleList;
    if (!scroller) return;

    const rect = scroller.getBoundingClientRect();
    const threshold = 76;
    const maxStep = 22;

    if (pointerY < rect.top + threshold) {
      const ratio = Math.max(0, Math.min(1, (rect.top + threshold - pointerY) / threshold));
      scroller.scrollTop -= Math.ceil(maxStep * ratio);
    } else if (pointerY > rect.bottom - threshold) {
      const ratio = Math.max(0, Math.min(1, (pointerY - (rect.bottom - threshold)) / threshold));
      scroller.scrollTop += Math.ceil(maxStep * ratio);
    }
  }

  function handleDrop(event) {
    const card = event.target.closest(".module-card");
    if (!card || !draggingModuleId) return;
    event.preventDefault();
    const sourceIndex = state.modules.findIndex((module) => module.id === draggingModuleId);
    const targetIndex = state.modules.findIndex((module) => module.id === card.dataset.moduleId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

    const [moved] = state.modules.splice(sourceIndex, 1);
    const rect = card.getBoundingClientRect();
    const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
    const adjustedTarget = state.modules.findIndex((module) => module.id === card.dataset.moduleId);
    state.modules.splice(adjustedTarget + (shouldInsertAfter ? 1 : 0), 0, moved);
    state.selectedModuleId = moved.id;
    state.selectedSlideId = "";
    render();
  }

  function requireAuth(action) {
    if (auth.loggedIn) {
      if (action === "save") beginTemplateSaveFlow();
      if (action === "ppt") downloadPpt();
      if (action === "share") openShareModal();
      return;
    }
    state.view = "login";
    state.pendingAction = action;
    persistState();
    render();
  }

  function handleAuthAction() {
    if (!auth.loggedIn) {
      state.view = "login";
      state.pendingAction = null;
      state.pendingTemplateLoad = null;
      persistState();
      render();
      return;
    }

    auth = { loggedIn: false, email: "" };
    templates = [];
    state.view = "editor";
    state.pendingAction = null;
    state.pendingTemplateLoad = null;
    state.templatePreviewRef = null;
    state.currentTemplateId = "";
    persistAuth();
    persistState();
    render();
    showToast("로그아웃되었습니다.");
  }

  function beginTemplateSaveFlow() {
    const currentTemplate = getCurrentSavedTemplate();
    if (currentTemplate) {
      const shouldOverwrite = window.confirm(`"${currentTemplate.name}" 템플릿에 덮어쓸까요?`);
      if (shouldOverwrite) {
        overwriteTemplate(currentTemplate);
        return;
      }
    }
    openTemplateModal();
  }

  function getCurrentSavedTemplate() {
    return templates.find((template) => template.source === "saved" && template.id === state.currentTemplateId) || null;
  }

  function openTemplateModal() {
    els.templateNameInput.value = state.templateName || "새로운 템플릿";
    els.templateModal.classList.remove("hidden");
    els.templateNameInput.focus();
    els.templateNameInput.select();
  }

  function closeTemplateModal() {
    els.templateModal.classList.add("hidden");
    if (state.pendingAction === "save-before-template-load" || state.pendingAction === "reset-after-save" || state.pendingTemplateLoad) {
      state.pendingAction = null;
      state.pendingTemplateLoad = null;
      persistState();
    }
  }

  function saveTemplateFromModal() {
    const name = createUniqueTemplateName(els.templateNameInput.value.trim() || "이름 없는 템플릿");
    const template = createTemplateRecord({
      name,
      source: "saved",
      snapshot: createTemplateSnapshot(name),
    });
    templates.unshift(template);
    state.templateName = name;
    state.currentTemplateId = template.id;
    persistTemplates();
    persistState();
    els.templateModal.classList.add("hidden");
    if (state.pendingAction === "reset-after-save") {
      state.pendingAction = null;
      persistState();
      if (confirmResetDemo()) return;
      render();
      showToast("템플릿을 저장했습니다.");
      return;
    }
    if (loadPendingTemplateAfterSave()) return;
    render();
    showToast("템플릿을 저장했습니다.");
  }

  function openShareModal() {
    currentSlides = buildSlides();
    els.shareTemplateName.textContent = state.templateName || "새로운 템플릿";
    els.shareTemplateMeta.textContent = `${state.modules.length}개 모듈 · ${currentSlides.length}장`;
    els.shareLinkInput.value = `https://city-light-ppt.local/share/${encodeURIComponent(state.currentTemplateId || "demo")}`;
    els.shareModal.classList.remove("hidden");
    els.shareLinkInput.focus();
    els.shareLinkInput.select();
  }

  function closeShareModal() {
    els.shareModal.classList.add("hidden");
  }

  function copyShareLink() {
    els.shareLinkInput.select();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(els.shareLinkInput.value).catch(() => {});
    }
    showToast("공유 링크를 복사했습니다.");
  }

  function overwriteTemplate(template, options = {}) {
    const name = createUniqueTemplateName(state.templateName || template.name || "새로운 템플릿", template.id);
    const nextTemplate = createTemplateRecord({
      id: template.id,
      name,
      source: "saved",
      snapshot: createTemplateSnapshot(name),
      createdAt: template.createdAt,
      meta: template.meta || {},
    });
    const index = templates.findIndex((item) => item.id === template.id);
    if (index >= 0) {
      templates.splice(index, 1, nextTemplate);
    } else {
      templates.unshift(nextTemplate);
    }
    state.templateName = name;
    state.currentTemplateId = nextTemplate.id;
    persistTemplates();
    persistState();
    if (options.renderAfter !== false) {
      render();
    }
    if (options.showToastAfter !== false) {
      showToast("템플릿을 덮어썼습니다.");
    }
  }

  function createUniqueTemplateName(baseName, ignoreId = "") {
    const name = baseName.trim() || "이름 없는 템플릿";
    const existingNames = new Set(
      templates
        .filter((template) => template.source === "saved" && template.id !== ignoreId)
        .map((template) => template.name)
    );
    if (!existingNames.has(name)) return name;
    let index = 1;
    let nextName = `${name} (${index})`;
    while (existingNames.has(nextName)) {
      index += 1;
      nextName = `${name} (${index})`;
    }
    return nextName;
  }

  function resetDemo() {
    const currentTemplate = getCurrentSavedTemplate();
    if (currentTemplate && !isWorkspaceMatchingTemplate(currentTemplate)) {
      const shouldOverwrite = window.confirm("초기화 전에 현재 템플릿에 덮어쓸까요?");
      if (shouldOverwrite) {
        overwriteTemplate(currentTemplate, { renderAfter: false, showToastAfter: false });
        confirmResetDemo();
        return;
      }

      const shouldSaveAsNew = window.confirm("변경된 내용을 새 템플릿으로 저장할까요?");
      if (shouldSaveAsNew) {
        state.pendingAction = "reset-after-save";
        persistState();
        openTemplateModal();
        return;
      }
    }

    confirmResetDemo();
  }

  function confirmResetDemo() {
    const ok = window.confirm("현재 작업을 초기 샘플로 되돌릴까요?");
    if (!ok) return false;
    state = makeDefaultState();
    persistState();
    render();
    showToast("초기 샘플로 되돌렸습니다.");
    return true;
  }

  function downloadPpt() {
    const invalidBible = state.modules.find((module) => module.type === "bible" && !validateBibleModule(module).valid);
    if (invalidBible) {
      const validation = validateBibleModule(invalidBible);
      state.selectedModuleId = invalidBible.id;
      const firstSlide = currentSlides.find((slide) => slide.moduleId === invalidBible.id);
      state.selectedSlideId = firstSlide?.id || "";
      render();
      showToast(`성경 범위를 확인하세요: ${validation.message}`);
      return;
    }

    const slides = buildSlides();
    if (!slides.length) {
      showToast("생성할 슬라이드가 없습니다.");
      return;
    }
    const blob = createPptxBlob(slides);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `worship-ppt-${dateStamp()}.pptx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("PPT 파일을 생성했습니다.");
  }

  function createPptxBlob(slides) {
    const files = {};
    const presentationSettings = getPresentationSettings();
    const logoAsset = presentationSettings.logoEnabled ? dataUrlToImageAsset(presentationSettings.logoDataUrl, "global-logo") : null;
    const slideImages = slides.map((slide, index) => {
      const slideNumber = index + 1;
      return {
        background: dataUrlToImageAsset(slide.style.background, `background-${slideNumber}`),
        content: dataUrlToImageAsset(slide.imageDataUrl, `slide-image-${slideNumber}`),
      };
    });
    const imageAssets = [...slideImages.flatMap((images) => [images.background, images.content].filter(Boolean)), logoAsset].filter(Boolean);
    files["[Content_Types].xml"] = contentTypesXml(slides.length, imageAssets);
    files["_rels/.rels"] = rootRelsXml();
    files["docProps/app.xml"] = appPropsXml(slides.length);
    files["docProps/core.xml"] = corePropsXml();
    files["ppt/presentation.xml"] = presentationXml(slides.length);
    files["ppt/_rels/presentation.xml.rels"] = presentationRelsXml(slides.length);
    files["ppt/slideMasters/slideMaster1.xml"] = slideMasterXml();
    files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = slideMasterRelsXml();
    files["ppt/slideLayouts/slideLayout1.xml"] = slideLayoutXml();
    files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = slideLayoutRelsXml();
    files["ppt/theme/theme1.xml"] = themeXml();
    if (logoAsset) {
      files[`ppt/media/${logoAsset.name}`] = logoAsset.bytes;
    }
    slides.forEach((slide, index) => {
      const images = slideImages[index];
      const relationships = [];
      let relationshipIndex = 2;
      const addImageRelationship = (asset) => {
        if (!asset) return "";
        files[`ppt/media/${asset.name}`] = asset.bytes;
        const id = `rId${relationshipIndex}`;
        relationshipIndex += 1;
        relationships.push({ id, target: asset.name });
        return id;
      };
      const imageRels = {
        background: addImageRelationship(images.background),
        logo: addImageRelationship(logoAsset),
        content: addImageRelationship(images.content),
      };
      files[`ppt/slides/slide${index + 1}.xml`] = slideXml(slide, index + 1, imageRels);
      files[`ppt/slides/_rels/slide${index + 1}.xml.rels`] = slideRelsXml(relationships);
    });
    return zipBlob(files, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  }

  function contentTypesXml(slideCount, imageAssets = []) {
    const slideOverrides = Array.from({ length: slideCount }, (_item, index) => {
      return `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    }).join("");
    const imageDefaults = Array.from(new Map(imageAssets.map((asset) => [asset.extension, asset.contentType])))
      .map(([extension, contentType]) => `<Default Extension="${extension}" ContentType="${contentType}"/>`)
      .join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${imageDefaults}
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  ${slideOverrides}
</Types>`;
  }

  function rootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  }

  function presentationXml(slideCount) {
    const metrics = pptSlideMetrics();
    const ids = Array.from({ length: slideCount }, (_item, index) => {
      return `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${ids}</p:sldIdLst>
  <p:sldSz cx="${metrics.width}" cy="${metrics.height}" type="${metrics.type}"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>`;
  }

  function pptSlideMetrics() {
    const settings = getPresentationSettings();
    if (settings.aspectRatio === "4:3") {
      return { width: 9144000, height: 6858000, type: "screen4x3", aspect: "4:3" };
    }
    return { width: 12192000, height: 6858000, type: "wide", aspect: "16:9" };
  }

  function presentationRelsXml(slideCount) {
    const slideRels = Array.from({ length: slideCount }, (_item, index) => {
      return `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slideRels}
</Relationships>`;
  }

  function slideXml(slide, index, imageRels = {}) {
    const background = pptBackgroundColor(slide.style.background);
    const paragraphs = slide.lines.map((line) => paragraphXml(line, slide.style)).join("");
    const contentShape =
      slide.kind === "hymn-image"
        ? imageContentXml(imageRels.content, index)
        : slide.kind === "sermon"
          ? sermonContentXml(slide, index)
        : slide.kind === "announcement-cover" || slide.kind === "announcement-list"
          ? announcementContentXml(slide, index)
        : slide.kind === "custom-title" || slide.kind === "custom-content"
          ? customContentXml(slide, index)
        : textContentXml(paragraphs, index);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${background}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      ${groupShapeXml()}
      ${imageRels.background ? imageBackgroundXml(imageRels.background, index) : ""}
      ${imageRels.logo ? logoImageXml(imageRels.logo, index) : ""}
      ${contentShape}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
  }

  function textContentXml(paragraphs, index) {
    const metrics = pptSlideMetrics();
    const x = Math.round(metrics.width * 0.075);
    const y = Math.round(metrics.height * 0.187);
    const width = Math.round(metrics.width * 0.85);
    const height = Math.round(metrics.height * 0.627);
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${index + 1}" name="Content ${index}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" anchor="ctr" rtlCol="0"><a:spAutoFit/></a:bodyPr>
          <a:lstStyle/>
          ${paragraphs}
        </p:txBody>
      </p:sp>`;
  }

  function paragraphXml(text, style) {
    const color = hexNoHash(style.textColor);
    const size = Math.round(Number(style.fontSize || 44) * 100);
    const bold = Number(style.fontWeight) >= 700 ? "1" : "0";
    const font = escapeXml(style.fontFamily || "Malgun Gothic");
    const lineHeight = Math.round(Number(style.lineHeight || 1.18) * 100000);
    const letterSpacing = Math.round(Number(style.letterSpacing || 0) * 1000);
    const align = textAlignToPpt(style.textAlign, "center");
    return `<a:p>
  <a:pPr algn="${align}"><a:lnSpc><a:spcPct val="${lineHeight}"/></a:lnSpc></a:pPr>
  <a:r>
    <a:rPr lang="ko-KR" sz="${size}" b="${bold}" spc="${letterSpacing}" dirty="0">
      <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
      <a:latin typeface="${font}"/><a:ea typeface="${font}"/><a:cs typeface="${font}"/>
    </a:rPr>
    <a:t>${escapeXml(text || " ")}</a:t>
  </a:r>
  <a:endParaRPr lang="ko-KR" sz="${size}" dirty="0"/>
</a:p>`;
  }

  function sermonContentXml(slide, index) {
    return `
      <p:sp>
        <p:nvSpPr><p:cNvPr id="${300 + index}" name="Sermon Divider ${index}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="876300" y="2870200"/><a:ext cx="38100" cy="1691640"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="000000"/></a:solidFill>
          <a:ln><a:noFill/></a:ln>
        </p:spPr>
      </p:sp>
      ${sermonTextBoxXml(slide.sermonSeries, slide.seriesStyle, index + 400, "Sermon Series", 3340000, 2286000, 5200000, 762000)}
      ${sermonTextBoxXml(slide.sermonTitle, slide.titleStyle, index + 500, "Sermon Title", 3657600, 3162300, 5200000, 914400)}
    `;
  }

  function sermonTextBoxXml(text, style, id, name, x, y, width, height) {
    const color = hexNoHash(style.textColor || "#000000");
    const size = Math.round(Number(style.fontSize || 44) * 100);
    const bold = Number(style.fontWeight) >= 700 ? "1" : "0";
    const font = escapeXml(style.fontFamily || "Georgia");
    const align = textAlignToPpt(style.textAlign, "left");
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" anchor="ctr" rtlCol="0"><a:spAutoFit/></a:bodyPr>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="${align}"/>
            <a:r>
              <a:rPr lang="ko-KR" sz="${size}" b="${bold}" dirty="0">
                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
                <a:latin typeface="${font}"/><a:ea typeface="${font}"/><a:cs typeface="${font}"/>
              </a:rPr>
              <a:t>${escapeXml(text || " ")}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
  }

  function announcementContentXml(slide, index) {
    if (slide.kind === "announcement-cover") {
      return `
      ${announcementTextBoxXml("[ 교회소식 ]", defaultSermonTextStyle(72, 500), index + 600, "Announcement Cover Title", 3048000, 2210000, 6096000, 1000000, "ctr")}
      ${announcementTextBoxXml("이번 주 교회 소식을 전해드립니다.", defaultSermonTextStyle(17, 400), index + 601, "Announcement Cover Subtitle", 3657600, 3450000, 4876800, 420000, "ctr")}`;
    }

    const items = (slide.announcements || []).slice(0, ANNOUNCEMENTS_PER_SLIDE);
    const startIndex = slide.announcementStartIndex || 0;
    const rowX = 1143000;
    const rowWidth = 9906000;
    const startY = 1270000;
    const maxHeight = 4380000;
    const gap = items.length > 3 ? 170000 : 330000;
    const rowHeight = Math.floor((maxHeight - gap * Math.max(0, items.length - 1)) / Math.max(1, items.length));

    return items
      .map((item, itemIndex) => {
        const y = startY + itemIndex * (rowHeight + gap);
        const circleSize = Math.min(560000, Math.floor(rowHeight * 0.6));
        const circleX = rowX + 390000;
        const circleY = y + Math.floor((rowHeight - circleSize) / 2);
        const titleX = rowX + 1219200;
        const detailX = rowX + 5181600;
        const titleStyle = item.titleStyle || defaultSermonTextStyle(32, 800);
        const detailStyle = item.detailStyle || defaultSermonTextStyle(22, 400);
        const displayIndex = startIndex + itemIndex;
        return `
      ${announcementBoxXml(item, index, itemIndex, rowX, y, rowWidth, rowHeight)}
      ${announcementCircleXml(item, displayIndex, index + 700 + itemIndex, circleX, circleY, circleSize)}
      ${announcementTextBoxXml(item.title, titleStyle, index + 720 + itemIndex, "Announcement Title", titleX, y + Math.floor(rowHeight * 0.25), 3350000, Math.floor(rowHeight * 0.5), "l")}
      ${announcementTextBoxXml(item.detail, detailStyle, index + 740 + itemIndex, "Announcement Detail", detailX, y + Math.floor(rowHeight * 0.18), 4100000, Math.floor(rowHeight * 0.64), "l")}`;
      })
      .join("");
  }

  function announcementBoxXml(item, slideIndex, itemIndex, x, y, width, height) {
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${slideIndex + 650 + itemIndex}" name="Announcement Box ${itemIndex + 1}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="${hexNoHash(item.boxColor || COLORS.white)}"/></a:solidFill>
          <a:ln><a:noFill/></a:ln>
        </p:spPr>
      </p:sp>`;
  }

  function announcementCircleXml(item, itemIndex, id, x, y, size) {
    const circleColor = hexNoHash(item.titleStyle?.textColor || COLORS.black);
    const numberColor = hexNoHash(announcementNumberColor(item));
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${id}" name="Announcement Number ${itemIndex + 1}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${size}" cy="${size}"/></a:xfrm>
          <a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="${circleColor}"/></a:solidFill>
          <a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" anchor="ctr" rtlCol="0"><a:spAutoFit/></a:bodyPr>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="ko-KR" sz="2400" b="1" dirty="0">
                <a:solidFill><a:srgbClr val="${numberColor}"/></a:solidFill>
                <a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/>
              </a:rPr>
              <a:t>${String(itemIndex + 1).padStart(2, "0")}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`;
  }

  function announcementTextBoxXml(text, style, id, name, x, y, width, height, align = "l") {
    const color = hexNoHash(style.textColor || "#000000");
    const size = Math.round(Number(style.fontSize || 24) * 100);
    const bold = Number(style.fontWeight) >= 700 ? "1" : "0";
    const font = escapeXml(style.fontFamily || "Georgia");
    const pptAlign = style.textAlign ? textAlignToPpt(style.textAlign, align === "ctr" ? "center" : align === "r" ? "right" : "left") : align;
    const paragraphs = String(text || " ")
      .split(/\n/g)
      .map(
        (line) => `<a:p>
            <a:pPr algn="${pptAlign}"/>
            <a:r>
              <a:rPr lang="ko-KR" sz="${size}" b="${bold}" dirty="0">
                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
                <a:latin typeface="${font}"/><a:ea typeface="${font}"/><a:cs typeface="${font}"/>
              </a:rPr>
              <a:t>${escapeXml(line || " ")}</a:t>
            </a:r>
          </a:p>`
      )
      .join("");
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" anchor="ctr" rtlCol="0"><a:spAutoFit/></a:bodyPr>
          <a:lstStyle/>
          ${paragraphs}
        </p:txBody>
      </p:sp>`;
  }

  function customContentXml(slide, index) {
    if (slide.kind === "custom-content") {
      return `
      ${customTextBoxXml(slide.customContentTitle, slide.customContentTitleStyle, index + 820, "Custom Content Title", 0, 170000, 12192000, 760000, "ctr", "ctr")}
      ${customRectXml(index + 821, "Custom Content Box", 838200, 1130000, 10515600, 4930000, COLORS.white)}
      ${customTextBoxXml(slide.customContentText, slide.customContentBodyStyle, index + 822, "Custom Content Body", 1620000, 1240000, 8950000, 4640000, "l", "t")}`;
    }

    const titleText = `[ ${slide.customTitle || " "} ]`;
    return `
      ${customTextBoxXml(titleText, slide.customTitleStyle, index + 800, "Custom Title", 2130000, 2280000, 7930000, 900000, "ctr", "ctr")}
      ${customTextBoxXml(slide.customSubtitle, slide.customSubtitleStyle, index + 801, "Custom Subtitle", 3657600, 3600000, 4876800, 520000, "ctr", "ctr")}`;
  }

  function customRectXml(id, name, x, y, width, height, fill) {
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="${hexNoHash(fill)}"/></a:solidFill>
          <a:ln><a:noFill/></a:ln>
        </p:spPr>
      </p:sp>`;
  }

  function customTextBoxXml(text, style, id, name, x, y, width, height, align = "l", anchor = "ctr") {
    const safeStyle = style || defaultSermonTextStyle(36, 400);
    const color = hexNoHash(safeStyle.textColor || "#000000");
    const size = Math.round(Number(safeStyle.fontSize || 36) * 100);
    const bold = Number(safeStyle.fontWeight) >= 700 ? "1" : "0";
    const font = escapeXml(safeStyle.fontFamily || "Georgia");
    const pptAlign = safeStyle.textAlign ? textAlignToPpt(safeStyle.textAlign, align === "ctr" ? "center" : align === "r" ? "right" : "left") : align;
    const paragraphs = String(text || " ")
      .split(/\n/g)
      .map(
        (line) => `<a:p>
            <a:pPr algn="${pptAlign}"/>
            <a:r>
              <a:rPr lang="ko-KR" sz="${size}" b="${bold}" dirty="0">
                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
                <a:latin typeface="${font}"/><a:ea typeface="${font}"/><a:cs typeface="${font}"/>
              </a:rPr>
              <a:t>${escapeXml(line || " ")}</a:t>
            </a:r>
          </a:p>`
      )
      .join("");
    return `<p:sp>
        <p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${width}" cy="${height}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="square" anchor="${anchor}" rtlCol="0"><a:spAutoFit/></a:bodyPr>
          <a:lstStyle/>
          ${paragraphs}
        </p:txBody>
      </p:sp>`;
  }

  function slideRelsXml(imageRelationships = []) {
    const imageRels = imageRelationships
      .map(
        (relationship) =>
          `<Relationship Id="${relationship.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${relationship.target}"/>`
      )
      .join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  ${imageRels}
</Relationships>`;
  }

  function imageContentXml(relId, index) {
    const metrics = pptSlideMetrics();
    if (!relId) return textContentXml(paragraphXml("악보 이미지 준비 중", defaultStyle()), index);
    return `<p:pic>
        <p:nvPicPr><p:cNvPr id="${700 + index}" name="Hymn Score ${index}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${metrics.width}" cy="${metrics.height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>`;
  }

  function imageBackgroundXml(relId, index) {
    const metrics = pptSlideMetrics();
    return `<p:pic>
        <p:nvPicPr><p:cNvPr id="${900 + index}" name="Uploaded Background ${index}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${metrics.width}" cy="${metrics.height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>`;
  }

  function logoImageXml(relId, index) {
    const metrics = pptSlideMetrics();
    const size = Math.round(metrics.width * 0.075);
    const inset = Math.round(metrics.width * 0.043);
    const bottomInset = Math.round(metrics.height * 0.058);
    const position = getPresentationSettings().logoPosition || DEFAULT_LOGO_POSITION;
    const x = position.includes("right") ? metrics.width - inset - size : inset;
    const y = position.includes("bottom") ? metrics.height - bottomInset - size : bottomInset;
    return `<p:pic>
        <p:nvPicPr><p:cNvPr id="${1100 + index}" name="Global Logo ${index}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="${relId}"><a:alphaModFix amt="24000"/></a:blip><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${size}" cy="${size}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>`;
  }

  function slideMasterXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>${groupShapeXml()}</p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>`;
  }

  function slideMasterRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
  }

  function slideLayoutXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree>${groupShapeXml()}</p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
  }

  function slideLayoutRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
  }

  function groupShapeXml() {
    return `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>`;
  }

  function themeXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Worship Builder">
  <a:themeElements>
    <a:clrScheme name="Worship">
      <a:dk1><a:srgbClr val="111111"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1E2928"/></a:dk2>
      <a:lt2><a:srgbClr val="F5F6F0"/></a:lt2>
      <a:accent1><a:srgbClr val="16736F"/></a:accent1>
      <a:accent2><a:srgbClr val="D8911F"/></a:accent2>
      <a:accent3><a:srgbClr val="2F68BA"/></a:accent3>
      <a:accent4><a:srgbClr val="C34235"/></a:accent4>
      <a:accent5><a:srgbClr val="173B3F"/></a:accent5>
      <a:accent6><a:srgbClr val="F4EFE4"/></a:accent6>
      <a:hlink><a:srgbClr val="2F68BA"/></a:hlink>
      <a:folHlink><a:srgbClr val="6B4E9A"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Worship Fonts">
      <a:majorFont><a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/><a:cs typeface="Malgun Gothic"/></a:majorFont>
      <a:minorFont><a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/><a:cs typeface="Malgun Gothic"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Worship Format">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`;
  }

  function appPropsXml(slideCount) {
    const metrics = pptSlideMetrics();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Worship PPT Builder</Application>
  <PresentationFormat>${metrics.aspect === "4:3" ? "On-screen Show (4:3)" : "Widescreen"}</PresentationFormat>
  <Slides>${slideCount}</Slides>
</Properties>`;
  }

  function corePropsXml() {
    const now = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Worship PPT</dc:title>
  <dc:creator>Worship PPT Builder</dc:creator>
  <cp:lastModifiedBy>Worship PPT Builder</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
  }

  function zipBlob(files, mimeType) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = dosDateTime(new Date());

    Object.entries(files).forEach(([name, content]) => {
      const nameBytes = encoder.encode(name);
      const dataBytes = typeof content === "string" ? encoder.encode(content) : content;
      const crc = crc32(dataBytes);

      const local = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, now.time, true);
      localView.setUint16(12, now.date, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, dataBytes.length, true);
      localView.setUint32(22, dataBytes.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, dataBytes);

      const central = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, now.time, true);
      centralView.setUint16(14, now.date, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, dataBytes.length, true);
      centralView.setUint32(24, dataBytes.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length + dataBytes.length;
    });

    const centralStart = offset;
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, centralParts.length, true);
    endView.setUint16(10, centralParts.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, centralStart, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], { type: mimeType });
  }

  const CRC_TABLE = makeCrcTable();

  function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let c = index;
      for (let bit = 0; bit < 8; bit += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[index] = c >>> 0;
    }
    return table;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date) {
    const year = Math.max(date.getFullYear(), 1980);
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    };
  }

  function applySlideStyle(element, style) {
    element.style.background = toCssBackground(style.background);
    element.style.color = style.textColor;
  }

  function toCssBackground(value) {
    const background = String(value || COLORS.black).trim();
    if (isImageBackground(background)) {
      return `url(${background}) center / cover no-repeat`;
    }
    return background;
  }

  function isImageBackground(value) {
    return String(value || "").startsWith("data:image/");
  }

  function colorInputValue(value, fallback) {
    const color = normalizeColor(value);
    return /^#[0-9A-F]{6}$/.test(color) ? color : fallback;
  }

  function pptBackgroundColor(value) {
    const color = normalizeColor(value);
    if (/^#[0-9A-F]{6}$/.test(color)) return hexNoHash(color);
    const template = TEMPLATE_BACKGROUND_OPTIONS.find((option) => option.value === value);
    return hexNoHash(template?.fallback || COLORS.black);
  }

  function dataUrlToImageAsset(value, identifier = "image") {
    if (!isImageBackground(value)) return null;
    const match = String(value).match(/^data:(image\/(?:png|jpe?g|webp|svg\+xml));base64,(.+)$/i);
    if (!match) return null;
    const mimeType = match[1].toLowerCase();
    const extension = mimeType.includes("svg") ? "svg" : mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpeg" : mimeType.replace("image/", "");
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let offset = 0; offset < binary.length; offset += 1) {
      bytes[offset] = binary.charCodeAt(offset);
    }
    return {
      name: `${sanitizeAssetName(identifier)}.${extension}`,
      extension,
      contentType: mimeType,
      bytes,
    };
  }

  function hymnScoreImageDataUrl(item) {
    const staffRows = [228, 342, 456, 570].map((top, index) => {
      const lines = Array.from({ length: 5 }, (_line, lineIndex) => {
        const y = top + lineIndex * 14;
        return `<line x1="170" y1="${y}" x2="1430" y2="${y}" stroke="#202020" stroke-width="2"/>`;
      }).join("");
      const lyric = escapeXml(item.lines[index] || "");
      return `<g>${lines}<text x="192" y="${top + 92}" font-size="30" fill="#333333">${lyric}</text></g>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#fbfaf6"/>
      <rect x="84" y="72" width="1432" height="756" rx="18" fill="#ffffff" stroke="#d7dccf" stroke-width="4"/>
      <text x="150" y="150" font-family="Malgun Gothic, Arial, sans-serif" font-size="58" font-weight="800" fill="#121212">${escapeXml(item.title)}</text>
      <text x="150" y="198" font-family="Malgun Gothic, Arial, sans-serif" font-size="26" fill="#65706b">${escapeXml(item.scoreImage || "db://hymn-scores/placeholder.png")}</text>
      ${staffRows}
      <text x="150" y="790" font-family="Malgun Gothic, Arial, sans-serif" font-size="24" fill="#8a938d">더미 악보 이미지</text>
    </svg>`;
    return `data:image/svg+xml;base64,${base64Encode(svg)}`;
  }

  function base64Encode(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function sanitizeAssetName(value) {
    return String(value || "image").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function dateStamp() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("visible");
    toastTimer = window.setTimeout(() => els.toast.classList.remove("visible"), 2200);
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeColor(value) {
    const color = String(value || "").trim();
    if (!color.startsWith("#")) return color.toUpperCase();
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
    }
    return color.toUpperCase();
  }

  function hexNoHash(value) {
    return String(value || "#111111").replace("#", "").toUpperCase().slice(0, 6).padEnd(6, "0");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function escapeXml(value) {
    return escapeHtml(value);
  }
})();

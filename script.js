import {
  createInitialUiState,
  updateViewport as updateStateViewport,
  startRouteReading,
  closeRouteReader as closeRouteReaderState,
  startStory as startStoryState,
  closeStoryPanel as closeStoryPanelState,
  continueStory as continueStoryState,
  goToStoryStep as goToStoryStepState,
  toggleStoryPlayback,
  setStoryTransitioning,
  createInitialAudioState,
  resolveAudioAvailability,
  toggleAudioMuted,
  selectRouteFilter,
  openEventDetail,
  openLinkDetail,
  closeDetailPanel as closeDetailPanelState,
  applyEntityFilter,
  applyRelationFilter,
  applyTimeRange,
  openFilterPanel,
  closeFilterPanel,
  clearAllFilters as clearAllFiltersState,
  deriveGraphScope,
  getPanelPresentation,
  restoreProgress,
  serializeProgress,
  dispatch as reduceUiState
} from "./state-machine.mjs";
import {
  calculateStoryCameraTarget,
  getStoryFocusViewport
} from "./story-camera.mjs";

const backgroundMusic = {
  src: "assets/audio/epic-cinematic.mp3",
  title: "Epic Cinematic",
  author: "AlexGrohl",
  license: "User-provided track",
  attribution: "Epic Cinematic · AlexGrohl"
};

const entities = {
  egypt: "古埃及",
  mesopotamia: "两河流域 / 巴比伦",
  indus: "印度河文明",
  china: "古代中国",
  persia: "波斯帝国",
  israel: "古代以色列 / 犹太传统",
  greece: "希腊城邦",
  macedon: "马其顿帝国",
  roman: "罗马共和国 / 罗马帝国",
  easternRome: "东罗马 / 拜占庭",
  islamic: "伊斯兰帝国",
  papacy: "教廷",
  frankish: "法兰克王国",
  hre: "神圣罗马帝国 / 德意志诸邦",
  england: "英格兰 / 英国",
  france: "法国",
  spain: "西班牙",
  portugal: "葡萄牙",
  italy: "意大利诸邦 / 意大利",
  dutch: "尼德兰 / 荷兰",
  austria: "奥地利 / 哈布斯堡",
  prussia: "普鲁士 / 德国",
  russia: "俄罗斯",
  usa: "美国",
  eu: "欧洲联盟",
  nato: "北约",
  ukraine: "乌克兰",
  europe: "欧洲整体",
  global: "全球秩序"
};

const graphSize = { width: 9800, height: 3140 };

const regions = {
  ancient: { top: 150, height: 390, label: "古文明源头", lanes: 4 },
  classical: { top: 590, height: 430, label: "希腊 / 罗马 / 帝国", lanes: 5 },
  religion: { top: 1080, height: 500, label: "宗教传统与教会权威", lanes: 6 },
  monarchy: { top: 1640, height: 500, label: "王权、帝国与国家建构", lanes: 6 },
  revolution: { top: 2200, height: 410, label: "思想、革命与社会转型", lanes: 5 },
  modern: { top: 2670, height: 390, label: "现代世界秩序", lanes: 5 }
};

const relationStyles = {
  foundation: { label: "制度源头", color: "#bd8c2a" },
  transmission: { label: "传播", color: "#d3a84c" },
  cooperation: { label: "合作", color: "#b88924" },
  authorization: { label: "授权", color: "#e0b84f" },
  conflict: { label: "冲突", color: "#8c301a" },
  split: { label: "分裂", color: "#7b5a96" },
  secularization: { label: "世俗化", color: "#2f685d" },
  institution: { label: "制度转型", color: "#465d86" },
  expansion: { label: "扩张", color: "#7b5421" },
  alliance: { label: "联盟", color: "#546a7b" }
};

const eventTypeColor = {
  ancient: "#b88924",
  classical: "#8f6522",
  religion: "#c8952d",
  monarchy: "#3f2b16",
  revolution: "#2f685d",
  modern: "#465d86",
  conflict: "#8c301a"
};

const eventTypeLabels = {
  ancient: "古文明",
  classical: "古典秩序",
  religion: "宗教传统",
  monarchy: "王权国家",
  revolution: "思想革命",
  modern: "现代秩序",
  conflict: "冲突",
  expansion: "扩张",
  institution: "制度",
  alliance: "联盟",
  split: "分裂"
};

const entityFlags = {
  egypt: "🇪🇬",
  mesopotamia: "🏺",
  indus: "🧱",
  china: "🇨🇳",
  persia: "🦁",
  israel: "✡",
  greece: "🇬🇷",
  macedon: "☀",
  roman: "SPQR",
  easternRome: "☦",
  islamic: "☪",
  papacy: "🇻🇦",
  frankish: "⚜",
  hre: "🦅",
  england: "🇬🇧",
  france: "🇫🇷",
  spain: "🇪🇸",
  portugal: "🇵🇹",
  italy: "🇮🇹",
  dutch: "🇳🇱",
  austria: "🇦🇹",
  prussia: "🇩🇪",
  russia: "🇷🇺",
  usa: "🇺🇸",
  eu: "🇪🇺",
  nato: "NATO",
  ukraine: "🇺🇦",
  europe: "🇪🇺",
  global: "🌐"
};

const typeIcons = {
  ancient: "◆",
  classical: "▲",
  religion: "✚",
  monarchy: "♛",
  revolution: "✦",
  modern: "●",
  conflict: "×",
  expansion: "→",
  institution: "§",
  alliance: "∞",
  split: "◇"
};

const events = [
  event("egypt", -3000, "古埃及王权与神权", "ancient", "ancient", 80, ["egypt"], ["法老", "祭司阶层"], "法老把政治统治、神圣秩序与大型工程结合起来，形成早期王权神圣化样板。", "神庙和祭司保存天文、历法与祭祀秩序。", "王权以神性证明统治，行政和工程能力高度集中。", { egypt: "建立神权王权与纪念碑政治传统，对地中海世界的王权想象产生长期影响。" }),
  event("mesopotamia", -1792, "汉谟拉比法典", "ancient", "ancient", 180, ["mesopotamia"], ["汉谟拉比"], "成文法把统治、司法和社会等级固定下来，成为后世法治想象的重要早期参照。", "法律被置于神授秩序下，王权以维护正义自我说明。", "国王通过成文法统一治理与裁判。", { mesopotamia: "强化城市国家和帝国治理中的法律权威。", europe: "经由近东和古典传统，成为后世讨论成文法的远源之一。" }),
  event("indus", -2600, "印度河城市文明", "ancient", "ancient", 280, ["indus"], ["哈拉帕城市共同体"], "哈拉帕、摩亨佐-达罗展现早期城市规划、贸易网络和标准化能力。", "宗教形态难以完全确认，但城市秩序显示仪式和公共规范的重要性。", "没有留下明确王权叙事，更像以城市网络和管理标准维系秩序。", { indus: "展示欧亚早期城市化和贸易连接的另一种路径。", global: "提醒观众西方不是文明起点的唯一中心。" }),
  event("china", -221, "秦汉帝国与官僚国家", "ancient", "ancient", 380, ["china"], ["秦始皇", "汉武帝", "董仲舒"], "中国形成大一统帝国和官僚治理模式，为比较欧洲长期分裂提供参照。", "儒家与礼制成为政治正当性语言之一。", "皇帝、郡县和官僚体系结合，国家连续性强于多数欧洲政治体。", { china: "建立长期延续的帝国官僚传统。", europe: "作为对比，帮助理解欧洲为何长期在教会、王国和城市之间分权。" }),
  event("persia", -550, "波斯帝国治理", "classical", "classical", 470, ["persia", "greece"], ["居鲁士大帝", "大流士一世"], "波斯帝国用行省、道路和相对宽容的治理连接近东，对希腊世界构成压力。", "多民族帝国允许多种宗教传统存在。", "帝国行政、道路和贡赋体系成熟。", { persia: "建立横跨近东的大帝国治理样本。", greece: "希波战争刺激希腊城邦的政治自觉。" }),
  event("hebrew", -1000, "犹太一神传统", "religion", "religion", 540, ["israel", "roman", "papacy"], ["摩西", "大卫", "先知传统"], "一神信仰、契约观和先知批判传统后来深刻影响基督教与欧洲政治伦理。", "强调唯一神、律法和道德共同体。", "王权被放在更高的神圣律法之下。", { israel: "形成犹太教传统。", papacy: "成为基督教神学与欧洲宗教合法性的根脉之一。" }),
  event("athens", -508, "雅典民主与城邦政治", "classical", "revolution", 640, ["greece"], ["克里斯提尼", "伯里克利", "苏格拉底"], "城邦公民、辩论、法律和民主实践成为欧洲政治思想的重要源头。", "宗教仍在公共生活中，但政治讨论开始呈现强烈公民性。", "权力不再只由王权解释，公民共同体成为政治主体。", { greece: "建立城邦民主、哲学和公共辩论传统。", europe: "为后世共和主义、宪政和公民概念提供古典资源。" }),
  event("alexander", -334, "亚历山大东征", "classical", "classical", 720, ["macedon", "greece", "persia", "egypt"], ["亚历山大大帝"], "希腊文化向埃及、西亚扩散，形成希腊化世界，连接东西方知识与政治传统。", "希腊神祇、埃及和近东宗教并存融合。", "个人军事征服塑造跨区域帝国，但继承者迅速分裂。", { macedon: "短期建立庞大帝国。", egypt: "托勒密王朝把希腊统治与埃及传统结合。", persia: "阿契美尼德帝国终结。" }),
  event("romanRepublic", -509, "罗马共和国", "classical", "classical", 800, ["roman"], ["西塞罗", "格拉古兄弟", "凯撒"], "共和国制度、罗马法和公民身份成为西方政治制度的重要源头。", "传统祭祀服务于城邦和共和国秩序。", "元老院、执政官与公民军队构成扩张型共和国。", { roman: "共和国制度与法权观念成熟。", europe: "共和传统成为文艺复兴和近代革命的重要资源。" }),
  event("augustus", -27, "奥古斯都帝国秩序", "classical", "classical", 900, ["roman"], ["奥古斯都"], "罗马从共和国转向帝国，和平、道路、城市和法律把地中海连成一个政治空间。", "皇帝崇拜强化帝国忠诚。", "皇权披着共和国外衣建立稳定行政统治。", { roman: "帝国制度稳定化，拉丁世界和罗马法扩散。", europe: "后世皇帝、教皇和国家都会借用罗马遗产。" }),
  event("jesus", 30, "耶稣运动与早期基督教", "religion", "religion", 980, ["roman", "israel", "papacy"], ["耶稣", "保罗", "彼得"], "基督教从犹太传统中兴起，经罗马道路和城市网络传播。", "强调救赎、教会共同体和超越帝国的精神权威。", "早期基督徒与罗马国家关系紧张，形成信仰与政权的张力。", { papacy: "早期教会网络逐渐形成。", roman: "帝国城市网络反而帮助基督教传播。" }),
  event("constantine", 313, "基督教合法化", "religion", "religion", 1080, ["roman", "papacy"], ["君士坦丁"], "《米兰敕令》后，基督教从受迫害信仰进入帝国合法秩序。", "教会获得公开组织与传播空间。", "皇帝开始借助基督教统一帝国。", { roman: "帝国合法性开始与基督教结合。", papacy: "罗马主教地位逐步上升。" }),
  event("division", 395, "罗马东西分治", "classical", "classical", 1160, ["roman", "easternRome", "papacy"], ["狄奥多西一世"], "帝国东西两部分长期分化，政治中心与教会中心逐渐错位。", "东西教会在语言、礼仪与政治环境上分化。", "东部皇权延续更久，西部政治碎片化。", { easternRome: "延续罗马帝国身份。", papacy: "西部权力真空提升罗马教会地位。" }),
  event("westFall", 476, "西罗马帝国灭亡", "classical", "conflict", 1240, ["roman", "easternRome", "papacy", "europe"], ["奥多亚克", "罗慕路斯·奥古斯都"], "西部帝国皇位终结，欧洲进入多王国并存的政治格局。", "教会成为跨地域稳定组织。", "西欧王权碎片化，新王国寻求合法性。", { papacy: "在政治真空中获得更高公共权威。", europe: "帝国统一秩序瓦解，封建化增强。" }),
  event("islam", 622, "伊斯兰兴起", "religion", "religion", 1320, ["islamic", "easternRome", "spain"], ["穆罕默德", "倭马亚王朝"], "伊斯兰共同体和帝国迅速扩张，重塑地中海和欧洲南部格局。", "形成新的普世宗教与法律共同体。", "阿拉伯帝国成为拜占庭和西欧的重要外部力量。", { islamic: "连接西亚、北非和伊比利亚。", spain: "伊比利亚进入长期基督教与伊斯兰政权互动。" }),
  event("charlemagne", 800, "查理曼加冕", "monarchy", "monarchy", 1400, ["frankish", "papacy", "hre", "france"], ["查理曼", "利奥三世"], "教皇为查理曼加冕，塑造西方皇帝与拉丁基督教世界的共同想象。", "教皇以加冕显示自己能授予皇帝合法性。", "法兰克王权获得帝国头衔。", { frankish: "王权提升为帝国级权威。", papacy: "教皇成为皇权合法化仪式中心。", hre: "为神圣罗马帝国传统奠基。" }),
  event("schism1054", 1054, "东西教会大分裂", "religion", "religion", 1510, ["papacy", "easternRome", "russia"], ["罗马教皇", "君士坦丁堡牧首"], "罗马天主教与东正教分裂，欧洲宗教版图出现长期东西差异。", "教会普世性受损，东西传统各自发展。", "拜占庭与西欧政治文化距离拉大。", { papacy: "罗马教廷强化西欧中心地位。", easternRome: "东正教与帝国身份绑定。", russia: "后来继承东正教传统并发展第三罗马想象。" }),
  event("canossa", 1077, "卡诺莎之辱", "religion", "conflict", 1580, ["papacy", "hre", "italy"], ["格里高利七世", "亨利四世"], "皇帝向教皇求赦，成为教权压制皇权的象征性场景。", "教皇展现开除教籍可动摇君主统治基础。", "皇帝权威受损，德意志诸侯更容易挑战皇权。", { papacy: "教权达到象征性高点。", hre: "皇权受挫，诸侯分权增强。", italy: "成为帝国派与教皇派角力之地。" }),
  event("crusades", 1095, "十字军东征", "religion", "conflict", 1660, ["papacy", "france", "england", "hre", "easternRome", "islamic", "italy"], ["乌尔班二世", "萨拉丁", "理查一世"], "教皇号召西欧贵族远征东方，宗教动员与军事政治交织。", "教廷展示跨国动员能力。", "贵族军事力量外部化，贸易和财政变化推动王权成长。", { papacy: "短期提升跨欧洲号召力。", france: "骑士贵族深度参与。", england: "王权卷入远征和财政筹措。", italy: "威尼斯、热那亚等城市贸易受益。", easternRome: "第四次东征后受到重创。" }),
  event("magnaCarta", 1215, "《大宪章》", "monarchy", "revolution", 1760, ["england"], ["约翰王", "英格兰贵族"], "贵族迫使国王承认法律限制，为英国宪政传统提供早期象征。", "教会也在特权保护中受益。", "王权被法律和贵族共同体约束。", { england: "限制王权并推动议会传统。", europe: "成为后世宪政叙事的重要符号。" }),
  event("hundredYears", 1337, "英法百年战争", "monarchy", "conflict", 1850, ["england", "france"], ["贞德", "爱德华三世", "查理七世"], "长期战争推动英法财政、军队和民族认同发展。", "宗教象征被用于王权合法性和民族动员。", "王国战争促进中央化和国家意识。", { france: "王权集中和民族意识增强。", england: "战败后转向内部政治重组，议会财政作用增强。" }),
  event("renaissance", 1450, "文艺复兴", "revolution", "revolution", 1940, ["italy", "france", "england", "europe"], ["彼特拉克", "达·芬奇", "马基雅维利"], "古典遗产复兴、人文主义和城市赞助改变欧洲知识与艺术气质。", "人文主义并不简单反宗教，但削弱经院神学的垄断。", "城市共和国、王公赞助和世俗政治观察更受重视。", { italy: "城市文化和艺术赞助达到高峰。", europe: "古典政治和个人主体意识重新进入欧洲思想。" }),
  event("printing", 1455, "古腾堡印刷术", "revolution", "revolution", 2010, ["hre", "europe"], ["约翰内斯·古腾堡"], "活字印刷极大降低文本传播成本，为宗教改革、科学革命和公共舆论创造条件。", "圣经和小册子快速扩散，教会解释权受到挑战。", "知识传播不再完全依赖教会和宫廷。", { hre: "德意志地区成为印刷传播重镇。", europe: "知识传播速度和范围发生质变。" }),
  event("columbus", 1492, "大航海与美洲相遇", "modern", "expansion", 2090, ["spain", "portugal", "england", "france", "global"], ["哥伦布", "达伽马", "伊莎贝拉一世"], "欧洲海上扩张把西方历史推向全球化，也带来殖民、贸易和灾难性征服。", "传教随帝国扩张进入全球。", "王权、商人和军事技术结合成海外帝国。", { spain: "建立美洲殖民帝国。", portugal: "控制海上贸易据点。", england: "后来加入大西洋扩张。", global: "全球贸易、殖民和人口交换开启。" }),
  event("reformation", 1517, "宗教改革", "religion", "religion", 2180, ["papacy", "hre", "england", "france", "spain", "dutch"], ["马丁·路德", "加尔文"], "路德挑战罗马教会权威，宗教分裂迅速转化为政治与国家问题。", "拉丁基督教世界分裂，教会普遍权威被削弱。", "君主和诸侯借改革掌控本地教会与财富。", { hre: "诸侯自主增强，帝国分裂加深。", papacy: "失去部分欧洲地区管辖。", england: "为王权主导教会提供条件。", france: "宗教战争撕裂国内政治。", spain: "成为反宗教改革核心力量。" }),
  event("anglican", 1534, "英国国教形成", "monarchy", "monarchy", 2260, ["england", "papacy"], ["亨利八世", "托马斯·克兰麦"], "英王断绝与罗马教廷的管辖关系，确立国王为英格兰教会最高首脑。", "教会组织被纳入王国主权框架。", "王权获得教会财产与任命权。", { england: "王权与教会重组，影响后来的宪政与清教。", papacy: "失去英格兰教会管辖权。" }),
  event("scientific", 1543, "科学革命", "revolution", "revolution", 2340, ["italy", "england", "france", "europe"], ["哥白尼", "伽利略", "牛顿"], "自然哲学、实验和数学化知识改变欧洲理解世界的方式。", "宇宙论和权威解释受到挑战。", "国家、学院和赞助体系开始支持科学知识。", { italy: "伽利略冲突体现科学与教会权威张力。", england: "牛顿和皇家学会推动科学制度化。", europe: "理性和实验成为现代思想基础。" }),
  event("westphalia", 1648, "威斯特伐利亚体系", "monarchy", "monarchy", 2440, ["hre", "france", "spain", "dutch", "europe"], ["黎塞留", "斐迪南三世"], "和约确认诸邦权利与国际承认逻辑，主权国家秩序更清晰。", "宗教问题被纳入政治谈判。", "国家主权、外交承认与均势政治成为欧洲秩序核心。", { hre: "诸侯权利强化，统一皇权更难。", france: "成为欧陆强权。", dutch: "独立获得承认。", europe: "主权国家体系成为近代国际关系基础。" }),
  event("louisXIV", 1661, "路易十四绝对王权", "monarchy", "monarchy", 2520, ["france"], ["路易十四", "柯尔贝尔"], "法国绝对王权把宫廷、财政、军队和国家文化集中到君主周围。", "君权神授仍为王权提供神圣语言。", "中央集权国家机器增强。", { france: "法国成为绝对王权典型。", europe: "其他王国模仿或对抗法国模式。" }),
  event("glorious", 1688, "英国光荣革命", "revolution", "revolution", 2600, ["england", "dutch"], ["威廉三世", "玛丽二世", "洛克"], "议会限制王权，英国走向君主立宪和权利法案传统。", "宗教宽容问题与王位继承纠缠。", "王权接受议会和法律约束。", { england: "议会主权和宪政传统强化。", dutch: "荷兰政治和金融经验影响英国。" }),
  event("enlightenment", 1750, "启蒙运动", "revolution", "revolution", 2680, ["france", "england", "europe", "usa"], ["伏尔泰", "卢梭", "孟德斯鸠", "康德"], "自然权利、社会契约、理性批判和公共舆论削弱传统神授权威。", "宗教解释不再垄断政治合法性。", "王权面对法律、人民主权和权利语言的挑战。", { france: "启蒙思想批判旧制度和教会特权。", england: "经验主义和宪政经验成为思想资源。", usa: "殖民地革命吸收权利和共和思想。" }),
  event("american", 1776, "美国独立革命", "modern", "revolution", 2760, ["usa", "england", "france"], ["华盛顿", "杰斐逊", "富兰克林"], "北美殖民地以自然权利和共和原则建立新国家，反过来影响欧洲革命。", "政教分离和宗教自由成为政治原则之一。", "君主殖民权威被共和国取代。", { usa: "建立共和宪政国家。", england: "失去北美十三州，帝国策略调整。", france: "财政援助加重危机，并受革命观念刺激。" }),
  event("frenchRevolution", 1789, "法国大革命", "revolution", "conflict", 2840, ["france", "papacy", "europe"], ["罗伯斯庇尔", "拉法耶特", "路易十六"], "革命废除旧制度特权，推动人民主权、共和制与激进世俗化。", "教会财产被国有化，宗教权威遭到重塑。", "君主制合法性被根本挑战。", { france: "旧制度瓦解，国家与教会关系被重写。", papacy: "传统教权遭遇重大冲击。", europe: "革命观念传播，引发保守王权恐惧与战争。" }),
  event("napoleon", 1804, "拿破仑时代", "monarchy", "monarchy", 2920, ["france", "papacy", "hre", "italy", "europe"], ["拿破仑"], "拿破仑以帝国形式传播革命制度，重组欧洲政治地图。", "与教廷协约又压制教皇，显示现代国家可管理宗教。", "法典、行政与民族动员扩散。", { france: "革命成果被制度化。", hre: "神圣罗马帝国解体。", italy: "民族意识与行政整合增强。", europe: "民族主义、法典与现代行政扩散。" }),
  event("vienna", 1815, "维也纳体系", "modern", "institution", 3000, ["austria", "france", "england", "russia", "prussia", "europe"], ["梅特涅", "亚历山大一世"], "列强用均势和正统原则重建欧洲秩序，试图压制革命扩散。", "保守王权重新借助传统宗教和正统性。", "列强协调成为欧洲国际政治核心。", { austria: "成为保守秩序设计者。", france: "被重新纳入列强体系。", europe: "均势外交延续到一战前。" }),
  event("industrial", 1760, "工业革命", "modern", "institution", 3080, ["england", "france", "prussia", "usa", "global"], ["瓦特", "亚当·斯密", "阿克莱特"], "机器生产、工厂、煤铁和资本市场改变社会结构与国家能力。", "宗教慈善和伦理面对城市贫困与劳工问题。", "工业能力成为国家竞争和帝国扩张基础。", { england: "率先工业化，成为世界工厂。", prussia: "后发工业化增强军政能力。", usa: "工业扩张推动大国崛起。", global: "全球贸易和殖民体系被工业资本重塑。" }),
  event("1848", 1848, "1848 年革命", "revolution", "conflict", 3160, ["france", "austria", "prussia", "italy", "europe"], ["马志尼", "路易·勃朗", "梅特涅"], "自由主义、民族主义和社会问题在欧洲多地爆发，虽多被镇压，却改变政治议程。", "传统宗教权威与保守秩序一起受到挑战。", "王权被迫回应宪法、民族和社会改革。", { france: "第二共和国建立又转向第二帝国。", austria: "多民族帝国危机显现。", prussia: "德意志统一问题更加突出。", italy: "民族统一运动升温。" }),
  event("italyGermany", 1871, "意大利与德国统一", "modern", "institution", 3240, ["italy", "prussia", "france", "papacy", "austria"], ["加里波第", "加富尔", "俾斯麦", "威廉一世"], "民族国家统一改变欧洲权力平衡，教皇国世俗权力基本终结。", "教廷失去领土，转向精神权威。", "普鲁士主导德国统一，国家能力和军事实力大增。", { italy: "完成统一并限制教皇国。", prussia: "德国帝国建立，欧洲均势改变。", france: "普法战争失败刺激复仇主义。", papacy: "世俗领土大幅丧失。" }),
  event("imperialism", 1884, "帝国主义瓜分世界", "modern", "expansion", 3320, ["england", "france", "prussia", "italy", "spain", "portugal", "global"], ["维多利亚女王", "利奥波德二世", "俾斯麦"], "工业、资本和军事优势推动欧洲列强在非洲、亚洲扩张。", "传教、文明论和帝国意识形态相互支持。", "海外殖民成为国家竞争和资源获取方式。", { england: "维持最大殖民帝国。", france: "扩张非洲和亚洲殖民地。", prussia: "德国加入殖民竞争。", global: "殖民统治造成深远不平等和反殖民运动。" }),
  event("ww1", 1914, "第一次世界大战", "modern", "conflict", 3420, ["england", "france", "prussia", "austria", "russia", "usa", "europe"], ["威廉二世", "克列孟梭", "威尔逊", "尼古拉二世"], "总体战摧毁旧帝国，民族自决、革命和美国介入改变世界秩序。", "传统王权神圣性进一步破产。", "帝国崩溃，现代群众国家和战争机器显现。", { prussia: "德国战败，帝国终结。", austria: "哈布斯堡帝国解体。", russia: "沙皇制度崩溃并爆发革命。", england: "胜利但国力受损。", france: "胜利但损失惨重。", usa: "开始成为欧洲秩序的重要外部力量。" }),
  event("russianRev", 1917, "俄国革命", "revolution", "conflict", 3500, ["russia", "europe", "global"], ["列宁", "托洛茨基"], "布尔什维克革命建立社会主义国家，给西方资本主义和自由民主带来制度性挑战。", "东正教与旧王权联盟被打碎。", "沙皇专制被党国体制取代。", { russia: "进入苏维埃时代。", europe: "共产主义成为欧洲政治的重要对立轴。", global: "革命输出和冷战格局的远因形成。" }),
  event("ww2", 1939, "第二次世界大战", "modern", "conflict", 3600, ["prussia", "italy", "england", "france", "russia", "usa", "europe", "global"], ["希特勒", "丘吉尔", "罗斯福", "斯大林", "戴高乐"], "法西斯扩张和总体战造成巨大灾难，战后欧洲中心地位下降。", "宗教机构面对极权、战争和大屠杀的道德考验。", "极权国家与民主国家冲突，战后国际制度重建。", { prussia: "纳粹德国战败并被分区占领。", italy: "法西斯政权崩溃。", england: "胜利但帝国衰落。", france: "被占领后重建共和国。", usa: "成为西方阵营核心。", russia: "苏联成为东欧主导力量。" }),
  event("unNatoEU", 1945, "联合国、北约与欧洲一体化", "modern", "alliance", 3700, ["usa", "england", "france", "prussia", "italy", "eu", "nato", "global"], ["杜鲁门", "舒曼", "莫内", "艾森豪威尔"], "战后秩序通过联合国、北约、欧洲煤钢共同体等制度重建。", "宗教不再主导国家合法性，但基督教民主影响欧洲政治。", "主权国家通过联盟和共同市场分享部分权力。", { usa: "成为西方安全与经济秩序领导者。", nato: "1949 年建立集体防御机制。", eu: "欧洲一体化从煤钢共同体起步。", prussia: "西德被纳入西方制度。" }),
  event("coldWar", 1947, "冷战", "modern", "conflict", 3780, ["usa", "russia", "nato", "europe", "global"], ["杜鲁门", "斯大林", "肯尼迪", "戈尔巴乔夫"], "自由民主资本主义与苏联社会主义阵营长期对峙，欧洲被铁幕分割。", "宗教自由与无神论国家也成为意识形态叙事的一部分。", "军事联盟、核威慑和福利国家共同塑造现代西方。", { usa: "领导西方阵营。", russia: "苏联控制东欧阵营。", europe: "东西欧制度分裂。", nato: "成为西方集体安全核心。" }),
  event("decolonization", 1947, "去殖民化", "modern", "institution", 3860, ["england", "france", "spain", "portugal", "global"], ["甘地", "戴高乐", "尼赫鲁"], "欧洲殖民帝国快速瓦解，西方国家从帝国转向民族国家和国际组织秩序。", "传教体系与殖民权力脱钩，全球基督教中心更加多元。", "旧帝国失去直接统治，转向经济、文化和联盟影响。", { england: "英帝国转为英联邦。", france: "经历阿尔及利亚等去殖民危机。", portugal: "殖民帝国晚期瓦解。", global: "亚非拉民族国家大量出现。" }),
  event("1968", 1968, "1968 社会运动", "revolution", "revolution", 3940, ["france", "usa", "europe"], ["马丁·路德·金", "学生运动领袖", "女权主义者"], "学生、民权、反战和女性解放运动重塑西方社会价值。", "传统宗教道德权威受到青年文化和个人自由观念挑战。", "国家必须回应权利、福利、教育和文化自由诉求。", { france: "五月风暴冲击戴高乐秩序。", usa: "民权和反战运动改变政治文化。", europe: "社会自由化和新左翼兴起。" }),
  event("1989", 1989, "东欧剧变与柏林墙倒塌", "modern", "institution", 4040, ["prussia", "russia", "usa", "eu", "nato", "europe"], ["戈尔巴乔夫", "科尔", "里根", "瓦文萨"], "冷战秩序崩塌，德国统一和欧盟、北约东扩成为新阶段主线。", "东欧宗教和公民社会在反极权中发挥作用。", "苏联式党国瓦解，自由民主和市场经济扩展。", { prussia: "德国统一。", russia: "苏联影响力急剧衰退。", eu: "东扩前景打开。", nato: "冷战后角色重塑。" }),
  event("maastricht", 1992, "欧盟建立", "modern", "institution", 4120, ["eu", "france", "prussia", "italy", "england", "europe"], ["密特朗", "科尔", "德洛尔"], "《马斯特里赫特条约》把欧洲共同体推进为欧洲联盟，深化共同市场、货币和政治合作。", "宗教退居公共文化和价值讨论层面。", "国家把部分主权让渡给超国家制度。", { eu: "欧洲一体化进入欧盟阶段。", france: "与德国共同推动一体化。", prussia: "统一后的德国嵌入欧洲框架。", england: "参与但保持疑欧张力。" }),
  event("911", 2001, "9·11 与反恐战争", "modern", "conflict", 4200, ["usa", "england", "france", "nato", "global"], ["乔治·W·布什", "布莱尔"], "恐怖袭击和反恐战争改变西方安全政策、移民讨论和宗教政治关系。", "伊斯兰、西方世俗国家和宗教自由问题成为公共议题。", "国家安全权力扩张，北约首次启动集体防御条款。", { usa: "安全国家能力扩大并发动阿富汗、伊拉克战争。", england: "深度参与反恐战争。", nato: "首次适用第五条。", europe: "安全、移民和多元文化争论升温。" }),
  event("financial2008", 2008, "全球金融危机", "modern", "institution", 4280, ["usa", "eu", "england", "global"], ["伯南克", "奥巴马", "欧盟领导人"], "金融危机冲击新自由主义共识，欧债危机考验欧洲一体化。", "宗教机构更多以社会救助和伦理批判身份出现。", "国家重新介入市场，央行和财政政策成为核心工具。", { usa: "金融监管和救助政策重塑政治争论。", eu: "欧元区债务危机暴露制度缺陷。", england: "金融城和财政紧缩成为政治焦点。", global: "全球化信心受挫。" }),
  event("brexit", 2016, "英国脱欧与民粹浪潮", "modern", "split", 4360, ["england", "eu", "usa", "europe"], ["卡梅伦", "特蕾莎·梅", "鲍里斯·约翰逊", "特朗普"], "脱欧公投显示主权、移民、全球化和身份政治的张力。", "宗教不是主因，但文化身份和传统共同体焦虑参与政治动员。", "超国家一体化遭遇民族主权反弹。", { england: "离开欧盟，重新定义英国与欧洲关系。", eu: "一体化遭遇重大挫折但未解体。", usa: "同年特朗普胜选显示西方民粹浪潮。" }),
  event("covid", 2020, "新冠疫情", "modern", "institution", 4440, ["usa", "eu", "england", "france", "prussia", "global"], ["各国公共卫生官员", "冯德莱恩", "拜登"], "疫情考验国家治理、科学信任、边境政策和社会团结。", "宗教活动受到公共卫生限制，信仰共同体转向线上和社会援助。", "国家能力、公共卫生和供应链安全重新成为政治核心。", { usa: "公共卫生和政治极化交织。", eu: "疫苗采购和复苏基金推动共同财政讨论。", england: "脱欧后独立政策能力受到检验。", global: "全球化供应链脆弱性暴露。" }),
  event("ukraine2022", 2022, "俄乌战争与欧洲安全重组", "modern", "conflict", 4520, ["russia", "ukraine", "eu", "nato", "usa", "england", "france", "prussia"], ["泽连斯基", "普京", "拜登", "冯德莱恩"], "俄罗斯全面入侵乌克兰后，欧洲安全、能源和联盟体系被重新定义。", "东正教、民族身份和历史叙事被卷入战争合法性争夺。", "北约和欧盟重新强调安全共同体与主权边界。", { ukraine: "国家生存和欧洲身份成为核心议题。", russia: "与西方关系进入长期对抗。", eu: "制裁、援助和扩员议程强化。", nato: "集体防御重新成为欧洲安全中心。" }),
  event("swedenNato", 2024, "芬兰、瑞典加入北约", "modern", "alliance", 4600, ["nato", "eu", "russia", "europe"], ["尼尼斯托", "克里斯特松", "斯托尔滕贝格"], "北欧中立传统被战争冲击，芬兰和瑞典相继加入北约，波罗的海安全格局改变。", "宗教影响较弱，更多体现安全共同体和价值共同体选择。", "国家安全从中立转向联盟防御。", { nato: "扩展到 32 个成员国。", russia: "面对更完整的北欧北约防线。", europe: "冷战后安全结构出现重大调整。" }),
  event("west2026", 2026, "2026 欧洲安全与一体化压力", "modern", "institution", 4700, ["eu", "nato", "ukraine", "russia", "england", "france", "prussia"], ["泽连斯基", "斯塔默", "马克龙", "默茨", "冯德莱恩"], "到 2026 年，俄乌战争仍牵动欧洲安全、财政援助、制裁和乌克兰入欧议程。", "宗教更多作为身份和社会韧性因素存在，而非主导制度来源。", "欧洲国家在主权、安全联盟和超国家财政责任之间继续协调。", { eu: "乌克兰援助、制裁和扩员问题考验共同决策。", nato: "继续围绕威慑和成员安全协调。", ukraine: "持续依赖欧洲和美国支持维护主权。", russia: "与西方制度体系长期对抗。", england: "脱欧后仍通过安全议题深度参与欧洲事务。", france: "推动欧洲战略自主和安全保证。", prussia: "德国在援助、军备和欧洲领导责任上承压。" })
];

const links = [
  link("a1", "egypt", "athens", "foundation", 2, "埃及的数学、历法、神庙和王权想象，经地中海交流影响希腊世界。", ["egypt", "greece"], "古文明知识通过地中海网络进入西方古典传统。"),
  link("a2", "mesopotamia", "persia", "foundation", 2, "两河的成文法、城市和帝国经验被后来的近东帝国吸收。", ["mesopotamia", "persia"], "西方帝国传统并非从希腊罗马凭空产生。"),
  link("a3", "hebrew", "jesus", "foundation", 4, "基督教从犹太一神传统、律法和先知伦理中生长出来。", ["israel", "papacy"], "欧洲宗教权威的深层根源在近东。"),
  link("a4", "persia", "athens", "conflict", 3, "希波战争刺激希腊城邦对自由、公民和东方帝国的自我区分。", ["persia", "greece"], "外部帝国压力帮助塑造希腊政治身份。"),
  link("a5", "athens", "romanRepublic", "foundation", 4, "希腊政治哲学、城邦经验和文化被罗马吸收并制度化。", ["greece", "roman"], "希腊提供思想语言，罗马提供法律和制度载体。"),
  link("a6", "alexander", "jesus", "transmission", 3, "希腊化世界提供共同语言和城市网络，帮助早期基督教传播。", ["macedon", "roman", "papacy"], "宗教传播依赖已有文化和交通网络。"),
  link("a7", "romanRepublic", "augustus", "institution", 5, "共和国扩张的内在矛盾最终导向帝国集中统治。", ["roman"], "罗马展示共和国如何转化为帝国。"),
  link("a8", "augustus", "jesus", "transmission", 4, "罗马和平、道路和城市系统让基督教能跨区域传播。", ["roman", "papacy"], "帝国网络为反帝国式信仰提供传播基础。"),
  link("a9", "jesus", "constantine", "cooperation", 5, "受迫害信仰逐渐进入帝国合法秩序。", ["roman", "papacy"], "信仰共同体与国家权力开始深度绑定。"),
  link("a10", "constantine", "division", "split", 4, "基督教帝国一体化并未阻止东西政治和教会传统分化。", ["roman", "easternRome", "papacy"], "统一宗教进入分裂帝国后产生不同制度路径。"),
  link("a11", "division", "westFall", "split", 5, "西部帝国崩溃让教会成为最稳定的跨地域组织。", ["papacy", "europe"], "教权上升常来自世俗秩序的缺位。"),
  link("a12", "islam", "crusades", "conflict", 4, "伊斯兰帝国扩张和圣地争夺是十字军背景之一。", ["islamic", "papacy", "europe"], "西欧身份在与伊斯兰世界的长期互动中被强化。"),
  link("a13", "westFall", "charlemagne", "authorization", 5, "教廷需要保护者，新兴王权需要罗马帝国名义。", ["papacy", "frankish", "hre"], "教皇与皇帝互相授权，也埋下竞争。"),
  link("a14", "charlemagne", "schism1054", "split", 2, "拉丁西方的政治宗教共同体强化，与拜占庭距离拉大。", ["papacy", "easternRome"], "东西方基督教世界逐渐分道。"),
  link("a15", "charlemagne", "canossa", "conflict", 5, "谁能授予合法性的问题在教皇改革后变成公开冲突。", ["papacy", "hre"], "教权与皇权的合作结构转为权威竞争。"),
  link("a16", "canossa", "crusades", "authorization", 4, "教皇权威高涨，使跨国军事动员成为可能。", ["papacy", "france", "england", "hre"], "宗教权威可转化为战争动员。"),
  link("a17", "crusades", "renaissance", "transmission", 2, "地中海贸易、拜占庭和伊斯兰知识交流间接推动欧洲知识复兴。", ["italy", "islamic", "easternRome"], "战争之外，交流也塑造欧洲思想。"),
  link("a18", "magnaCarta", "glorious", "institution", 4, "限制王权的法律传统在英国长期累积，最终走向议会主权。", ["england"], "英国宪政不是单点爆发，而是长期制度沉淀。"),
  link("a19", "hundredYears", "louisXIV", "institution", 3, "战争推动法国税收、军队和民族王权成长。", ["france"], "长期战争是中央集权国家形成的重要推力。"),
  link("a20", "renaissance", "printing", "transmission", 4, "人文主义文本需求和城市文化推动印刷传播。", ["italy", "hre", "europe"], "技术让古典复兴变成大规模知识运动。"),
  link("a21", "printing", "reformation", "transmission", 5, "印刷术让路德小册子和圣经译本快速扩散。", ["hre", "papacy", "europe"], "媒介革命直接改变宗教和政治权威。"),
  link("a22", "columbus", "imperialism", "expansion", 3, "大航海开启海外帝国，后来发展成工业时代全球殖民竞争。", ["spain", "portugal", "england", "france", "global"], "欧洲历史从地区史变成全球史。"),
  link("a23", "reformation", "anglican", "secularization", 5, "英王利用宗教改革把本国教会国家化。", ["england", "papacy"], "宗教权威被纳入主权国家。"),
  link("a24", "reformation", "westphalia", "conflict", 5, "宗教分裂和王朝竞争最终推动主权国家体系成形。", ["hre", "france", "spain", "dutch", "europe"], "宗教战争的结果反而是政治世俗化。"),
  link("a25", "scientific", "enlightenment", "foundation", 4, "科学革命提供理性、自然法和进步观的思想土壤。", ["england", "france", "europe"], "对自然权威的重估扩展到政治权威。"),
  link("a26", "westphalia", "louisXIV", "institution", 3, "主权国家体系为法国绝对王权的外交和军事扩张提供舞台。", ["france", "europe"], "国家主权与君主集中在 17 世纪相互强化。"),
  link("a27", "louisXIV", "frenchRevolution", "conflict", 4, "绝对王权、财政危机和特权制度成为法国革命的背景。", ["france"], "高度集中的王权也集中了承担危机的压力。"),
  link("a28", "glorious", "enlightenment", "foundation", 4, "英国宪政经验为洛克和启蒙政治理论提供现实样本。", ["england", "france", "usa"], "制度实践反过来塑造思想。"),
  link("a29", "enlightenment", "american", "institution", 5, "自然权利和共和思想被写进美国革命和宪法实践。", ["usa", "england", "france"], "启蒙思想第一次大规模转化为新国家设计。"),
  link("a30", "american", "frenchRevolution", "transmission", 4, "美国革命鼓舞法国改革派，同时加重法国财政危机。", ["usa", "france"], "跨大西洋革命互相激发。"),
  link("a31", "frenchRevolution", "napoleon", "institution", 5, "拿破仑把革命后的行政、法典和民族动员制度化并输出。", ["france", "europe"], "革命理念通过帝国战争扩散。"),
  link("a32", "napoleon", "vienna", "conflict", 5, "列强通过维也纳体系回应拿破仑带来的革命和霸权冲击。", ["austria", "france", "england", "russia", "prussia"], "保守均势是对革命时代的制度反弹。"),
  link("a33", "industrial", "imperialism", "expansion", 5, "工业产能、资本和军事技术推动欧洲全球扩张。", ["england", "france", "prussia", "global"], "现代帝国主义建立在工业国家能力之上。"),
  link("a34", "vienna", "1848", "conflict", 3, "保守秩序压制民族和自由诉求，最终引发 1848 年革命浪潮。", ["austria", "france", "prussia", "italy"], "被压抑的自由主义和民族主义并未消失。"),
  link("a35", "1848", "italyGermany", "institution", 4, "1848 失败后，民族统一改由现实政治和战争推进。", ["italy", "prussia", "austria", "france"], "理想主义革命转向国家建构。"),
  link("a36", "italyGermany", "ww1", "conflict", 5, "德国统一改变欧洲均势，联盟体系和民族竞争最终走向大战。", ["prussia", "france", "england", "austria", "russia"], "民族国家成功也制造新的国际紧张。"),
  link("a37", "imperialism", "ww1", "conflict", 4, "殖民竞争、海军军备和全球帝国利益加剧列强冲突。", ["england", "france", "prussia", "global"], "欧洲内部战争具有全球帝国背景。"),
  link("a38", "ww1", "russianRev", "conflict", 5, "战争压力摧毁沙皇制度，引发俄国革命。", ["russia", "europe"], "总体战可直接瓦解旧制度。"),
  link("a39", "ww1", "ww2", "conflict", 5, "凡尔赛体系、经济危机和民族复仇为二战埋下伏笔。", ["prussia", "france", "england", "usa", "europe"], "一次大战没有稳定解决欧洲秩序。"),
  link("a40", "russianRev", "coldWar", "conflict", 4, "社会主义制度挑战资本主义西方，成为冷战意识形态基础。", ["russia", "usa", "europe"], "革命政权改变 20 世纪西方自我定位。"),
  link("a41", "ww2", "unNatoEU", "institution", 5, "二战灾难推动联合国、北约和欧洲一体化等制度重建。", ["usa", "england", "france", "eu", "nato"], "现代西方秩序建立在战争废墟上的制度化合作。"),
  link("a42", "ww2", "decolonization", "split", 4, "欧洲列强战后衰弱，加速殖民帝国瓦解。", ["england", "france", "global"], "西方国家从帝国支配转向后殖民关系。"),
  link("a43", "unNatoEU", "coldWar", "alliance", 5, "北约和欧洲一体化共同支撑西方阵营。", ["usa", "nato", "eu", "europe"], "联盟和市场成为冷战西方制度优势的一部分。"),
  link("a44", "coldWar", "1989", "split", 5, "苏联阵营危机、改革和公民运动导致东欧剧变。", ["russia", "eu", "nato", "europe"], "冷战结束打开欧洲重新统一的空间。"),
  link("a45", "1968", "brexit", "transmission", 2, "1968 后的社会自由化与后来的文化反弹共同构成西方身份政治背景。", ["france", "usa", "england", "europe"], "现代政治不只围绕阶级，也围绕文化、身份和价值。"),
  link("a46", "1989", "maastricht", "institution", 4, "冷战结束后，欧洲一体化加速并吸收统一德国。", ["eu", "prussia", "france"], "欧洲用一体化框架管理德国统一和大陆秩序。"),
  link("a47", "maastricht", "financial2008", "institution", 3, "欧元和共同市场深化后，金融危机暴露财政和货币政策不对称。", ["eu", "england", "france", "prussia"], "一体化越深，共同治理难题越明显。"),
  link("a48", "911", "ukraine2022", "conflict", 1, "21 世纪西方安全议题从反恐又转回大国战争与领土主权。", ["usa", "nato", "europe"], "西方安全重心发生转移。"),
  link("a49", "financial2008", "brexit", "split", 4, "经济不平等、紧缩和全球化焦虑为反建制政治提供土壤。", ["england", "eu", "usa"], "经济危机转化为主权和身份政治。"),
  link("a50", "brexit", "covid", "institution", 2, "脱欧后的英国和欧盟在疫情中分别展示不同治理路径。", ["england", "eu"], "危机检验国家主权与区域合作的边界。"),
  link("a51", "covid", "ukraine2022", "conflict", 2, "疫情后的供应链和国家能力讨论，与战争后的能源安全相互叠加。", ["eu", "usa", "global"], "全球化脆弱性成为 2020 年代核心问题。"),
  link("a52", "ukraine2022", "swedenNato", "alliance", 5, "俄乌战争促使北欧中立传统转向北约集体防御。", ["nato", "russia", "eu"], "欧洲安全结构出现冷战后最大调整之一。"),
  link("a53", "swedenNato", "west2026", "alliance", 4, "北约扩员后，欧洲继续围绕乌克兰援助、制裁和安全保证协调。", ["nato", "eu", "ukraine", "russia"], "2026 年的西方秩序仍处在安全重组中。"),
  link("a54", "ukraine2022", "west2026", "conflict", 5, "战争延续使欧盟财政援助、制裁和乌克兰入欧议程成为现实压力。", ["eu", "ukraine", "russia", "england", "france", "prussia"], "欧洲一体化和安全联盟被战争持续测试。")
];

events.push(
  event("nicaea", 325, "尼西亚会议", "religion", "religion", 1120, ["roman", "papacy", "easternRome"], ["君士坦丁", "阿塔那修", "阿里乌"], "皇帝召集主教会议处理教义争端，显示帝国与教会共同塑造正统。", "三位一体争论被制度化处理，教义正统获得会议形式。", "皇帝以仲裁者身份介入教会事务。", { roman: "皇权参与宗教正统制定。", papacy: "主教会议传统强化教会制度。", easternRome: "东方教会与帝国政治关系更紧密。" }),
  event("justinian", 529, "查士丁尼法典", "classical", "institution", 1288, ["easternRome", "roman", "italy"], ["查士丁尼", "特里波尼安"], "罗马法被系统整理，后来经大学和教会法影响欧洲大陆法律传统。", "基督教帝国把法律、教义和皇权秩序并置。", "皇帝以立法者身份重申罗马秩序。", { easternRome: "强化拜占庭皇权和法律传统。", italy: "中世纪后期罗马法复兴的重要源头。", europe: "大陆法系的远源之一。" }),
  event("tours", 732, "图尔战役", "monarchy", "conflict", 1360, ["frankish", "islamic", "france"], ["查理·马特"], "法兰克军队阻止倭马亚势力继续深入西欧内陆，后来被塑造成基督教西欧边界记忆。", "基督教欧洲的共同身份叙事被强化。", "法兰克宫相家族声望上升，为加洛林王朝铺路。", { frankish: "加洛林家族政治资本增长。", islamic: "伊比利亚仍长期由伊斯兰政权参与治理。", france: "成为法国历史叙事中的早期防御记忆。" }),
  event("verdun", 843, "凡尔登条约", "monarchy", "split", 1455, ["frankish", "france", "hre", "italy"], ["洛泰尔一世", "秃头查理", "日耳曼人路易"], "查理曼帝国被三分，西法兰克、东法兰克和中部王国构成法国、德意志、意大利政治分化的重要背景。", "拉丁基督教共同体下出现更清楚的政治分区。", "统一帝国难以维持，王国传统走向分化。", { france: "西法兰克成为法国王权远源。", hre: "东法兰克成为德意志和神圣罗马帝国远源。", italy: "意大利长期处于分裂和争夺之中。" }),
  event("norman1066", 1066, "诺曼征服英格兰", "monarchy", "conflict", 1545, ["england", "france"], ["威廉一世", "哈罗德二世"], "诺曼底公爵征服英格兰，把英格兰纳入英法封建关系和大陆政治。", "教会改革和诺曼主教进入英格兰。", "王权、土地登记和贵族结构被重组。", { england: "中央化王权和封建土地制度增强。", france: "英王同时持有法国领地，英法冲突根源加深。" }),
  event("universities", 1088, "中世纪大学兴起", "religion", "institution", 1625, ["italy", "france", "england", "papacy"], ["博洛尼亚法学家", "阿奎那"], "博洛尼亚、巴黎、牛津等大学让神学、法学和理性辩论制度化。", "神学成为大学核心学科，但也训练出严密论证传统。", "王权、教会和城市都依赖受教育的法学家与官僚。", { italy: "博洛尼亚推动罗马法研究。", france: "巴黎大学成为神学中心。", england: "牛津和剑桥发展学术传统。", papacy: "教会培养法学和神学人才。" }),
  event("blackDeath", 1347, "黑死病", "modern", "conflict", 1890, ["italy", "france", "england", "hre", "europe"], ["欧洲城市居民", "医生与神职人员"], "瘟疫造成巨大人口损失，动摇封建劳役和宗教解释权，改变欧洲社会结构。", "教会无法解释和阻止灾难，权威受损。", "劳动力稀缺提升农民议价能力，封建关系松动。", { europe: "人口和经济结构剧烈调整。", england: "劳工法规和农民反抗增多。", italy: "城市文化在创伤后继续转型。" }),
  event("constantinople1453", 1453, "君士坦丁堡陷落", "classical", "conflict", 1980, ["easternRome", "islamic", "italy", "russia"], ["穆罕默德二世", "君士坦丁十一世"], "拜占庭灭亡，学者和文本西迁，奥斯曼控制东地中海，刺激欧洲寻找海上通路。", "东正教中心转移，俄罗斯后来强化第三罗马想象。", "传统罗马帝国最后政治实体终结。", { easternRome: "拜占庭帝国终结。", islamic: "奥斯曼成为东地中海强权。", italy: "希腊学者西迁促进古典复兴。", russia: "莫斯科第三罗马叙事增强。" }),
  event("augsburg1555", 1555, "奥格斯堡和约", "monarchy", "institution", 2310, ["hre", "papacy"], ["查理五世", "德意志诸侯"], "和约承认诸侯可决定领地信仰，宗教问题被纳入地方主权安排。", "天主教普世权威进一步受限。", "诸侯权力增强，帝国统一性下降。", { hre: "德意志宗教和政治分裂被制度化。", papacy: "对德意志地区控制继续下降。" }),
  event("dutchRevolt", 1568, "尼德兰起义", "monarchy", "conflict", 2375, ["dutch", "spain", "england"], ["奥兰治的威廉", "腓力二世"], "尼德兰反抗西班牙哈布斯堡统治，宗教、商业和城市自治交织。", "新教身份成为独立运动的重要因素。", "商业共和国挑战王朝帝国统治。", { dutch: "荷兰共和国崛起。", spain: "西班牙霸权受消耗。", england: "英荷商业和新教联盟关系增强。" }),
  event("englishCivilWar", 1642, "英国内战", "revolution", "conflict", 2485, ["england"], ["查理一世", "克伦威尔"], "王权、议会、税收和宗教改革冲突爆发为内战，国王被处决。", "清教力量挑战国教和王权宗教秩序。", "议会和军队一度压倒君主制。", { england: "君主权威遭遇根本挑战，为后来的光荣革命铺路。" }),
  event("slaveTradeAbolition", 1807, "废奴运动与奴隶贸易废止", "revolution", "institution", 2960, ["england", "france", "usa", "global"], ["威伯福斯", "海地革命者"], "启蒙、人道主义、宗教改革派和奴隶反抗共同推动废除奴隶贸易。", "福音派和贵格会等宗教群体参与道德动员。", "国家开始用法律限制帝国商业利益。", { england: "1807 年废除奴隶贸易并用海军压制贸易。", france: "革命和殖民利益之间长期摇摆。", usa: "奴隶制问题继续撕裂共和国。", global: "大西洋奴隶制合法性被削弱。" }),
  event("reform1832", 1832, "英国议会改革", "revolution", "institution", 3120, ["england"], ["格雷伯爵", "中产阶级改革派"], "改革法案扩大代表权，工业城市和中产阶级进入政治体系。", "宗教身份限制逐步放松。", "议会制度适应工业社会，避免革命式断裂。", { england: "英国以渐进改革吸收社会压力。" }),
  event("darwin1859", 1859, "《物种起源》", "revolution", "transmission", 3200, ["england", "europe", "usa"], ["达尔文"], "进化论改变人类起源和自然秩序理解，冲击传统神学解释。", "创造论和自然神学受到挑战。", "科学权威在公共文化中继续上升。", { england: "科学文化和宗教争论升温。", europe: "自然科学影响社会思想。", usa: "教育和宗教公共争论延续至今。" }),
  event("versailles1919", 1919, "凡尔赛和约", "modern", "institution", 3465, ["france", "england", "usa", "prussia", "europe"], ["威尔逊", "克列孟梭", "劳合·乔治"], "一战后和约重划欧洲并惩罚德国，但没有创造稳定秩序。", "民族自决语言部分替代王朝和宗教合法性。", "战胜国用国际联盟和条约重建秩序。", { france: "寻求安全保障和削弱德国。", england: "维持均势和帝国利益。", usa: "威尔逊主义影响国际秩序。", prussia: "德国国内复仇主义上升。" }),
  event("greatDepression", 1929, "大萧条", "modern", "conflict", 3540, ["usa", "england", "france", "prussia", "global"], ["胡佛", "罗斯福", "凯恩斯"], "经济崩溃削弱自由市场信心，推动国家干预、极端主义和福利国家思想。", "宗教组织参与救济，但无法解决制度危机。", "国家经济管理成为现代政治核心。", { usa: "新政扩展联邦政府角色。", prussia: "经济危机助推纳粹崛起。", england: "凯恩斯主义逐渐成形。", global: "全球贸易和金融秩序崩溃。" }),
  event("holocaust", 1941, "大屠杀", "modern", "conflict", 3640, ["prussia", "europe", "israel", "global"], ["纳粹政权", "欧洲犹太人"], "纳粹种族灭绝成为现代西方文明危机的极端象征，战后人权制度深受其影响。", "基督教欧洲与反犹传统的关系受到反思。", "国家机器可以被极权动员为灭绝工具。", { prussia: "纳粹德国罪责成为战后德国政治基础问题。", europe: "人权、记忆政治和反极权共识形成。", israel: "犹太民族国家建立的历史背景强化。", global: "种族灭绝概念和国际刑法发展。" }),
  event("romeTreaty1957", 1957, "《罗马条约》", "modern", "institution", 3830, ["france", "prussia", "italy", "dutch", "eu"], ["舒曼", "莫内", "阿登纳"], "欧洲经济共同体建立，把法德和解转化为共同市场制度。", "基督教民主在早期一体化中有重要政治影响。", "国家通过经济共同体分享部分主权。", { eu: "欧洲一体化制度化。", france: "通过共同市场管理德国力量。", prussia: "西德回归欧洲制度。", italy: "成为核心创始国。" }),
  event("berlinWall1961", 1961, "柏林墙修建", "modern", "conflict", 3905, ["prussia", "russia", "usa", "nato", "europe"], ["赫鲁晓夫", "肯尼迪"], "柏林墙把冷战分裂具象化，德国和欧洲成为两大阵营前线。", "教会在东欧部分地区成为公民社会空间。", "国家边界和意识形态边界高度重合。", { prussia: "德国分裂成为冷战核心象征。", usa: "承担西柏林安全承诺。", russia: "苏联控制东德阵营。", nato: "西方防御前线明确。" }),
  event("oil1973", 1973, "石油危机", "modern", "conflict", 3985, ["usa", "england", "france", "prussia", "global"], ["欧佩克", "尼克松时代政策制定者"], "能源危机终结战后高增长想象，通胀、产业转型和中东政治影响西方。", "宗教和地缘政治在中东问题中交织。", "能源安全成为国家战略。", { usa: "能源政策和中东战略调整。", europe: "福利国家财政和工业结构承压。", global: "资源政治改变全球经济秩序。" }),
  event("euro2002", 2002, "欧元现金流通", "modern", "institution", 4240, ["eu", "france", "prussia", "italy", "dutch"], ["欧洲央行", "欧盟成员国领导人"], "欧元进入日常流通，欧洲一体化从条约走入普通人的钱包。", "宗教影响较弱，身份更多表现为欧洲公共符号。", "货币主权被集中到欧洲央行。", { eu: "共同货币强化一体化。", france: "与德国共同锚定欧元区。", prussia: "德国经济纪律影响欧元治理。", italy: "货币政策空间收窄。" }),
  event("migration2015", 2015, "欧洲难民与移民危机", "modern", "conflict", 4340, ["eu", "prussia", "france", "england", "global"], ["默克尔", "欧盟成员国政府"], "叙利亚战争等因素带来大规模难民，冲击欧盟边境、身份政治和人道主义原则。", "伊斯兰、基督教慈善和世俗人权话语同时进入争论。", "欧盟内部围绕边境、配额和主权产生分歧。", { eu: "共同庇护政策受考验。", prussia: "德国接收大量难民并引发政治争论。", france: "安全与共和身份议题升温。", england: "脱欧前移民议题成为政治动员焦点。" }),
  event("ai2023", 2023, "生成式 AI 与监管竞争", "modern", "institution", 4560, ["usa", "eu", "england", "china", "global"], ["科技公司", "欧盟监管者"], "生成式 AI 扩散后，西方围绕创新、监管、版权和国家竞争展开新一轮制度调整。", "宗教影响较弱，但伦理、人类尊严和知识权威问题重新被讨论。", "国家和超国家机构开始争夺技术治理规则制定权。", { usa: "科技公司和国家安全议程推动 AI 竞争。", eu: "以监管框架塑造技术治理。", england: "试图成为 AI 安全治理枢纽。", china: "成为西方技术竞争的关键参照。", global: "知识生产和劳动结构面临变化。" })
);

links.push(
  link("b1", "constantine", "nicaea", "cooperation", 4, "合法化后，皇帝很快介入教义统一，尼西亚会议成为帝国和教会合作治理的标志。", ["roman", "papacy", "easternRome"], "正统教义并非单纯神学问题，也被纳入帝国治理。"),
  link("b2", "division", "justinian", "institution", 3, "东罗马延续帝国身份，并用法典整理罗马法律传统。", ["easternRome", "roman"], "罗马法通过拜占庭保存和再制度化。"),
  link("b3", "islam", "tours", "conflict", 3, "伊斯兰势力进入伊比利亚后，法兰克与其在西欧边缘发生冲突。", ["islamic", "frankish", "france"], "欧洲边界意识在冲突和交流中形成。"),
  link("b4", "charlemagne", "verdun", "split", 5, "查理曼帝国未能长期统一，凡尔登条约让西欧政治分化更清晰。", ["frankish", "france", "hre", "italy"], "法国和德意志的分叉从这里变得更可见。"),
  link("b5", "verdun", "norman1066", "transmission", 2, "法兰克世界的封建关系向海峡两岸延伸，诺曼人把英格兰卷入大陆政治。", ["france", "england"], "英法纠缠是中世纪欧洲国家形成的重要背景。"),
  link("b6", "schism1054", "universities", "institution", 2, "西欧拉丁教会和城市兴起，为大学制度提供组织和知识土壤。", ["papacy", "italy", "france", "england"], "知识制度化让教会和国家都获得专业人才。"),
  link("b7", "universities", "magnaCarta", "institution", 2, "法学训练和书面法律文化帮助限制王权的语言变得更有力。", ["england", "papacy"], "法律共同体是宪政传统的基础之一。"),
  link("b8", "blackDeath", "renaissance", "transmission", 2, "黑死病后的社会震荡改变劳动、财富和城市文化环境，间接推动文艺复兴社会条件。", ["italy", "europe"], "灾难也会重排社会结构和文化赞助。"),
  link("b9", "constantinople1453", "renaissance", "transmission", 3, "拜占庭学者和文本进入意大利，增强古典希腊知识复兴。", ["easternRome", "italy"], "帝国终结反而推动文化迁移。"),
  link("b10", "constantinople1453", "columbus", "expansion", 4, "东地中海通道变化和奥斯曼压力刺激欧洲寻找海上贸易路径。", ["islamic", "spain", "portugal", "italy"], "大航海时代与地中海权力变化密切相关。"),
  link("b11", "reformation", "augsburg1555", "institution", 4, "宗教改革后的德意志冲突通过奥格斯堡和约暂时制度化。", ["hre", "papacy"], "地方主权开始进入宗教安排。"),
  link("b12", "augsburg1555", "westphalia", "institution", 4, "奥格斯堡的地方信仰原则后来在威斯特伐利亚体系中被更广泛政治化。", ["hre", "europe"], "宗教和平逐步转化为主权秩序。"),
  link("b13", "dutchRevolt", "westphalia", "institution", 3, "尼德兰独立最终在威斯特伐利亚体系中获得承认。", ["dutch", "spain", "europe"], "商业共和国成为欧洲国家体系成员。"),
  link("b14", "englishCivilWar", "glorious", "institution", 5, "内战和共和国实验使英国无法回到无条件君主专制。", ["england"], "光荣革命是长期王权-议会冲突的制度收束。"),
  link("b15", "enlightenment", "slaveTradeAbolition", "secularization", 3, "自然权利、人道主义和宗教改革派道德运动共同推动废奴。", ["england", "usa", "france", "global"], "现代权利观开始挑战帝国经济利益。"),
  link("b16", "industrial", "reform1832", "institution", 3, "工业城市和中产阶级壮大，迫使英国议会扩大代表权。", ["england"], "工业社会需要新的政治代表结构。"),
  link("b17", "scientific", "darwin1859", "transmission", 4, "科学革命建立的方法和权威，为进化论的冲击创造条件。", ["england", "europe"], "科学权威持续挑战传统解释。"),
  link("b18", "ww1", "versailles1919", "institution", 5, "一战战胜国用凡尔赛体系重建欧洲，但埋下德国复仇和不稳定。", ["france", "england", "usa", "prussia"], "不稳定的和平是二战的重要远因。"),
  link("b19", "versailles1919", "greatDepression", "conflict", 2, "战后债务、赔款和金融脆弱性使经济危机更具政治破坏力。", ["usa", "prussia", "europe"], "经济危机会撕裂脆弱的国际秩序。"),
  link("b20", "greatDepression", "ww2", "conflict", 5, "大萧条削弱自由民主信心并助推极端主义崛起。", ["prussia", "usa", "england", "france"], "经济危机转化为制度危机。"),
  link("b21", "ww2", "holocaust", "conflict", 5, "二战中的纳粹极权将现代国家机器用于种族灭绝。", ["prussia", "europe", "global"], "大屠杀成为战后人权秩序的道德底线。"),
  link("b22", "holocaust", "unNatoEU", "institution", 4, "大屠杀和战争罪推动人权、国际法和欧洲和解制度化。", ["europe", "global", "eu"], "战后秩序不仅是安全安排，也是道德和法律重建。"),
  link("b23", "unNatoEU", "romeTreaty1957", "institution", 5, "欧洲煤钢合作继续发展为罗马条约和共同市场。", ["eu", "france", "prussia", "italy"], "一体化从防止战争走向共同制度。"),
  link("b24", "coldWar", "berlinWall1961", "conflict", 5, "柏林墙把冷战欧洲分裂变成可见边界。", ["prussia", "russia", "usa", "nato"], "德国问题是冷战欧洲的核心。"),
  link("b25", "berlinWall1961", "1989", "split", 5, "柏林墙的倒塌象征冷战欧洲分裂结束。", ["prussia", "russia", "eu"], "同一个城市见证冷战的凝固和崩塌。"),
  link("b26", "oil1973", "financial2008", "institution", 2, "能源冲击后的滞胀和金融化，是后来全球资本主义风险结构的一部分。", ["usa", "eu", "global"], "现代危机越来越通过能源、金融和供应链相互连接。"),
  link("b27", "maastricht", "euro2002", "institution", 4, "马斯特里赫特条约设计的共同货币在 2002 年进入日常生活。", ["eu", "france", "prussia", "italy"], "欧洲一体化从外交工程变成日常制度。"),
  link("b28", "euro2002", "financial2008", "institution", 4, "欧元区在金融危机中暴露共同货币与分散财政之间的矛盾。", ["eu", "france", "prussia", "italy"], "共同制度越深入，危机治理越复杂。"),
  link("b29", "migration2015", "brexit", "split", 4, "移民和边境焦虑成为脱欧与欧洲民粹政治的重要背景。", ["eu", "england", "france", "prussia"], "全球危机进入国内身份政治。"),
  link("b30", "covid", "ai2023", "institution", 2, "疫情加速数字化和远程工作，为生成式 AI 扩散提供社会基础。", ["usa", "eu", "england", "global"], "技术治理成为 2020 年代西方制度竞争的新领域。"),
  link("b31", "ai2023", "west2026", "institution", 2, "到 2026 年，安全、技术和监管共同构成西方国家能力竞争。", ["usa", "eu", "england", "china", "global"], "现代国家竞争不仅是军事，也包括技术规则。")
);

events.push(
  event("clovis", 496, "克洛维受洗", "religion", "cooperation", 1260, ["frankish", "papacy", "france"], ["克洛维", "兰斯主教雷米"], "法兰克国王皈依天主教，使日耳曼王权与罗马教会结盟。", "天主教获得强大蛮族王权支持。", "法兰克王权借罗马教会获得合法性。", { frankish: "法兰克王权与天主教绑定。", papacy: "罗马教会获得西欧保护者。", france: "兰斯加冕传统的远源形成。" }),
  event("gregorianMission", 597, "坎特伯雷传教", "religion", "transmission", 1300, ["england", "papacy"], ["奥古斯丁", "格里高利一世"], "罗马派传教进入英格兰，英格兰教会逐步纳入拉丁基督教世界。", "罗马教会影响扩展到英格兰。", "英格兰王国通过基督教进入欧洲外交和文化网络。", { england: "英格兰拉丁化和教会制度化。", papacy: "教廷对不列颠影响增强。" }),
  event("cordoba", 929, "科尔多瓦哈里发国", "religion", "institution", 1480, ["spain", "islamic", "europe"], ["阿卜杜拉赫曼三世"], "伊比利亚的伊斯兰政权成为地中海知识、贸易和城市文明中心。", "伊斯兰法学、哲学和科学在西欧边缘繁荣。", "基督教王国与伊斯兰政权长期竞争与交流。", { spain: "伊比利亚形成多宗教、多政权格局。", islamic: "安达卢斯成为伊斯兰文明重镇。", europe: "阿拉伯知识经伊比利亚影响欧洲。" }),
  event("concordatWorms", 1122, "沃尔姆斯宗教协定", "religion", "institution", 1680, ["papacy", "hre"], ["卡利克斯特二世", "亨利五世"], "教皇与皇帝在主教任命问题上达成妥协，结束叙任权斗争的高峰。", "教会获得教职授任的精神权威。", "皇帝保留部分世俗封地授予权，但皇权受限。", { papacy: "教权独立原则得到承认。", hre: "皇帝控制教会的能力下降。" }),
  event("francisDominic", 1209, "托钵修会兴起", "religion", "transmission", 1740, ["papacy", "italy", "france", "spain"], ["方济各", "多明我"], "方济各会和多明我会进入城市、大学和民间社会，回应贫困、异端与城市化问题。", "教会通过新修会增强基层动员和思想控制。", "城市社会与教会组织关系更紧密。", { papacy: "教廷获得新的传教和教育工具。", italy: "城市宗教生活活跃。", france: "多明我会参与反异端与大学教育。", spain: "多明我传统后来影响宗教裁判所。" }),
  event("albigensian", 1209, "阿尔比十字军", "religion", "conflict", 1750, ["papacy", "france"], ["英诺森三世", "西蒙·德·蒙福尔"], "教廷号召讨伐法国南部卡特里派，宗教镇压与法国王权扩张相互结合。", "教会用军事手段打击异端。", "法国王权向南部扩张，地方贵族独立性下降。", { papacy: "反异端机制强化。", france: "南法被更深纳入法国王权。" }),
  event("avignonPapacy", 1309, "阿维尼翁教廷", "religion", "conflict", 1830, ["papacy", "france", "italy"], ["克莱孟五世", "腓力四世"], "教廷迁至阿维尼翁，被视为受法国王权影响，损害教会普世威望。", "教皇独立性受质疑。", "法国王权对教廷影响显著上升。", { papacy: "教廷声望下降。", france: "法国王权在欧洲宗教政治中影响增强。", italy: "罗马地位受到冲击。" }),
  event("greatSchism", 1378, "西方教会大分裂", "religion", "split", 1900, ["papacy", "france", "england", "hre", "spain"], ["罗马教皇", "阿维尼翁教皇"], "多个教皇并立，欧洲国家按政治利益选择支持对象，教会权威严重受损。", "教会统一性受到重大破坏。", "国家利益公开介入教会忠诚选择。", { papacy: "普世权威受重创。", france: "支持阿维尼翁系。", england: "多与法国相反，支持罗马系。", hre: "帝国诸侯选择分化。" }),
  event("councilConstance", 1414, "康斯坦茨会议", "religion", "institution", 1960, ["papacy", "hre", "france", "england"], ["西吉斯蒙德", "胡斯"], "大公会议结束教会分裂，同时处死胡斯，暴露改革呼声与教权维护之间的张力。", "会议主义一度挑战教皇绝对权威。", "皇帝和各国代表参与解决教会危机。", { papacy: "分裂结束但改革压力仍在。", hre: "波希米亚胡斯运动激化。", france: "参与教会秩序重建。", england: "大学和神学改革思潮继续传播。" }),
  event("reconquista1492", 1492, "格拉纳达陷落", "monarchy", "conflict", 2100, ["spain", "islamic", "papacy"], ["伊莎贝拉一世", "斐迪南二世"], "西班牙完成收复失地运动，同年开启大航海，天主教王权与海外扩张结合。", "天主教统一成为西班牙国家身份核心。", "王权通过宗教统一、驱逐和海外扩张强化国家。", { spain: "天主教王权达到高峰并转向海外帝国。", islamic: "伊比利亚伊斯兰政权终结。", papacy: "西班牙成为天主教扩张主力。" }),
  event("spanishInquisition", 1478, "西班牙宗教裁判所", "religion", "conflict", 2055, ["spain", "papacy"], ["伊莎贝拉一世", "托尔克马达"], "西班牙王权利用宗教裁判所强化信仰统一和社会控制。", "异端、改宗者和宗教少数群体受到高压审查。", "王权把宗教机构纳入国家统一工具。", { spain: "宗教统一服务于王权集中。", papacy: "教廷授权但西班牙王权控制强。" }),
  event("councilTrent", 1545, "特伦托会议", "religion", "institution", 2290, ["papacy", "spain", "france", "hre", "italy"], ["保罗三世", "耶稣会士"], "天主教会回应宗教改革，澄清教义、整顿纪律，开启反宗教改革。", "天主教制度和教义边界更加清晰。", "天主教王权获得反新教的意识形态工具。", { papacy: "教廷重整权威。", spain: "成为反宗教改革主力。", hre: "天主教诸侯得到动员。", france: "天主教与胡格诺冲突加剧。" }),
  event("jesuits", 1540, "耶稣会成立", "religion", "transmission", 2280, ["papacy", "spain", "france", "china", "global"], ["依纳爵·罗耀拉", "利玛窦"], "耶稣会通过教育、宫廷顾问和海外传教成为天主教改革的重要力量。", "天主教全球传教和精英教育增强。", "王权和教廷都借助耶稣会教育治理精英。", { papacy: "获得全球化传教组织。", spain: "海外帝国传教增强。", france: "耶稣会教育影响精英。", china: "利玛窦等传教士进入中西交流。" }),
  event("stBartholomew", 1572, "圣巴托洛缪惨案", "religion", "conflict", 2360, ["france", "papacy"], ["凯瑟琳·德·美第奇", "胡格诺领袖"], "法国天主教与新教冲突爆发大屠杀，宗教内战显示国家统一的脆弱。", "宗教身份成为政治暴力边界。", "法国王权在派系与宗教之间摇摆。", { france: "宗教战争加深王权危机。", papacy: "天主教阵营与法国政治纠缠。" }),
  event("edictNantes", 1598, "南特敕令", "monarchy", "institution", 2400, ["france"], ["亨利四世"], "法国王权给予胡格诺有限信仰自由，以国家秩序压过宗教内战。", "宗教宽容以王权命令形式出现。", "王权成为结束宗教战争的最高仲裁者。", { france: "国家统一优先于教派纯粹性。" }),
  event("patriarchMoscow", 1589, "莫斯科牧首区成立", "religion", "institution", 2390, ["russia", "easternRome"], ["约伯牧首", "莫斯科大公国"], "莫斯科获得牧首地位，俄罗斯东正教独立性增强，第三罗马想象制度化。", "东正教中心从拜占庭遗产转向莫斯科。", "沙皇权威与东正教身份更紧密。", { russia: "宗教和帝国身份结合。", easternRome: "拜占庭传统被俄罗斯继承。" }),
  event("peterGreat", 1721, "彼得大帝改革", "monarchy", "institution", 2650, ["russia", "europe"], ["彼得大帝"], "俄罗斯废除牧首制、建立圣务院，并向西欧学习行政、军事和技术。", "东正教被更直接纳入国家控制。", "沙皇国家现代化和军事化增强。", { russia: "国家控制教会并推进西化。", europe: "俄罗斯作为欧洲列强进入均势政治。" }),
  event("polishPartitions", 1772, "瓜分波兰", "monarchy", "conflict", 2800, ["russia", "prussia", "austria", "europe"], ["叶卡捷琳娜二世", "腓特烈二世", "玛丽亚·特蕾莎"], "俄普奥多次瓜分波兰，显示列强均势和民族国家缺位的残酷逻辑。", "天主教波兰身份在亡国中强化。", "列强通过领土扩张重塑东欧。", { russia: "向西扩张。", prussia: "获得连接领土。", austria: "参与东欧扩张。", europe: "民族自决与列强政治矛盾加深。" }),
  event("greekIndependence", 1821, "希腊独立战争", "monarchy", "conflict", 3050, ["greece", "easternRome", "russia", "england", "france"], ["希腊起义者", "拜伦"], "希腊从奥斯曼统治下独立，古典想象、东正教身份和欧洲列强干预交织。", "东正教和民族身份相互支持。", "列强干预重塑巴尔干秩序。", { greece: "现代希腊国家建立。", russia: "以东正教保护者自居。", england: "参与地中海均势。", france: "支持希腊独立提升影响。" }),
  event("crimeanWar", 1853, "克里米亚战争", "modern", "conflict", 3180, ["russia", "england", "france", "easternRome"], ["尼古拉一世", "拿破仑三世", "维多利亚时代政治家"], "俄国与英法围绕奥斯曼、圣地和黑海发生战争，暴露俄罗斯落后并重塑欧洲均势。", "圣地保护权和东正教保护名义卷入地缘政治。", "列强用战争限制俄罗斯扩张。", { russia: "战败推动改革压力。", england: "维护通往印度和地中海利益。", france: "拿破仑三世提升国际地位。" }),
  event("vaticanI", 1870, "第一次梵蒂冈会议", "religion", "institution", 3260, ["papacy", "italy", "france"], ["庇护九世"], "教皇无误论确立，同年教皇国被意大利吞并，教廷精神权威和世俗权力分离更明显。", "教皇精神权威被神学上强化。", "世俗国家削弱教皇领土统治。", { papacy: "失去教皇国后转向精神权威。", italy: "罗马成为统一意大利首都。", france: "天主教政治与共和世俗主义继续冲突。" }),
  event("laicite1905", 1905, "法国政教分离法", "revolution", "secularization", 3380, ["france", "papacy"], ["第三共和国政治家"], "法国确立国家与教会分离原则，世俗共和身份制度化。", "天主教会在公共权力中的地位大幅下降。", "共和国把教育、公共空间和法律从教会影响中分离。", { france: "世俗主义成为共和核心原则。", papacy: "与法国共和国关系紧张。" }),
  event("lateran1929", 1929, "拉特兰条约", "religion", "institution", 3545, ["papacy", "italy"], ["庇护十一世", "墨索里尼"], "意大利承认梵蒂冈城国，教廷承认意大利国家，解决罗马问题。", "教廷以小领土国家形式保障精神独立。", "意大利国家与教廷达成政治妥协。", { papacy: "获得梵蒂冈主权。", italy: "完成与教廷关系正常化。" }),
  event("vaticanII", 1962, "第二次梵蒂冈会议", "religion", "institution", 3925, ["papacy", "europe", "global"], ["约翰二十三世", "保罗六世"], "天主教会更新礼仪、宗教自由和与现代世界关系，回应世俗化和全球化。", "教会更强调对话、地方语言礼仪和宗教自由。", "教会减少对旧式政治权力的依附。", { papacy: "天主教进入现代化改革阶段。", europe: "传统天主教社会继续世俗化。", global: "全球南方天主教重要性上升。" }),
  event("goodFriday1998", 1998, "北爱尔兰和平协议", "modern", "institution", 4160, ["england", "europe"], ["托尼·布莱尔", "北爱各方"], "协议缓和新教联合派与天主教民族派冲突，显示宗教身份、民族归属和国家边界的复杂关系。", "宗教身份仍影响政治归属，但暴力被制度谈判替代。", "英国、爱尔兰和地方自治共同管理冲突。", { england: "英国处理内部民族和宗教裂痕。", europe: "欧盟背景下边界软化有助和平。" }),
  event("lisbon2009", 2009, "《里斯本条约》", "modern", "institution", 4290, ["eu", "france", "prussia", "england", "italy"], ["欧盟成员国领导人"], "欧盟改革机构、强化欧洲议会和外交代表，试图提升扩大后的治理效率。", "宗教作为欧洲价值讨论的一部分存在。", "成员国继续让渡和协调部分主权。", { eu: "欧盟机构能力增强。", england: "英国疑欧政治继续累积。", france: "推动欧盟政治能力。", prussia: "德国在欧盟治理中影响上升。" }),
  event("crimea2014", 2014, "克里米亚危机", "modern", "conflict", 4330, ["russia", "ukraine", "eu", "nato", "usa"], ["普京", "乌克兰临时政府"], "俄罗斯吞并克里米亚，冷战后欧洲边界不可更改原则受到冲击。", "东正教和历史叙事被用于身份合法性争夺。", "欧洲安全秩序开始转向对俄威慑。", { russia: "与西方关系恶化。", ukraine: "主权和领土完整遭挑战。", eu: "启动制裁。", nato: "东翼安全重要性上升。" }),
  event("paris2015", 2015, "巴黎恐袭", "modern", "conflict", 4355, ["france", "eu", "nato", "global"], ["法国政府", "ISIS"], "恐袭加剧法国关于安全、世俗主义、移民和伊斯兰关系的争论。", "宗教极端主义与普通穆斯林共同体区分成为公共难题。", "国家安全权力和社会整合政策强化。", { france: "安全国家能力增强，世俗主义争论升温。", eu: "边境和情报合作压力上升。", global: "反恐与宗教政治继续交织。" })
);

links.push(
  link("c1", "westFall", "clovis", "cooperation", 4, "西罗马崩溃后，法兰克王权通过皈依天主教获得罗马教会支持。", ["frankish", "papacy", "france"], "蛮族王权和罗马教会结盟是中世纪西欧秩序的关键。"),
  link("c2", "clovis", "gregorianMission", "transmission", 2, "拉丁基督教从法兰克和罗马中心继续向英格兰传播。", ["papacy", "england", "france"], "西欧宗教共同体逐步扩大。"),
  link("c3", "islam", "cordoba", "institution", 3, "伊斯兰扩张在伊比利亚形成高水平城市和知识中心。", ["islamic", "spain"], "西方与伊斯兰世界既竞争也交流。"),
  link("c4", "canossa", "concordatWorms", "institution", 4, "卡诺莎之后，叙任权斗争通过沃尔姆斯协定进入妥协。", ["papacy", "hre"], "教权和皇权开始以制度边界处理冲突。"),
  link("c5", "universities", "francisDominic", "transmission", 2, "大学和城市为托钵修会提供传播、辩论和教育场景。", ["papacy", "italy", "france"], "教会适应城市社会。"),
  link("c6", "francisDominic", "albigensian", "conflict", 2, "反异端、托钵修会和军事镇压共同构成教会回应异端的工具箱。", ["papacy", "france"], "宗教统一和国家扩张交织。"),
  link("c7", "hundredYears", "avignonPapacy", "conflict", 3, "法国王权上升与教廷受法国影响相互关联。", ["france", "papacy"], "民族王权开始压迫普世教权。"),
  link("c8", "avignonPapacy", "greatSchism", "split", 5, "阿维尼翁时期削弱教廷声望，最终导致西方教会大分裂。", ["papacy", "france", "england"], "教会危机给宗教改革预演了权威崩塌。"),
  link("c9", "greatSchism", "councilConstance", "institution", 4, "大分裂迫使欧洲用大公会议解决教会危机。", ["papacy", "hre", "france", "england"], "会议主义挑战教皇权威。"),
  link("c10", "councilConstance", "reformation", "transmission", 3, "胡斯运动和会议改革失败为路德改革提供前史。", ["hre", "papacy"], "宗教改革不是突然出现的。"),
  link("c11", "spanishInquisition", "reconquista1492", "cooperation", 4, "宗教裁判所和收复失地共同服务于西班牙天主教王权统一。", ["spain", "papacy"], "西班牙国家建构高度宗教化。"),
  link("c12", "reconquista1492", "columbus", "expansion", 5, "格拉纳达陷落同年，西班牙把天主教王权的扩张转向大西洋。", ["spain", "global"], "国内宗教统一和海外帝国扩张同步发生。"),
  link("c13", "reformation", "councilTrent", "conflict", 5, "天主教会通过特伦托会议回应新教挑战。", ["papacy", "spain", "hre", "france"], "欧洲宗教版图从改革进入反改革。"),
  link("c14", "councilTrent", "jesuits", "transmission", 4, "耶稣会成为特伦托改革精神的执行者之一。", ["papacy", "spain", "france", "global"], "教育和传教成为天主教复兴工具。"),
  link("c15", "reformation", "stBartholomew", "conflict", 4, "宗教改革在法国转化为天主教与胡格诺之间的暴力政治。", ["france", "papacy"], "教派分裂会撕裂王国。"),
  link("c16", "stBartholomew", "edictNantes", "institution", 4, "法国宗教战争最终通过王权敕令暂时平息。", ["france"], "国家秩序开始压过宗教纯粹性。"),
  link("c17", "constantinople1453", "patriarchMoscow", "transmission", 3, "拜占庭灭亡后，莫斯科逐渐继承东正教中心想象。", ["russia", "easternRome"], "东正教传统转入俄罗斯国家叙事。"),
  link("c18", "patriarchMoscow", "peterGreat", "institution", 4, "莫斯科东正教权威后来被彼得大帝纳入国家控制。", ["russia"], "俄罗斯展示国家控制教会的另一种路径。"),
  link("c19", "vienna", "polishPartitions", "conflict", 2, "列强均势政治延续了瓜分波兰式的领土逻辑。", ["russia", "prussia", "austria"], "民族原则与列强现实政治冲突。"),
  link("c20", "greekIndependence", "crimeanWar", "conflict", 3, "东正教保护、奥斯曼衰落和列强干预继续引发克里米亚战争。", ["russia", "england", "france"], "宗教名义常被地缘政治利用。"),
  link("c21", "italyGermany", "vaticanI", "secularization", 4, "意大利统一夺取罗马，迫使教廷转向精神权威。", ["italy", "papacy"], "民族国家压缩教会世俗领土。"),
  link("c22", "vaticanI", "lateran1929", "institution", 3, "罗马问题最终通过拉特兰条约解决。", ["papacy", "italy"], "现代国家和教廷达成新型共存。"),
  link("c23", "frenchRevolution", "laicite1905", "secularization", 5, "法国革命的去教权化传统在 1905 年政教分离法中制度化。", ["france", "papacy"], "法国成为西方世俗国家的典型路径。"),
  link("c24", "vaticanII", "1968", "secularization", 2, "第二次梵蒂冈会议和 1968 社会运动都回应现代社会变化，但方向不同。", ["papacy", "europe"], "宗教改革与社会自由化共同重塑现代价值。"),
  link("c25", "goodFriday1998", "brexit", "split", 3, "北爱和平依赖软边界，脱欧重新激活边界和身份问题。", ["england", "eu"], "现代欧洲仍受宗教身份和国家边界影响。"),
  link("c26", "maastricht", "lisbon2009", "institution", 3, "欧盟从马斯特里赫特继续通过里斯本条约增强治理能力。", ["eu", "france", "prussia"], "欧洲一体化不断修补制度效率。"),
  link("c27", "crimea2014", "ukraine2022", "conflict", 5, "克里米亚危机是 2022 年全面战争的重要前奏。", ["russia", "ukraine", "eu", "nato"], "欧洲安全危机并非突然爆发。"),
  link("c28", "migration2015", "paris2015", "conflict", 2, "移民、恐袭和宗教身份争论在 2015 年欧洲政治中相互叠加。", ["france", "eu"], "安全和多元社会成为同一问题的两面。")
);

const routes = {
  westernMain: {
    title: "从古文明到现代西方主线",
    description: "沿着法、信仰、帝国、教会、国家、革命和联盟制度看一条最粗的历史骨架。",
    guidingQuestion: "西方秩序为什么会从古代法典、城邦和教会，走向现代国家、联盟与安全竞争？",
    audience: "适合想先建立完整脉络的泛历史爱好者",
    eventIds: ["egypt", "mesopotamia", "hebrew", "persia", "athens", "alexander", "romanRepublic", "augustus", "jesus", "constantine", "nicaea", "division", "westFall", "justinian", "tours", "charlemagne", "verdun", "norman1066", "universities", "magnaCarta", "hundredYears", "blackDeath", "constantinople1453", "renaissance", "printing", "columbus", "reformation", "westphalia", "enlightenment", "frenchRevolution", "napoleon", "vienna", "industrial", "1848", "italyGermany", "imperialism", "ww1", "russianRev", "ww2", "unNatoEU", "coldWar", "decolonization", "1968", "1989", "maastricht", "911", "financial2008", "brexit", "covid", "ukraine2022", "swedenNato", "west2026"]
  },
  churchCrown: {
    title: "宗教与王权如何缠绕？",
    description: "看犹太传统、基督教、教廷、皇权、宗教改革和世俗国家之间的关系。",
    guidingQuestion: "宗教权威怎样给王权提供合法性，又怎样被现代国家逐步限制？",
    audience: "适合关注教会、皇权和世俗化的人",
    eventIds: ["hebrew", "jesus", "constantine", "division", "westFall", "charlemagne", "schism1054", "canossa", "crusades", "reformation", "anglican", "westphalia", "frenchRevolution", "west2026"]
  },
  stateMaking: {
    title: "现代国家如何形成？",
    description: "从罗马法、王权集中、战争财政、革命、民族统一到欧盟与北约。",
    guidingQuestion: "现代国家为什么既需要主权集中，又不断被法律、议会、联盟和市场约束？",
    audience: "适合关注制度、战争财政和国际秩序的人",
    eventIds: ["romanRepublic", "augustus", "magnaCarta", "hundredYears", "westphalia", "louisXIV", "glorious", "frenchRevolution", "napoleon", "vienna", "industrial", "italyGermany", "ww1", "ww2", "unNatoEU", "maastricht", "west2026"]
  },
  modernCrisis: {
    title: "20-21 世纪危机链",
    description: "看大战、冷战、去殖民化、全球化危机、脱欧、疫情和俄乌战争如何重塑西方。",
    guidingQuestion: "现代西方为什么总在安全、全球化、主权和共同治理之间摇摆？",
    audience: "适合关注当代政治和危机连锁的人",
    eventIds: ["ww1", "russianRev", "ww2", "unNatoEU", "coldWar", "decolonization", "1968", "1989", "maastricht", "911", "financial2008", "brexit", "covid", "ukraine2022", "swedenNato", "west2026"]
  }
};

const storyScenes = {
  westernMain: [
    { eventId: "egypt", title: "神庙、法老与秩序的想象", yearLabel: "前3000", narrative: "故事从尼罗河畔开始。法老把神圣秩序、工程能力和政治统治绑在一起，让后来的地中海世界看到一种早期国家的样子。", bridgeToNext: "但秩序不只可以刻在纪念碑上，也可以被写进法律。", mood: "origin" },
    { eventId: "mesopotamia", title: "法律第一次站到公共视野里", yearLabel: "前1792", narrative: "在两河流域，成文法把裁判、等级和惩罚固定下来。它不是现代平等法治，却让权力必须面对一套可引用的规则。", bridgeToNext: "接下来，规则会进入信仰，变成高于君王的道德语言。", mood: "law" },
    { eventId: "hebrew", title: "高于王权的律法", yearLabel: "前1000", narrative: "犹太传统把王权放在神圣律法和先知批判之下。西方政治里关于权力边界的许多词汇，都可以在这里找到远源。", bridgeToNext: "同一片近东世界里，帝国治理也在扩大历史的尺度。", mood: "faith" },
    { eventId: "persia", title: "帝国道路与行省治理", yearLabel: "前550", narrative: "波斯帝国用道路、行省和多民族治理连接近东。它给希腊城邦带来压力，也让希腊人开始更清楚地定义自己。", bridgeToNext: "镜头转向爱琴海，城邦政治开始登场。", mood: "empire" },
    { eventId: "athens", title: "公民在广场上发明政治", yearLabel: "前508", narrative: "雅典不是现代民主，却让公民、法律、辩论和公共决策成为政治想象的一部分。西方后来的共和与民主，会不断回望这里。", bridgeToNext: "城邦很小，但希腊文化很快会被带到更辽阔的世界。", mood: "civic" },
    { eventId: "alexander", title: "希腊化世界打开通道", yearLabel: "前334", narrative: "亚历山大东征让希腊语言、城市和知识网络穿过埃及与西亚。帝国迅速分裂，但文化通道被打开了。", bridgeToNext: "真正把制度、法律和扩张结合起来的，将是罗马。", mood: "crossroads" },
    { eventId: "romanRepublic", title: "共和国成为扩张机器", yearLabel: "前509", narrative: "罗马共和国把公民身份、法律、元老院和军队组织在一起。它的制度想象后来会穿过文艺复兴和近代革命。", bridgeToNext: "但扩张也会反噬共和国本身。", mood: "republic" },
    { eventId: "augustus", title: "共和国外壳下的帝国", yearLabel: "前27", narrative: "奥古斯都用恢复秩序的名义集中权力。道路、城市、法律和军队把地中海变成一个政治空间。", bridgeToNext: "正是在这个空间里，一个边缘信仰开始传播。", mood: "imperial" },
    { eventId: "jesus", title: "帝国边缘出现新的共同体", yearLabel: "30", narrative: "耶稣运动从犹太社会内部兴起，又借罗马城市和道路扩散。它带来一种超越帝国的精神权威。", bridgeToNext: "当信仰进入帝国合法秩序，欧洲历史的重心会改变。", mood: "faith" },
    { eventId: "constantine", title: "基督教进入帝国", yearLabel: "313", narrative: "君士坦丁让基督教获得合法地位。教会从边缘共同体进入公共秩序，信仰和国家权力开始长期缠绕。", bridgeToNext: "合法化之后，教义争端也会变成帝国事务。", mood: "throne" },
    { eventId: "nicaea", title: "正统被制度化", yearLabel: "325", narrative: "尼西亚会议显示皇帝与主教共同塑造正统。信仰不再只是民间共同体的事，而成为帝国治理的一部分。", bridgeToNext: "帝国看似统一，东西分化却已经在加深。", mood: "council" },
    { eventId: "division", title: "东西罗马走向不同命运", yearLabel: "395", narrative: "东西分治让政治中心、语言传统和教会环境逐渐错位。西部会崩塌，东部则继续以罗马身份延续。", bridgeToNext: "西部权力真空，会让教会成为新的稳定力量。", mood: "split" },
    { eventId: "westFall", title: "西罗马退场，教会留下", yearLabel: "476", narrative: "西部帝国皇位终结并不等于文明消失，而是权威形式改变。王国并立，教会成为跨地域组织。", bridgeToNext: "东部罗马还在，它会把罗马法保存成另一条遗产。", mood: "afterfall" },
    { eventId: "justinian", title: "罗马法被重新整理", yearLabel: "529", narrative: "查士丁尼法典把罗马法系统化，后来经大学和教会法进入欧洲大陆传统。法律记忆没有随西罗马一起消失。", bridgeToNext: "与此同时，西欧也在与外部力量的碰撞中定义自己。", mood: "law" },
    { eventId: "tours", title: "边界记忆开始成形", yearLabel: "732", narrative: "图尔战役后来被塑造成基督教西欧抵御外部扩张的记忆。无论神话如何放大，它都参与了欧洲身份叙事。", bridgeToNext: "法兰克力量上升，教皇会找到新的保护者。", mood: "frontier" },
    { eventId: "charlemagne", title: "教皇与皇帝互相需要", yearLabel: "800", narrative: "查理曼加冕把法兰克王权、罗马帝国名义和拉丁基督教世界连接起来。合作与竞争同时开始。", bridgeToNext: "统一帝国很快分裂，法国和德意志的远影出现。", mood: "crown" },
    { eventId: "verdun", title: "帝国三分，欧洲分岔", yearLabel: "843", narrative: "凡尔登条约让查理曼帝国走向分裂。西法兰克、东法兰克和中部王国，预示着法国、德意志和意大利的长期分化。", bridgeToNext: "另一边，英格兰也会被大陆政治深深卷入。", mood: "split" },
    { eventId: "norman1066", title: "英格兰被拉回大陆", yearLabel: "1066", narrative: "诺曼征服重组英格兰贵族、土地和王权，也把英格兰纳入英法封建关系。英法纠缠由此加深。", bridgeToNext: "治理越来越复杂，欧洲开始需要稳定的知识机构。", mood: "kingdom" },
    { eventId: "universities", title: "大学训练出欧洲的理性工具", yearLabel: "1088", narrative: "中世纪大学让神学、法学和辩论制度化。教会、王权和城市都需要受教育的人来管理世界。", bridgeToNext: "当王权扩张，法律也会反过来限制国王。", mood: "knowledge" },
    { eventId: "magnaCarta", title: "国王第一次被迫签下边界", yearLabel: "1215", narrative: "《大宪章》不是民主的终点，却是王权受法律和共同体约束的重要象征。英国宪政传统从这里获得了记忆。", bridgeToNext: "接下来，战争会把王国变成更集中的国家。", mood: "charter" },
    { eventId: "hundredYears", title: "长期战争锻造国家", yearLabel: "1337", narrative: "英法百年战争让税收、军队和民族认同被推到前台。战争不是制度之外的灾难，它本身塑造国家。", bridgeToNext: "但一场瘟疫会让欧洲社会从内部松动。", mood: "war" },
    { eventId: "blackDeath", title: "黑死病撼动旧秩序", yearLabel: "1347", narrative: "瘟疫带来巨大死亡，也削弱封建劳役和宗教解释权。劳动力、信仰和社会结构都被迫重估。", bridgeToNext: "而在东方，拜占庭的终结会把古典遗产推向意大利。", mood: "rupture" },
    { eventId: "constantinople1453", title: "最后的罗马城陷落", yearLabel: "1453", narrative: "君士坦丁堡陷落让拜占庭政治实体终结，希腊文本和学者西迁，也刺激欧洲寻找海上通路。", bridgeToNext: "古典文本、城市财富和赞助者，会共同点燃文艺复兴。", mood: "threshold" },
    { eventId: "renaissance", title: "人重新站到画面中央", yearLabel: "1450", narrative: "文艺复兴让古典遗产、人文主义和城市赞助改变欧洲气质。人开始以新的方式观察政治、艺术和自身。", bridgeToNext: "但思想要真正扩散，还需要一种传播机器。", mood: "rebirth" },
    { eventId: "printing", title: "印刷术让思想长出翅膀", yearLabel: "1455", narrative: "古腾堡印刷术降低文本传播成本。圣经、小册子、科学书和政治文字开始越过旧权威。", bridgeToNext: "欧洲的视野也会越过大陆，抵达海洋彼端。", mood: "media" },
    { eventId: "columbus", title: "欧洲历史变成全球史", yearLabel: "1492", narrative: "大航海把欧洲带入全球贸易、殖民和灾难性征服。西方秩序从地区史转向世界史。", bridgeToNext: "回到欧洲内部，印刷和信仰危机将撕开教会统一。", mood: "ocean" },
    { eventId: "reformation", title: "信仰分裂成为政治问题", yearLabel: "1517", narrative: "宗教改革挑战罗马教会权威，也让诸侯和国家开始控制本地教会。神学争论迅速变成权力问题。", bridgeToNext: "漫长宗教战争之后，欧洲会寻找新的国家规则。", mood: "rupture" },
    { eventId: "westphalia", title: "国家开始彼此承认", yearLabel: "1648", narrative: "威斯特伐利亚把宗教战争和王朝竞争纳入外交安排。主权国家体系的叙事从这里变得清晰。", bridgeToNext: "当国家稳定下来，思想家会重新追问权威从哪里来。", mood: "state" },
    { eventId: "enlightenment", title: "理性开始审判旧权威", yearLabel: "1687", narrative: "科学革命、公共舆论和宪政经验让启蒙思想挑战神授王权。自然权利和社会契约变成新的政治语言。", bridgeToNext: "这些语言会先在革命中获得身体。", mood: "reason" },
    { eventId: "frenchRevolution", title: "主权从国王转向人民", yearLabel: "1789", narrative: "法国大革命把人民主权、共和、世俗化和民族动员推上欧洲舞台。旧制度再也无法假装稳固。", bridgeToNext: "革命的火焰会被一个军事天才制度化并带向全欧。", mood: "revolution" },
    { eventId: "napoleon", title: "革命穿上帝国军装", yearLabel: "1799", narrative: "拿破仑用法典、行政和战争传播革命成果，也迫使欧洲列强寻找新的均势。", bridgeToNext: "战争结束后，保守秩序会试图把欧洲重新锁住。", mood: "campaign" },
    { eventId: "vienna", title: "保守均势重建欧洲", yearLabel: "1815", narrative: "维也纳体系用均势和正统原则压制革命扩散。它稳定了欧洲，也把自由和民族问题暂时压在地底。", bridgeToNext: "另一种更深的力量正在工厂和煤矿里形成。", mood: "balance" },
    { eventId: "industrial", title: "机器改变国家的肌肉", yearLabel: "1760", narrative: "工业革命改变生产、城市、资本和国家能力。谁能动员煤铁、工厂和金融，谁就拥有新的权力。", bridgeToNext: "被压抑的自由主义和民族主义，会在 1848 年爆发。", mood: "industry" },
    { eventId: "1848", title: "革命失败，但议题留下", yearLabel: "1848", narrative: "1848 年革命多被镇压，却让宪法、民族、社会问题进入欧洲政治议程。失败不是终点，而是转向现实政治。", bridgeToNext: "民族统一将不再只靠理想，而靠战争和国家能力。", mood: "uprising" },
    { eventId: "italyGermany", title: "民族国家改写均势", yearLabel: "1871", narrative: "意大利和德国统一改变欧洲力量结构。尤其德国的崛起，让旧均势变得危险。", bridgeToNext: "工业国家会把竞争推向世界殖民空间。", mood: "nation" },
    { eventId: "imperialism", title: "欧洲把竞争投向全球", yearLabel: "1884", narrative: "帝国主义瓜分世界把工业、资本、军事和文明论捆在一起。欧洲内部竞争获得了全球战场。", bridgeToNext: "这些张力最终会在 1914 年爆炸。", mood: "empire" },
    { eventId: "ww1", title: "旧帝国在总体战中崩塌", yearLabel: "1914", narrative: "第一次世界大战摧毁旧帝国，也打开民族自决、极端主义和美国介入欧洲的时代。", bridgeToNext: "战争压力首先会在俄罗斯引爆制度革命。", mood: "catastrophe" },
    { eventId: "russianRev", title: "革命变成制度挑战", yearLabel: "1917", narrative: "俄国革命建立社会主义国家，让西方资本主义和自由民主第一次面对完整的制度竞争者。", bridgeToNext: "一战没有解决秩序问题，反而留下更大的战争伏笔。", mood: "red" },
    { eventId: "ww2", title: "灾难迫使制度重建", yearLabel: "1939", narrative: "第二次世界大战让法西斯、总体战和大屠杀成为西方无法回避的创伤。战后秩序必须重新设计。", bridgeToNext: "新的西方将由国际组织、联盟和一体化支撑。", mood: "ruins" },
    { eventId: "unNatoEU", title: "废墟上搭起制度支架", yearLabel: "1945", narrative: "联合国、北约和欧洲一体化分别回应国际秩序、安全和大陆和解。西方中心从欧洲转向美国领导。", bridgeToNext: "但新的秩序很快被冷战分成两半。", mood: "institutions" },
    { eventId: "coldWar", title: "铁幕划开欧洲", yearLabel: "1947", narrative: "冷战把自由民主资本主义和苏联社会主义阵营推入长期对峙。军事联盟、市场制度和意识形态共同塑造西方身份。", bridgeToNext: "欧洲殖民帝国也在这个新世界里迅速退场。", mood: "iron" },
    { eventId: "decolonization", title: "帝国退场，世界改写", yearLabel: "1947", narrative: "去殖民化让欧洲从帝国支配转向民族国家和国际组织秩序。西方影响仍在，但形式变了。", bridgeToNext: "在西方社会内部，价值观也将迎来一次大震动。", mood: "global" },
    { eventId: "1968", title: "社会价值被重新谈判", yearLabel: "1968", narrative: "学生、民权、反战和女性解放运动重塑西方社会。政治不再只围绕国家，也围绕身体、文化和身份。", bridgeToNext: "冷战末期，这些社会力量会与制度危机一起改变欧洲。", mood: "culture" },
    { eventId: "1989", title: "墙倒下，问题没有结束", yearLabel: "1989", narrative: "东欧剧变和德国统一打开冷战后的欧洲。许多人以为历史告一段落，新的边界问题却刚刚开始。", bridgeToNext: "欧洲会用更深的一体化来管理统一后的大陆。", mood: "opening" },
    { eventId: "maastricht", title: "欧洲把共同市场推向联盟", yearLabel: "1992", narrative: "马斯特里赫特条约开启欧盟阶段。共同货币、公民身份和更强机构合作，让主权被重新分层。", bridgeToNext: "但 21 世纪的安全冲击会让西方重新紧张。", mood: "union" },
    { eventId: "911", title: "安全国家回到前台", yearLabel: "2001", narrative: "9·11 和反恐战争改变安全政策、移民讨论和宗教政治关系。西方开始在自由和安全之间重新摆动。", bridgeToNext: "随后，金融危机会打击全球化共识。", mood: "security" },
    { eventId: "financial2008", title: "市场神话出现裂缝", yearLabel: "2008", narrative: "全球金融危机冲击新自由主义共识，也暴露欧元区制度缺陷。国家和央行重新成为主角。", bridgeToNext: "经济焦虑会转化为主权和身份政治。", mood: "crisis" },
    { eventId: "brexit", title: "主权反弹撕开一体化", yearLabel: "2016", narrative: "英国脱欧显示全球化、移民、身份和主权的张力。欧洲一体化不再只是向前推进的故事。", bridgeToNext: "紧接着，公共卫生危机会检验国家能力。", mood: "split" },
    { eventId: "covid", title: "疫情暴露治理韧性", yearLabel: "2020", narrative: "新冠疫情考验科学信任、边境政策、供应链和社会团结。国家能力再次成为政治中心。", bridgeToNext: "而欧洲安全，会被一场全面战争彻底改写。", mood: "fragile" },
    { eventId: "ukraine2022", title: "战争重启欧洲安全问题", yearLabel: "2022", narrative: "俄乌战争把主权边界、能源、安全联盟和欧洲责任重新推到中心。冷战后的秩序假设被打碎。", bridgeToNext: "北欧中立传统也会随之转向。", mood: "war" },
    { eventId: "swedenNato", title: "中立传统转向联盟防御", yearLabel: "2024", narrative: "芬兰和瑞典加入北约，显示欧洲安全结构正在重组。联盟重新成为安全想象的核心。", bridgeToNext: "故事最后落到仍在展开的 2026 年。", mood: "alliance" },
    { eventId: "west2026", title: "一个仍在展开的西方秩序", yearLabel: "2026", narrative: "到 2026 年，欧洲仍在安全、财政、援助、扩员和战略自主之间寻找平衡。西方历史不是结论，而是持续调整的过程。", bridgeToNext: "你可以回到全图，沿任意事件继续探索这张大网。", mood: "open" }
  ]
};

const learningContent = {
  mesopotamia: learningEntry("成文法把统治者的裁判变成可公开引用的规则，城市社会因此能在等级秩序中维持交易和惩罚标准。", "它留下了后世讨论法律、王权和正义时常会回看的早期样本。", "约当中国夏商之际，两河城市用法典组织社会，中国则在王朝和礼制传统中形成权力结构。", "汉谟拉比法典不是现代平等法治，它仍然服务于等级社会。", "为什么成文法会成为西方制度想象的远源？", ["它让法律可以脱离口头裁判被保存和引用", "它直接建立了现代议会制度", "它废除了国王的权力"], "它让法律可以脱离口头裁判被保存和引用"),
  hebrew: learningEntry("犹太传统把王权放在更高的神圣律法和先知批判之下，形成一种能约束君主的道德语言。", "契约、律法和一神信仰后来进入基督教，成为欧洲政治伦理的重要底层资源。", "约当中国西周前后，西周强调天命和礼制，犹太传统强调契约、律法与先知批判。", "它不只是宗教起源故事，也是一套关于权力边界的政治想象。", "犹太一神传统给后来的欧洲政治留下了什么？", ["高于王权的律法和道德批判语言", "成熟的现代政党制度", "民族国家的固定边界"], "高于王权的律法和道德批判语言"),
  athens: learningEntry("雅典的公民共同体在城邦规模内实践辩论、抽签、法律和公共决策。", "它为后世共和主义、民主和公民身份提供了古典词汇，虽然范围远小于现代民主。", "约当中国春秋战国之际，中国诸子讨论秩序和君主治理，希腊城邦则发展公民政治。", "雅典民主不是全民民主，妇女、奴隶和外邦人被排除在外。", "雅典民主最适合被理解为哪种遗产？", ["城邦公民政治和公共辩论的样本", "现代普选制度的完整版本", "欧洲统一国家的开端"], "城邦公民政治和公共辩论的样本"),
  romanRepublic: learningEntry("罗马共和国把元老院、执政官、公民军和法律身份结合起来，支撑了长期扩张。", "共和国制度和罗马法成为欧洲后来理解公民、法律和共和的关键资源。", "它与中国秦汉大一统形成对照：罗马先是扩张共和国，中国则形成连续性更强的官僚帝国。", "罗马共和国并不等于现代民主国家，它仍然由精英竞争和庇护关系主导。", "罗马共和国给后世留下的核心资源是什么？", ["法律、公民身份和共和制度想象", "教皇加冕制度", "现代民族自决原则"], "法律、公民身份和共和制度想象"),
  augustus: learningEntry("共和国扩张带来的军队个人化和内战，使奥古斯都能以恢复秩序为名集中权力。", "罗马帝国把地中海连接成法律、道路、城市和行政网络，成为后世帝国想象的模板。", "约当中国西汉时期，汉帝国和罗马帝国分别在欧亚两端形成大型政治秩序。", "奥古斯都不是简单废除共和国，而是保留共和外壳来稳定新皇权。", "奥古斯都秩序解决了什么问题？", ["内战后的稳定和帝国治理", "基督教教义争端", "中世纪封建义务"], "内战后的稳定和帝国治理"),
  jesus: learningEntry("耶稣运动从犹太社会内部兴起，保罗等人又把它带入罗马城市网络。", "基督教把救赎、教会共同体和超越帝国的精神权威带入欧洲历史主线。", "约当中国东汉初期，罗马帝国道路和城市帮助新宗教传播，中国则在儒法官僚秩序中维系统治。", "早期基督教不是一开始就是国家宗教，它最初常处在帝国权力边缘。", "早期基督教为什么能跨区域传播？", ["借助罗马城市、道路和共同语言网络", "依靠现代印刷术", "由教皇国军事扩张完成"], "借助罗马城市、道路和共同语言网络"),
  constantine: learningEntry("帝国需要统一语言和忠诚资源，基督教也需要合法空间与组织稳定。", "合法化让教会进入帝国治理，宗教与国家权力开始深度绑定。", "约当中国东晋十六国时期，欧洲帝国把基督教纳入合法秩序，中国则经历南北政治分裂。", "君士坦丁没有让宗教争端消失，反而使教义问题更具政治意义。", "基督教合法化改变了什么？", ["教会从边缘信仰进入帝国公共秩序", "西罗马立即灭亡", "宗教从此退出政治"], "教会从边缘信仰进入帝国公共秩序"),
  westFall: learningEntry("西部帝国财政、军事和蛮族政治压力叠加，最终不再维持独立皇位。", "教会在政治碎片化中成为跨地域稳定组织，西欧进入多王国并存格局。", "约当中国南北朝时期，东西方都能看到分裂秩序中的制度重组。", "476 年不是文明突然终结，而是西部政治中心和权威形式改变。", "西罗马灭亡后，西欧最稳定的跨地域组织是谁？", ["教会", "欧盟", "雅典公民大会"], "教会"),
  charlemagne: learningEntry("教廷需要军事保护者，法兰克王权需要罗马帝国名义和基督教合法性。", "加冕创造了拉丁基督教世界中皇帝和教皇互相授权又互相竞争的结构。", "约当中国唐代，唐帝国是成熟官僚帝国，西欧则在教会和王权合作中重组秩序。", "查理曼帝国不是现代法国或德国，但为二者的分化提供重要背景。", "查理曼加冕最重要的结构意义是什么？", ["教皇和皇帝形成互相授权的拉丁西方想象", "英国议会主权确立", "欧元区建立"], "教皇和皇帝形成互相授权的拉丁西方想象"),
  reformation: learningEntry("印刷术、教会财政争议、地方诸侯利益和个人信仰焦虑共同放大了路德挑战。", "拉丁基督教世界分裂，宗教问题迅速转化为国家主权和地方治理问题。", "约当中国明代中后期，欧洲宗教改革借印刷和诸侯政治扩散，中国则处于帝国官僚体系内。", "宗教改革不只是神学争论，它也改变了国家和教会的权力边界。", "宗教改革为什么会变成政治问题？", ["地方权力可借改革控制教会和财富", "它直接废除了所有君主制", "它只发生在修道院内部"], "地方权力可借改革控制教会和财富"),
  westphalia: learningEntry("宗教战争和王朝竞争让欧洲需要一种承认诸邦权利、处理外交均势的安排。", "主权、外交承认和国家体系更清晰，宗教问题被纳入政治谈判。", "约当中国明末清初，欧洲形成多国均势体系，中国则经历王朝更替和重新统一。", "威斯特伐利亚不是一夜发明现代国际法，但它是主权国家叙事的重要节点。", "威斯特伐利亚体系强化了哪种逻辑？", ["主权国家和外交承认", "教皇直接统治欧洲", "城邦民主恢复"], "主权国家和外交承认"),
  enlightenment: learningEntry("科学革命、印刷公共空间和宪政经验让思想家重新审视权威来源。", "自然权利、社会契约、理性批判和公共舆论挑战神授王权与旧制度。", "约当中国清代中期，欧洲公共舆论和启蒙思想扩散，中国仍以帝国秩序和士大夫文化为主。", "启蒙运动不是单一反宗教运动，内部从温和改革到激进批判差异很大。", "启蒙运动主要挑战了什么？", ["传统权威的合法性来源", "所有科学方法", "罗马共和国的存在"], "传统权威的合法性来源"),
  frenchRevolution: learningEntry("财政危机、社会等级矛盾、启蒙语言和政治动员共同摧毁旧制度。", "人民主权、共和、世俗化和民族动员成为欧洲政治无法回避的新语言。", "约当中国乾隆末至嘉庆时期，法国经历主权观念剧变，中国帝国仍维持王朝治理。", "法国大革命不是单纯自由胜利，它也包含暴力、战争和国家动员。", "法国大革命最根本地改变了什么？", ["政治合法性从王权转向人民主权", "罗马法首次出现", "北约建立"], "政治合法性从王权转向人民主权"),
  napoleon: learningEntry("革命后的法国需要稳定秩序，拿破仑用军事、行政和法典把革命成果制度化。", "拿破仑战争重组欧洲地图，也迫使列强建立保守均势回应革命冲击。", "约当中国嘉庆时期，欧洲被革命战争重塑，中国则面对内部治理压力和白莲教等问题。", "拿破仑既是革命继承者，也是帝国统治者，这两面必须同时看。", "拿破仑时代怎样传播革命影响？", ["通过法典、行政改革和战争扩张", "通过互联网舆论", "通过十字军远征"], "通过法典、行政改革和战争扩张"),
  ww1: learningEntry("联盟体系、民族主义、帝国竞争、军备竞赛和巴尔干危机叠加，把局部冲突放大为总体战。", "一战摧毁多个帝国，带来民族自决、极端主义和不稳定和平。", "约当中国民国初年，中国也处在帝制终结后的国家重建困境中。", "一战不是只由一次刺杀造成，刺杀是点火器，结构性矛盾才是燃料。", "一战为什么会从局部危机扩大？", ["联盟、军备和帝国竞争相互锁定", "因为欧盟扩张", "因为印刷术发明"], "联盟、军备和帝国竞争相互锁定"),
  ww2: learningEntry("凡尔赛体系缺陷、经济危机、法西斯扩张和绥靖失败共同推向第二次世界大战。", "二战后西方秩序转向人权、国际组织、美国领导和欧洲一体化。", "约当中国抗日战争时期，欧洲和亚洲战场共同构成全球战争。", "二战不是一战的简单续集，它包含意识形态、种族灭绝和全球帝国秩序崩塌。", "二战后西方制度重建的核心之一是什么？", ["用联盟、国际法和一体化防止灾难重演", "恢复神圣罗马帝国", "废除所有国家边界"], "用联盟、国际法和一体化防止灾难重演"),
  unNatoEU: learningEntry("战争灾难让西方国家同时追求安全保护、经济恢复和制度约束。", "联合国、北约和欧洲一体化分别回应国际秩序、安全联盟和大陆和解问题。", "约当中国内战结束前后，世界进入冷战框架，欧洲则把法德和解制度化。", "联合国、北约、欧盟不是同一个组织，它们解决的问题不同。", "北约主要回应了哪类问题？", ["集体安全和军事威慑", "共同货币发行", "中世纪教会改革"], "集体安全和军事威慑"),
  coldWar: learningEntry("二战后美国和苏联在安全利益、意识形态和欧洲安排上迅速形成对峙。", "西方身份被自由民主、资本主义、福利国家和军事联盟共同塑造。", "约当中华人民共和国成立后，世界两极化，中国也逐步卷入冷战结构。", "冷战不是没有战争，而是大国直接战争被核威慑压住，代理战争和制度竞争持续发生。", "冷战中的西方阵营靠什么维系？", ["军事联盟、市场制度和意识形态认同", "教皇加冕皇帝", "城邦抽签制度"], "军事联盟、市场制度和意识形态认同"),
  1989: learningEntry("苏联改革、东欧社会运动、经济困境和公民社会共同瓦解了东欧党国秩序。", "德国统一、欧盟深化和北约东扩成为冷战后欧洲的核心议题。", "约当中国改革开放深入时期，东欧则经历制度剧变和阵营瓦解。", "1989 不是历史终点，它打开了新的安全边界和一体化难题。", "1989 年后欧洲最重要的新问题之一是什么？", ["如何管理德国统一、欧盟深化和北约边界", "如何恢复西罗马皇位", "如何结束印刷传播"], "如何管理德国统一、欧盟深化和北约边界"),
  maastricht: learningEntry("冷战结束和德国统一让欧洲需要更深制度框架来管理市场、货币和政治协调。", "欧盟把共同市场推进到共同货币、公民身份和更强机构合作。", "约当中国市场化改革加速时期，欧洲则用条约深化区域一体化。", "欧盟不是欧洲国家的简单替代品，而是在主权国家之上叠加治理层。", "马斯特里赫特条约标志着什么？", ["欧洲联盟阶段开启和一体化深化", "十字军结束", "罗马共和国建立"], "欧洲联盟阶段开启和一体化深化"),
  ukraine2022: learningEntry("克里米亚危机后欧洲安全矛盾持续积累，全面入侵使边界、主权和联盟承诺重新成为中心。", "欧洲能源、军费、制裁、北约扩员和乌克兰入欧议程被同时推到前台。", "约当中国进入 2020 年代后，全球秩序也在安全、供应链和技术竞争中重组。", "俄乌战争不是孤立地区冲突，它牵动冷战后欧洲安全安排的合法性。", "俄乌战争对欧洲最直接的制度冲击是什么？", ["安全、能源、制裁和联盟体系重组", "雅典民主复兴", "罗马法首次成文"], "安全、能源、制裁和联盟体系重组"),
  west2026: learningEntry("战争延续、美国政策不确定性、欧洲财政压力和技术竞争让西方秩序持续承压。", "欧洲需要在主权、安全联盟、援助责任和一体化扩员之间寻找新平衡。", "到 2026 年，中国、美国、欧盟和俄罗斯都在重估安全、技术和全球治理位置。", "2026 年节点不是结论，而是一个仍在展开的观察窗口。", "2026 年的西方秩序最适合怎样理解？", ["安全、技术、财政和联盟责任交织的调整期", "中世纪教权的恢复", "古典城邦的终局"], "安全、技术、财政和联盟责任交织的调整期")
};

function event(id, year, title, layer, type, x, entityList, people, summary, religion, crown, impacts, learning = {}) {
  return { id, year, title, layer, type, x, entities: entityList, people, summary, religion, crown, impacts, learning };
}

function link(id, source, target, type, weight, summary, entityList, meaning) {
  return { id, source, target, type, weight, summary, entities: entityList, meaning };
}

function learningEntry(why, changed, comparison, misconception, prompt, options, answer) {
  return {
    why,
    changed,
    comparison,
    misconception,
    sources: [
      { title: "A History of Western Society", author: "McKay et al.", note: "适合建立西方通史框架。" },
      { title: "The Oxford History of the Classical World / Europe", author: "Oxford reference series", note: "适合补充专题背景和时代细节。" }
    ],
    quiz: {
      prompt,
      options,
      answer,
      explanation: `关键在于：${answer}。这也是本节点连接下一段历史的抓手。`
    }
  };
}

const svg = document.querySelector("#historyGraph");
const routeSelect = document.querySelector("#routeSelect");
const entitySelect = document.querySelector("#entitySelect");
const detailKind = document.querySelector("#detailKind");
const detailTitle = document.querySelector("#detailTitle");
const detailSummary = document.querySelector("#detailSummary");
const detailVisuals = document.querySelector("#detailVisuals");
const detailMeta = document.querySelector("#detailMeta");
const detailPanel = document.querySelector("#detailPanel");
const closeDetail = document.querySelector("#closeDetail");
const toggleControls = document.querySelector("#toggleControls");
const storyEntryButton = document.querySelector("#storyEntry");
const filterDrawer = document.querySelector("#filterDrawer");
const enterFullFilterButton = document.querySelector("#enterFullFilter");
const matrixLead = document.querySelector("#matrixLead");
const impactMatrix = document.querySelector("#impactMatrix");
const routeCards = document.querySelector("#routeCards");
const routeReader = document.querySelector("#routeReader");
const globalMapControls = document.querySelector("#globalMapControls");
const explorePrevEventButton = document.querySelector("#explorePrevEvent");
const exploreNextEventButton = document.querySelector("#exploreNextEvent");
const globalStoryEntry = document.querySelector("#globalStoryEntry");
const globalFilterToggle = document.querySelector("#globalFilterToggle");
const globalCenterSelected = document.querySelector("#globalCenterSelected");
const globalMusicToggle = document.querySelector("#globalMusicToggle");
const filterRouteQuick = document.querySelector("#filterRouteQuick");
const chips = Array.from(document.querySelectorAll(".chip"));
const zoomIn = document.querySelector("#zoomIn");
const zoomOut = document.querySelector("#zoomOut");
const zoomReset = document.querySelector("#zoomReset");
const centerSelectedButton = document.querySelector("#centerSelected");
const topToolbar = document.querySelector(".top-toolbar");
const toolbarRoute = document.querySelector("#toolbarRoute");
const toolbarEntity = document.querySelector("#toolbarEntity");
const toolbarRelation = document.querySelector("#toolbarRelation");
const toolbarZoom = document.querySelector("#toolbarZoom");
const toolbarSelected = document.querySelector("#toolbarSelected");
const detailBadges = document.querySelector("#detailBadges");
const hoverTooltip = document.querySelector("#hoverTooltip");
const timelineTicks = document.querySelector("#timelineTicks");
const pinchGuide = document.querySelector("#pinchGuide");
const closePinchGuideButton = document.querySelector("#closePinchGuide");
const mobileTitleToggle = document.querySelector("#mobileTitleToggle");
const introModal = document.querySelector("#introModal");
const closeIntroModalButton = document.querySelector("#closeIntroModal");
const startIntroModalButton = document.querySelector("#startIntroModal");
const continueIntroModalButton = document.querySelector("#continueIntroModal");
const freeExploreIntroButton = document.querySelector("#freeExploreIntro");
const introProgressNote = document.querySelector("#introProgressNote");
const introRouteList = document.querySelector("#introRouteList");
const mobilePreviewTitle = document.querySelector("#mobilePreviewTitle");
const mobilePreviewDescription = document.querySelector("#mobilePreviewDescription");
const storyFocusHud = document.querySelector("#storyFocusHud");
const timeFocusToast = document.querySelector("#timeFocusToast");

const eventById = Object.fromEntries(events.map((item) => [item.id, item]));
let uiState = createInitialUiState();
uiState.audio = createInitialAudioState();
let previousStateSnapshot = null;
let eventPositions = new Map();
let activeRoute = "all";
let activeEntity = "all";
let activeRelation = "all";
let activeTimeRange = null;
let selected = { kind: "none", id: null };
let lastDragAt = 0;
let zoomControlsTimer = null;
let zoomLevel = 1;
let overviewAutoTimer = null;
let mobileFitPreviewTimer = null;
let userMovedMap = false;
let introClosed = false;
let introSequenceStarted = false;
let introAutoPending = false;
let introInteractionLockUntil = 0;
let mobileGestureHintShown = false;
let overviewMode = true;
let learningMode = false;
let activeRouteStep = 0;
let previousStoryEventId = null;
let storyAutoTimer = null;
let timeFocusToastTimer = null;
let backgroundAudio = null;
let audioUnlockedByUser = false;
let completedEventIds = new Set();
let completedQuizIds = new Set();
const progressStorageKey = "westernHistoryProgress";
const mobileEntryEventIds = new Set(["mesopotamia", "hebrew", "athens", "romanRepublic", "augustus", "jesus", "constantine"]);
const mobileReadableZoom = 0.24;
const zoomMin = 0.1;
const zoomMax = 1.85;
const zoomStep = 0.12;
let storyCameraTween = null;
let overviewZoomTween = null;
let exploreCameraTween = null;
let globalMapControlsTween = null;
let lastGlobalMapControlsHidden = globalMapControls?.hidden ?? true;

function getGsap() {
  return globalThis.gsap || null;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function killStoryCameraTween() {
  storyCameraTween?.kill();
  storyCameraTween = null;
}

function killOverviewZoomTween() {
  overviewZoomTween?.kill();
  overviewZoomTween = null;
}

function killExploreCameraTween() {
  exploreCameraTween?.kill();
  exploreCameraTween = null;
}

function syncAnimationCapabilityState() {
  const app = document.querySelector(".atlas-app");
  if (!app) return;
  app.classList.toggle("gsap-ready", Boolean(getGsap()));
  app.classList.toggle("reduced-motion", prefersReducedMotion());
}

const chineseDynasties = [
  { from: -3000, to: -2070, label: "史前 / 传说时代" },
  { from: -2070, to: -1600, label: "夏" },
  { from: -1600, to: -1046, label: "商" },
  { from: -1046, to: -771, label: "西周" },
  { from: -770, to: -476, label: "春秋" },
  { from: -475, to: -221, label: "战国" },
  { from: -221, to: -206, label: "秦" },
  { from: -202, to: 8, label: "西汉" },
  { from: 25, to: 220, label: "东汉" },
  { from: 220, to: 280, label: "三国" },
  { from: 266, to: 420, label: "晋" },
  { from: 420, to: 589, label: "南北朝" },
  { from: 581, to: 618, label: "隋" },
  { from: 618, to: 907, label: "唐" },
  { from: 907, to: 960, label: "五代十国" },
  { from: 960, to: 1279, label: "宋" },
  { from: 1271, to: 1368, label: "元" },
  { from: 1368, to: 1644, label: "明" },
  { from: 1644, to: 1912, label: "清" },
  { from: 1912, to: 1949, label: "民国" },
  { from: 1949, to: 2026, label: "中华人民共和国" }
];

function init() {
  window.closeIntroModal = closeIntroModal;
  syncAnimationCapabilityState();
  initializeBackgroundAudio();
  installFirstInteractionAudioUnlock();
  syncMobileViewportInsets();
  loadProgress();
  uiState = updateStateViewport(uiState, currentViewportState());
  routeSelect.innerHTML = '<option value="all">整张大网</option>';
  Object.entries(routes).forEach(([id, route]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = route.title;
    routeSelect.append(option);
  });

  entitySelect.innerHTML = '<option value="all">全部政治实体</option>';
  Object.entries(entities).forEach(([id, label]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    entitySelect.append(option);
  });

  routeSelect.addEventListener("change", (evt) => {
    stopStoryAutoplay();
    exitOverviewMode();
    uiState = selectRouteFilter(uiState, evt.target.value);
    hydrateLegacyFromUiState();
    renderGraph();
    renderRouteReader();
    syncUIFromState();
    updateStatusBar();
    fitCurrentSelection();
  });

  entitySelect.addEventListener("change", (evt) => {
    stopStoryAutoplay();
    exitOverviewMode();
    uiState = applyEntityFilter(uiState, evt.target.value);
    hydrateLegacyFromUiState();
    renderGraph();
    renderRouteReader();
    syncUIFromState();
    updateStatusBar();
    fitCurrentSelection();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      stopStoryAutoplay();
      exitOverviewMode();
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      uiState = applyRelationFilter(uiState, chip.dataset.filter);
      hydrateLegacyFromUiState();
      renderGraph();
      renderRouteReader();
      syncUIFromState();
      updateStatusBar();
      fitCurrentSelection();
      collapseControlsOnMobile();
    });
  });

  closeDetail.addEventListener("click", () => {
    closeDetailPanel();
  });

  toggleControls.addEventListener("click", () => {
    toggleControlState();
  });
  enterFullFilterButton?.addEventListener("click", () => {
    stopStoryAutoplay();
    if (uiState.mode === "story") {
      uiState = closeStoryPanelState(uiState);
      hydrateLegacyFromUiState();
    }
    uiState = openFilterPanel(uiState);
    hydrateLegacyFromUiState();
    renderGraph();
    renderRouteReader();
    syncUIFromState();
    updateStatusBar();
    fitCurrentSelection();
  });
  explorePrevEventButton?.addEventListener("click", () => navigateExploreEvent(-1));
  exploreNextEventButton?.addEventListener("click", () => navigateExploreEvent(1));
  globalStoryEntry?.addEventListener("click", startOrContinueStory);
  globalFilterToggle?.addEventListener("click", toggleGlobalFilterShortcut);
  globalCenterSelected?.addEventListener("click", centerOnSelected);
  globalMusicToggle?.addEventListener("click", toggleBackgroundMusic);
  storyEntryButton?.addEventListener("click", startOrContinueStory);
  mobileTitleToggle.addEventListener("click", () => {
    toggleControlState();
  });

  topToolbar.addEventListener("click", (evt) => {
    const app = document.querySelector(".atlas-app");
    const isMobile = isMobileViewport();
    const clickedInteractive = evt.target.closest("button, select, label");
    if (!isMobile || !app.classList.contains("controls-collapsed") || clickedInteractive) return;
    toggleControlState();
  });

  enableDragPan();
  enableZoomControls();
  document.querySelector(".graph-scroll").addEventListener("scroll", updateTimelineRuler, { passive: true });
  document.querySelector(".graph-scroll").addEventListener("scroll", updateViewportLayerTitles, { passive: true });
  window.addEventListener("resize", () => {
    syncMobileViewportInsets();
    uiState = updateStateViewport(uiState, currentViewportState());
    syncUIFromState();
    updateTimelineRuler();
    updateViewportLayerTitles();
  });
  window.visualViewport?.addEventListener("resize", syncMobileViewportInsets);
  window.visualViewport?.addEventListener("scroll", syncMobileViewportInsets);
  timelineTicks.addEventListener("click", handleTimelineClick);
  pinchGuide.addEventListener("click", (evt) => {
    if (evt.target === pinchGuide) hidePinchGuide();
  });
  closePinchGuideButton.addEventListener("click", hidePinchGuide);
  introModal.addEventListener("click", (evt) => {
    if (evt.target === introModal) closeIntroModal();
  });
  introModal.addEventListener("pointerdown", handleIntroPointerIntent, true);
  introModal.addEventListener("mousedown", handleIntroPointerIntent, true);
  closeIntroModalButton.addEventListener("click", closeIntroModal);
  startIntroModalButton.addEventListener("click", () => startRoute("westernMain"));
  continueIntroModalButton?.addEventListener("click", continueStoryGuide);
  freeExploreIntroButton?.addEventListener("click", () => {
    closeIntroModal();
    showPinchGuide();
  });

  renderGraph();
  renderRouteCards();
  renderFilterRouteQuick();
  renderIntroRouteList();
  syncIntroProgressEntry();
  renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  applyZoom(zoomLevel);
  fitInitialEntryView(false);
  window.setTimeout(() => {
    if (overviewMode && introModal && !introModal.hidden) fitInitialEntryView(false);
  }, 80);
  updateTimelineRuler();
  updateViewportLayerTitles();
  showIntroModal();
  watchIntroClosure();
}

function clearSvg() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function createSvgElement(tag, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function activeRouteEvents() {
  const scope = deriveGraphScope(uiState);
  return scope.routeId === "all" ? null : new Set(routes[scope.routeId]?.eventIds || []);
}

function routeContextForEvent(eventId) {
  if (!eventId) return null;
  const preferredRouteIds = [
    activeRoute,
    uiState.story?.lastRouteId,
    "westernMain",
    ...Object.keys(routes)
  ].filter(Boolean);
  const seen = new Set();
  for (const routeId of preferredRouteIds) {
    if (seen.has(routeId)) continue;
    seen.add(routeId);
    const route = routes[routeId];
    const index = route?.eventIds.indexOf(eventId) ?? -1;
    if (route && index >= 0) return { routeId, route, index };
  }
  return null;
}

function activeStoryEventIds() {
  if (uiState.mode !== "story") return null;
  const route = routes[uiState.story.routeId || activeRoute];
  return route ? route.eventIds : null;
}

function currentStoryEventId() {
  const route = routes[uiState.story?.routeId || activeRoute];
  if (!route) return null;
  return route.eventIds[uiState.story?.step ?? activeRouteStep] || null;
}

function storyEventClass(eventId) {
  const storyIds = activeStoryEventIds();
  if (!storyIds) return "";
  const index = storyIds.indexOf(eventId);
  if (index < 0) return "story-muted";
  if (eventId === currentStoryEventId()) return "story-current";
  if (eventId === previousStoryEventId) return "story-previous";
  if (index < (uiState.story?.step ?? activeRouteStep)) return "story-visited";
  return "story-upcoming";
}

function storyLinkClass(item) {
  const storyIds = activeStoryEventIds();
  if (!storyIds) return "";
  const sourceIndex = storyIds.indexOf(item.source);
  const targetIndex = storyIds.indexOf(item.target);
  if (sourceIndex < 0 || targetIndex < 0) return "story-muted";
  return sourceIndex <= (uiState.story?.step ?? activeRouteStep) && targetIndex <= (uiState.story?.step ?? activeRouteStep)
    ? "story-visited"
    : "story-upcoming";
}

function isEventInScope(item) {
  if (uiState.mode === "story") return true;
  const scope = deriveGraphScope(uiState);
  const routeSet = activeRouteEvents();
  const routeOk = !routeSet || routeSet.has(item.id);
  const entityOk = scope.entityId === "all" || item.entities.includes(scope.entityId);
  const timeOk = !scope.timeRange || (item.year >= scope.timeRange.from && item.year <= scope.timeRange.to);
  return routeOk && entityOk && timeOk;
}

function isLinkInScope(item) {
  if (uiState.mode === "story") return true;
  const scope = deriveGraphScope(uiState);
  const routeSet = activeRouteEvents();
  const routeOk = !routeSet || (routeSet.has(item.source) && routeSet.has(item.target));
  const entityOk = scope.entityId === "all" || item.entities.includes(scope.entityId);
  const relationOk = scope.relationId === "all" || item.type === scope.relationId;
  const source = eventById[item.source];
  const target = eventById[item.target];
  const timeOk = !scope.timeRange || (
    source && target &&
    source.year >= scope.timeRange.from && source.year <= scope.timeRange.to &&
    target.year >= scope.timeRange.from && target.year <= scope.timeRange.to
  );
  return routeOk && entityOk && relationOk && timeOk;
}

function isOverviewEvent(item) {
  if (document.querySelector(".atlas-app")?.classList.contains("mobile-entry-preview")) {
    return mobileEntryEventIds.has(item.id);
  }
  return majorEventIds.has(item.id);
}

function isOverviewLink(item) {
  if (document.querySelector(".atlas-app")?.classList.contains("mobile-entry-preview")) {
    return mobileEntryEventIds.has(item.source) && mobileEntryEventIds.has(item.target);
  }
  return item.weight >= 4 && majorEventIds.has(item.source) && majorEventIds.has(item.target);
}

function renderGraph() {
  clearSvg();
  eventPositions = computeEventPositions();
  svg.setAttribute("viewBox", `0 0 ${graphSize.width} ${graphSize.height}`);
  svg.append(createSvgElement("defs"));
  renderAxis();
  renderLinks();
  renderEvents();
}

function renderAxis() {
  Object.entries(regions).forEach(([layer, region], index) => {
    svg.append(createSvgElement("rect", {
      class: `region-band ${index % 2 ? "alternate" : ""}`,
      x: "40",
      y: region.top,
      width: String(graphSize.width - 100),
      height: String(region.height)
    }));

    svg.append(createSvgElement("line", {
      class: "axis-line",
      x1: "40",
      y1: region.top,
      x2: String(graphSize.width - 60),
      y2: region.top
    }));

    const label = createSvgElement("text", {
      class: "layer-title",
      x: "54",
      y: region.top + 34
    });
    label.textContent = region.label;
    svg.append(label);
  });

  [-3000, -2000, -1000, 0, 500, 1000, 1200, 1400, 1500, 1600, 1700, 1800, 1850, 1900, 1925, 1950, 1975, 2000, 2026].forEach((year) => {
    const x = timeToX(year);
    svg.append(createSvgElement("line", {
      class: "time-tick",
      x1: x,
      x2: x,
      y1: "98",
      y2: String(graphSize.height - 70)
    }));
    const text = createSvgElement("text", {
      class: "year-label",
      x,
      y: String(graphSize.height - 32),
      "text-anchor": "middle"
    });
    text.textContent = year < 0 ? `公元前 ${Math.abs(year)}` : year;
    svg.append(text);
  });
}

function renderLinks() {
  links.forEach((item) => {
    const source = eventById[item.source];
    const target = eventById[item.target];
    if (!source || !target) return;
    const sourcePos = eventPositions.get(item.source);
    const targetPos = eventPositions.get(item.target);
    if (!sourcePos || !targetPos) return;
    const dx = Math.max(120, targetPos.x - sourcePos.x);
    const arc = Math.min(210, Math.abs(targetPos.y - sourcePos.y) * 0.3 + item.weight * 10);
    const c1x = sourcePos.x + dx * 0.42;
    const c2x = targetPos.x - dx * 0.42;
    const safeTop = 128;
    const c1y = Math.max(safeTop, sourcePos.y - arc);
    const c2y = Math.max(safeTop, targetPos.y + (targetPos.y > sourcePos.y ? arc * 0.35 : -arc * 0.35));
    const pathData = `M ${sourcePos.x} ${sourcePos.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetPos.x} ${targetPos.y}`;
    const inScope = isLinkInScope(item);
    const overviewSecondary = overviewMode && !isOverviewLink(item);
    const storyClass = storyLinkClass(item);
    const style = relationStyles[item.type];
    const group = createSvgElement("g", {
      class: `link-group ${inScope ? "highlighted" : "muted"} ${overviewSecondary ? "overview-secondary" : ""} ${storyClass} ${selected.kind === "link" && selected.id === item.id ? "selected" : ""}`,
      "data-link-id": item.id,
      role: "button",
      "aria-label": `${source.title} 到 ${target.title}：${style.label}`
    });

    group.append(
      createSvgElement("path", {
        class: "link-path",
        d: pathData,
        stroke: style.color,
        "stroke-width": String(0.6 + item.weight * 1.2)
      })
    );

    const hitPath = createSvgElement("path", {
      class: "link-hit",
      d: pathData
    });
    hitPath.addEventListener("click", (evt) => {
      if (wasDragClick(evt)) return;
      showLink(item.id);
    });
    group.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        showLink(item.id);
      }
    });
    hitPath.addEventListener("pointerover", () => group.classList.add("hovered"));
    hitPath.addEventListener("pointerout", () => {
      group.classList.remove("hovered");
    });
    group.append(hitPath);

    if (inScope && item.weight >= 4) {
      const label = createSvgElement("text", {
        class: "link-label",
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2 - 18,
        "text-anchor": "middle"
      });
      label.textContent = `${style.label} · 主干`;
      group.append(label);
    }

    svg.append(group);
  });
}

function renderEvents() {
  events.forEach((item) => {
    const pos = eventPositions.get(item.id);
    if (!pos) return;
    const inScope = isEventInScope(item);
    const overviewSecondary = overviewMode && !isOverviewEvent(item);
    const storyClass = storyEventClass(item.id);
    const radius = radiusForEvent(item);
    const group = createSvgElement("g", {
      class: `event-node ${inScope ? "highlighted" : "muted"} ${overviewSecondary ? "overview-secondary" : ""} ${storyClass} ${selected.kind === "event" && selected.id === item.id ? "selected" : ""}`,
      transform: `translate(${pos.x} ${pos.y})`,
      "data-event-id": item.id,
      role: "button",
      "aria-label": `${item.title}，${formatYear(item.year)}`
    });

    group.append(
      createSvgElement("circle", {
        class: "outer",
        r: radius + 7,
        stroke: eventTypeColor[item.type] || eventTypeColor[item.layer]
      }),
      createSvgElement("circle", {
        class: "inner",
        r: radius,
        fill: eventTypeColor[item.type] || eventTypeColor[item.layer]
      })
    );

    const icon = createSvgElement("text", {
      class: "node-icon",
      x: "0",
      y: "6",
      "text-anchor": "middle"
    });
    icon.textContent = iconForEvent(item);

    const year = createSvgElement("text", {
      class: "year",
      x: "0",
      y: -radius - 13,
      "text-anchor": "middle"
    });
    year.textContent = formatYear(item.year);

    const title = createSvgElement("text", {
      x: "0",
      y: radius + 28,
      "text-anchor": "middle"
    });
    title.textContent = item.title;

    const flags = createSvgElement("text", {
      class: "flag-strip",
      x: "0",
      y: radius + 50,
      "text-anchor": "middle"
    });
    renderFlagSpans(flags, item);

    group.append(icon, year, title, flags);
    group.addEventListener("click", (evt) => {
      if (wasDragClick(evt)) return;
      showEvent(item.id);
    });
    group.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        showEvent(item.id);
      }
    });
    group.addEventListener("pointerover", (evt) => {
      if (evt.currentTarget.classList.contains("hovered")) return;
      group.classList.add("hovered");
      group.setAttribute("transform", `translate(${pos.x} ${pos.y}) scale(1.08)`);
      showHoverTooltip(item, pos);
    });
    group.addEventListener("pointerout", (evt) => {
      if (evt.relatedTarget && group.contains(evt.relatedTarget)) return;
      group.classList.remove("hovered");
      group.setAttribute("transform", `translate(${pos.x} ${pos.y})`);
      hideHoverTooltip();
    });
    svg.append(group);
  });
}

function showEvent(id) {
  hideHoverTooltip();
  exitOverviewMode();
  if (uiState.mode === "story") stopStoryAutoplay();
  const route = routes[activeRoute];
  uiState = openEventDetail(uiState, id, { routeEventIds: route ? route.eventIds : [] });
  hydrateLegacyFromUiState();
  syncUIFromState();
  const item = eventById[id];
  if (!item) return;
  const learning = getEventLearning(item);
  detailKind.textContent = `事件 · ${formatYear(item.year)}`;
  detailTitle.textContent = item.title;
  detailBadges.innerHTML = detailBadgesForEvent(item);
  detailSummary.textContent = item.summary;
  detailVisuals.innerHTML = visualTokensForEvent(item);
  detailMeta.innerHTML = [
    metaBlock("为什么发生", learning.why),
    metaBlock("改变了什么", learning.changed),
    metaBlock("同时期参照", learning.comparison),
    metaBlock("常见误区", learning.misconception),
    metaBlock("关键人物介绍", personCards(item)),
    metaBlock("参与国家/政权/政治实体", tagList(item.entities.map((entity) => entities[entity]))),
    metaBlock("来源与延伸阅读", renderSources(learning.sources)),
    metaBlock("延伸理解", learning.quiz?.explanation || "这个节点可以作为继续探索相关事件和影响线的入口。")
  ].join("");
  renderImpactMatrix(item);
  renderGraph();
  renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  scrollDetailToTop();
  requestAnimationFrame(() => focusExploreEvent(id));
}

function showLink(id) {
  hideHoverTooltip();
  exitOverviewMode();
  if (uiState.mode === "story") stopStoryAutoplay();
  uiState = openLinkDetail(uiState, id);
  hydrateLegacyFromUiState();
  syncUIFromState();
  const item = links.find((linkItem) => linkItem.id === id);
  if (!item) return;
  const source = eventById[item.source];
  const target = eventById[item.target];
  detailKind.textContent = `影响线 · ${relationStyles[item.type].label} · 权重 ${item.weight}`;
  detailTitle.textContent = `${source.title} → ${target.title}`;
  detailBadges.innerHTML = detailBadgesForLink(item);
  detailSummary.textContent = item.summary;
  detailVisuals.innerHTML = visualTokensForLink(item);
  detailMeta.innerHTML = [
    metaBlock("影响强度", item.weight >= 4 ? "主干粗线：对西方历史结构影响很大" : "支线细线：提供背景、传播或间接影响"),
    metaBlock("被影响的政治实体", tagList(item.entities.map((entity) => entities[entity]))),
    metaBlock("主线意义", item.meaning),
    metaBlock("阅读提示", `${source.title} 提供了前提，${target.title} 则显示这种影响在制度、宗教或国家权力中的后续展开。顺着这条线读，可以看到事件之间不是孤立发生，而是在长期结构中互相推动。`)
  ].join("");
  matrixLead.textContent = "这条影响线涉及的国家/政权/政治实体";
  impactMatrix.innerHTML = item.entities.map((entity) => `
    <article class="impact-card">
      <span class="impact-label">${relationStyles[item.type].label} · 权重 ${item.weight}</span>
      <h3>${entities[entity]}</h3>
      <p>${item.summary}</p>
    </article>
  `).join("");
  renderGraph();
  renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  scrollDetailToTop();
  requestAnimationFrame(() => centerOnLink(item));
}

function scrollDetailToTop() {
  const body = detailPanel.querySelector(".detail-body");
  if (body) body.scrollTop = 0;
}

function renderImpactMatrix(item) {
  matrixLead.textContent = `当前事件：${item.title}`;
  impactMatrix.innerHTML = Object.entries(item.impacts).map(([entity, text]) => `
    <article class="impact-card">
      <span class="impact-label">影响对象</span>
      <h3>${entities[entity]}</h3>
      <p>${text}</p>
    </article>
  `).join("");
}

function renderRouteCards() {
  routeCards.innerHTML = Object.entries(routes).map(([id, route]) => `
    <article class="route-card" data-route="${id}" tabindex="0" role="button">
      <h3>${route.title}</h3>
      <p>${route.description}</p>
      <span class="count">${route.eventIds.length} 个关键事件</span>
    </article>
  `).join("");

  Array.from(routeCards.querySelectorAll(".route-card")).forEach((card) => {
    const activate = () => {
      exitOverviewMode();
      uiState = selectRouteFilter(uiState, card.dataset.route);
      hydrateLegacyFromUiState();
      renderGraph();
      renderRouteReader();
      syncUIFromState();
      updateStatusBar();
      fitCurrentSelection();
      collapseControlsOnMobile();
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        activate();
      }
    });
  });
}

function renderFilterRouteQuick() {
  if (!filterRouteQuick) return;
  filterRouteQuick.innerHTML = [
    `<button class="route-quick-chip" type="button" data-route="all">整张大网</button>`,
    ...Object.entries(routes).slice(0, 4).map(([id, route]) => `
      <button class="route-quick-chip" type="button" data-route="${id}">
        <strong>${route.title}</strong>
        <span>${route.eventIds.length} 站</span>
      </button>
    `)
  ].join("");
  filterRouteQuick.querySelectorAll(".route-quick-chip").forEach((button) => {
    button.addEventListener("click", () => {
      stopStoryAutoplay();
      exitOverviewMode();
      uiState = selectRouteFilter(uiState, button.dataset.route);
      hydrateLegacyFromUiState();
      renderGraph();
      renderRouteReader();
      syncUIFromState();
      updateStatusBar();
      fitCurrentSelection();
      collapseControlsOnMobile();
    });
  });
  syncFilterRouteQuick();
}

function syncFilterRouteQuick() {
  if (!filterRouteQuick) return;
  filterRouteQuick.querySelectorAll(".route-quick-chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === activeRoute);
  });
}

function renderIntroRouteList() {
  if (!introRouteList) return;
  introRouteList.innerHTML = Object.entries(routes).map(([id, route]) => `
    <button class="intro-route-card" type="button" data-route="${id}">
      <strong>${route.title}</strong>
      <span>${route.guidingQuestion || route.description}</span>
      <small>${route.eventIds.length} 站 · ${route.audience || "适合自由探索"}</small>
    </button>
  `).join("");
  introRouteList.querySelectorAll(".intro-route-card").forEach((card) => {
    card.addEventListener("click", () => startRoute(card.dataset.route));
  });
}

function syncIntroProgressEntry() {
  if (!continueIntroModalButton || !introProgressNote) return;
  const routeId = uiState.story?.lastRouteId || "westernMain";
  const route = routes[routeId];
  const step = Math.max(0, Math.min(uiState.story?.lastStep || 0, (route?.eventIds.length || 1) - 1));
  const hasProgress = Boolean(uiState.story?.hasStarted && route);
  continueIntroModalButton.disabled = !hasProgress;
  continueIntroModalButton.textContent = hasProgress ? `继续第 ${step + 1} 幕` : "最近进度";
  introProgressNote.textContent = hasProgress
    ? `上次停在「${route.title}」第 ${step + 1} 幕，点“继续”会回到故事。`
    : "还没有保存进度，可以先从第一条故事线开始。";
}

function startOrContinueStory() {
  if (uiState.story?.hasStarted && uiState.story?.lastRouteId && uiState.story.panelState === "closed") {
    continueStoryGuide();
    return;
  }
  startRoute(uiState.story?.lastRouteId || "westernMain");
}

function startRoute(routeId) {
  const route = routes[routeId];
  if (!route) return;
  unlockBackgroundAudioFromUserGesture();
  stopStoryAutoplay();
  closeIntroModal();
  window.clearTimeout(overviewAutoTimer);
  introAutoPending = false;
  exitOverviewMode();
  const step = Math.min(progressForRoute(routeId), route.eventIds.length - 1);
  previousStoryEventId = null;
  uiState = startStoryState(uiState, routeId, step, route.eventIds);
  hydrateLegacyFromUiState();
  saveProgress();
  syncIntroProgressEntry();
  renderGraph();
  syncUIFromState();
  updateStatusBar();
  goToRouteStep(step, { animate: true });
}

function exitRouteReader() {
  stopStoryAutoplay();
  if (uiState.mode === "story") {
    uiState = closeStoryPanelState(uiState);
  } else {
    uiState = closeRouteReaderState(uiState, { keepRouteFilter: false });
  }
  hydrateLegacyFromUiState();
  renderRouteReader();
  renderGraph();
  syncUIFromState();
  updateStatusBar();
  fitWholeMap(true, { context: "whole" });
}

function continueStoryGuide() {
  const routeId = uiState.story?.lastRouteId || activeRoute || "westernMain";
  const route = routes[routeId];
  if (!route) return;
  stopStoryAutoplay();
  closeIntroModal();
  exitOverviewMode();
  const step = Math.min(uiState.story?.lastStep || 0, route.eventIds.length - 1);
  uiState = continueStoryState(uiState);
  uiState = goToStoryStepState(uiState, step, route.eventIds);
  hydrateLegacyFromUiState();
  syncIntroProgressEntry();
  renderGraph();
  renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  focusStoryScene(route.eventIds[step], previousStoryEventId, true);
}

function goToRouteStep(index, options = {}) {
  const route = routes[activeRoute];
  if (!route || activeRoute === "all") return;
  if (!options.keepPlaying) stopStoryAutoplay();
  const previousId = route.eventIds[activeRouteStep] || null;
  activeRouteStep = Math.max(0, Math.min(route.eventIds.length - 1, index));
  previousStoryEventId = previousId && previousId !== route.eventIds[activeRouteStep] ? previousId : previousStoryEventId;
  uiState = uiState.mode === "story" ? goToStoryStepState(uiState, activeRouteStep, route.eventIds) : uiState;
  uiState.routeStep = activeRouteStep;
  const eventId = route.eventIds[activeRouteStep];
  saveProgress();
  renderRouteReader();
  selected = { kind: "event", id: eventId };
  uiState.selected = { kind: "event", id: eventId };
  renderGraph();
  syncUIFromState();
  updateStatusBar();
  focusStoryScene(eventId, previousStoryEventId, options.animate !== false);
}

function nextRouteStep(options = {}) {
  const route = routes[activeRoute];
  if (!route) return;
  goToRouteStep(Math.min(route.eventIds.length - 1, activeRouteStep + 1), options);
}

function previousRouteStep() {
  goToRouteStep(Math.max(0, activeRouteStep - 1));
}

function toggleStoryAutoplay() {
  if (uiState.story?.isPlaying) {
    stopStoryAutoplay();
    renderRouteReader();
    syncUIFromState();
    return;
  }
  uiState = toggleStoryPlayback(uiState, true);
  hydrateLegacyFromUiState();
  renderRouteReader();
  syncUIFromState();
  scheduleStoryAutoplay();
}

function stopStoryAutoplay() {
  window.clearTimeout(storyAutoTimer);
  storyAutoTimer = null;
  if (uiState.story?.isPlaying) {
    uiState = toggleStoryPlayback(uiState, false);
    hydrateLegacyFromUiState();
  }
}

function initializeBackgroundAudio() {
  backgroundAudio = new Audio(backgroundMusic.src);
  backgroundAudio.loop = true;
  backgroundAudio.preload = "metadata";
  backgroundAudio.volume = 0;
  uiState.audio = resolveAudioAvailability(uiState.audio, true);
  backgroundAudio.addEventListener("error", () => {
    uiState.audio = resolveAudioAvailability(uiState.audio, false);
    renderRouteReader();
    syncUIFromState();
  }, { once: true });
  if (window.fetch) {
    window.fetch(backgroundMusic.src, { method: "HEAD" })
      .then((response) => {
        uiState.audio = resolveAudioAvailability(uiState.audio, response.ok);
        renderRouteReader();
        syncUIFromState();
      })
      .catch(() => {
        uiState.audio = resolveAudioAvailability(uiState.audio, false);
      });
  }
}

function installFirstInteractionAudioUnlock() {
  window.addEventListener("pointerdown", unlockBackgroundAudioFromUserGesture, { once: true, capture: true, passive: true });
  window.addEventListener("keydown", unlockBackgroundAudioFromUserGesture, { once: true, capture: true });
}

function unlockBackgroundAudioFromUserGesture() {
  if (audioUnlockedByUser || !backgroundAudio) return;
  audioUnlockedByUser = true;
  uiState.audio = {
    ...uiState.audio,
    enabled: true,
    muted: false,
    hasTriedToLoad: true
  };
  syncUIFromState();
}

function toggleBackgroundMusic() {
  if (!uiState.audio?.licenseReady) return;
  audioUnlockedByUser = true;
  uiState.audio = toggleAudioMuted(uiState.audio);
  renderRouteReader();
  syncUIFromState();
}

function navigateExploreEvent(delta) {
  if (uiState.mode === "story" || selected.kind !== "event") return;
  const context = routeContextForEvent(selected.id);
  if (!context) return;
  const nextIndex = Math.max(0, Math.min(context.route.eventIds.length - 1, context.index + delta));
  const nextEventId = context.route.eventIds[nextIndex];
  if (!nextEventId || nextEventId === selected.id) return;
  showEvent(nextEventId);
}

function syncExploreNavControls() {
  const context = selected.kind === "event" && uiState.mode !== "story"
    ? routeContextForEvent(selected.id)
    : null;
  const visible = Boolean(context);
  if (globalMapControls) {
    globalMapControls.classList.toggle("explore-nav-visible", visible);
  }
  if (explorePrevEventButton) {
    explorePrevEventButton.hidden = !visible;
    explorePrevEventButton.disabled = !context || context.index <= 0;
    explorePrevEventButton.setAttribute("aria-label", context ? `上一个时间点：${eventById[context.route.eventIds[context.index - 1]]?.title || ""}` : "上一个时间点");
  }
  if (exploreNextEventButton) {
    exploreNextEventButton.hidden = !visible;
    exploreNextEventButton.disabled = !context || context.index >= context.route.eventIds.length - 1;
    exploreNextEventButton.setAttribute("aria-label", context ? `下一个时间点：${eventById[context.route.eventIds[context.index + 1]]?.title || ""}` : "下一个时间点");
  }
}

function syncGlobalMusicControl() {
  if (!globalMapControls) return;
  const ready = Boolean(uiState.audio?.licenseReady);
  const muted = uiState.audio?.muted !== false;
  const hasMobileShortcuts = isMobileViewport();
  if (globalMusicToggle) {
    globalMusicToggle.hidden = !ready && !hasMobileShortcuts;
    globalMusicToggle.disabled = !ready;
    globalMusicToggle.classList.toggle("active", ready && !muted);
    globalMusicToggle.textContent = muted ? "♪" : "Ⅱ";
    globalMusicToggle.setAttribute("aria-label", muted ? "播放音乐" : "暂停音乐");
    globalMusicToggle.title = ready ? (muted ? "播放音乐" : "暂停音乐") : "音乐加载中";
  }
  [globalStoryEntry, globalFilterToggle, globalCenterSelected].forEach((button) => {
    if (button) button.hidden = !hasMobileShortcuts;
  });
  if (globalStoryEntry) {
    globalStoryEntry.setAttribute("aria-label", uiState.story?.hasStarted ? "继续故事" : "开始故事");
    globalStoryEntry.title = uiState.story?.hasStarted ? "继续故事" : "开始故事";
  }
  if (globalFilterToggle) {
    const open = Boolean(uiState.panels.filterOpen || uiState.panels.storyFilterPeekOpen);
    globalFilterToggle.classList.toggle("active", open);
    globalFilterToggle.setAttribute("aria-label", open ? "收起筛选" : "打开筛选");
  }
  const hasExploreNav = globalMapControls.classList.contains("explore-nav-visible");
  syncGlobalMapControlsMotion(!hasMobileShortcuts && !ready && !hasExploreNav);
}

function syncGlobalMapControlsMotion(shouldHide) {
  if (!globalMapControls) return;
  const gsap = getGsap();
  if (!gsap || prefersReducedMotion()) {
    globalMapControlsTween?.kill();
    globalMapControlsTween = null;
    globalMapControls.hidden = shouldHide;
    globalMapControls.style.removeProperty("opacity");
    globalMapControls.style.removeProperty("visibility");
    globalMapControls.style.removeProperty("transform");
    lastGlobalMapControlsHidden = shouldHide;
    return;
  }
  if (shouldHide === lastGlobalMapControlsHidden && globalMapControls.hidden === shouldHide) return;
  globalMapControlsTween?.kill();
  lastGlobalMapControlsHidden = shouldHide;
  if (shouldHide) {
    globalMapControlsTween = gsap.to(globalMapControls, {
      autoAlpha: 0,
      y: 8,
      duration: 0.18,
      ease: "power2.in",
      overwrite: true,
      onComplete() {
        globalMapControls.hidden = true;
        globalMapControlsTween = null;
        gsap.set(globalMapControls, { clearProps: "opacity,visibility,transform" });
      },
      onInterrupt() {
        globalMapControlsTween = null;
      }
    });
    return;
  }
  globalMapControls.hidden = false;
  globalMapControlsTween = gsap.fromTo(globalMapControls, {
    autoAlpha: 0,
    y: 8
  }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.24,
    ease: "power3.out",
    overwrite: true,
    onComplete() {
      globalMapControlsTween = null;
      gsap.set(globalMapControls, { clearProps: "opacity,visibility,transform" });
    },
    onInterrupt() {
      globalMapControlsTween = null;
    }
  });
}

function syncBackgroundAudio() {
  if (!backgroundAudio || !uiState.audio?.licenseReady) return;
  const shouldPlay = uiState.audio.enabled && !uiState.audio.muted;
  const baseVolume = Math.max(0, Math.min(1, uiState.audio.volume || 0.32));
  backgroundAudio.volume = shouldPlay ? (uiState.story?.isPlaying ? baseVolume : baseVolume * 0.42) : 0;
  if (!shouldPlay) {
    backgroundAudio.pause();
    return;
  }
  const playResult = backgroundAudio.play();
  if (playResult?.catch) {
    playResult.catch(() => {
      renderRouteReader();
      syncGlobalMusicControl();
    });
  }
}

function scheduleStoryAutoplay() {
  window.clearTimeout(storyAutoTimer);
  const route = routes[activeRoute];
  if (!route || !uiState.story?.isPlaying) return;
  if (activeRouteStep >= route.eventIds.length - 1) {
    stopStoryAutoplay();
    renderRouteReader();
    return;
  }
  storyAutoTimer = window.setTimeout(() => {
    if (!uiState.story?.isPlaying || uiState.story.transitioning) return;
    nextRouteStep({ keepPlaying: true, animate: true });
    window.setTimeout(scheduleStoryAutoplay, 1250);
  }, 6200);
}

function markCurrentStepRead() {
  const route = routes[activeRoute];
  if (!route || activeRoute === "all") return;
  completedEventIds.add(route.eventIds[activeRouteStep]);
  saveProgress();
  renderRouteReader();
}

function renderRouteReader() {
  if (!routeReader) return;
  const route = routes[activeRoute];
  routeReader.classList.toggle("collapsed", !uiState.panels.routeReaderOpen || !route || activeRoute === "all");
  if (!uiState.panels.routeReaderOpen || !route || activeRoute === "all") {
    routeReader.innerHTML = "";
    return;
  }
  const eventId = route.eventIds[activeRouteStep];
  const item = eventById[eventId];
  const scene = storySceneForEvent(item, route, activeRouteStep);
  const whyItMatters = scene.whyItMatters || whyMattersForEvent(item);
  const isPlaying = Boolean(uiState.story?.isPlaying);
  const musicMuted = uiState.audio?.muted !== false;
  const expanded = Boolean(uiState.panels.routeReaderExpanded);
  const progress = ((activeRouteStep + 1) / route.eventIds.length) * 100;
  routeReader.innerHTML = `
    <div class="route-reader-head">
      <p class="eyebrow">Story Guide</p>
      <button class="route-reader-close" type="button" aria-label="退出故事">×</button>
    </div>
    <div class="story-mobile-priority">
      <small>${scene.yearLabel}</small>
      <h2>${scene.title}</h2>
      <span>${activeRouteStep + 1}/${route.eventIds.length}</span>
    </div>
    <h2 class="route-title">${route.title}</h2>
    <p class="route-question">${route.guidingQuestion}</p>
    <div class="route-progress" aria-label="故事进度">
      <span>第 ${activeRouteStep + 1} 幕 / 共 ${route.eventIds.length} 幕</span>
      <span>${scene.yearLabel}</span>
    </div>
    <div class="route-meter"><i style="width:${progress}%"></i></div>
    <div class="route-reader-actions story-control-dock" aria-label="故事播放控制">
      <button class="story-icon-button" type="button" data-route-action="prev" aria-label="上一幕" ${activeRouteStep === 0 ? "disabled" : ""}><span aria-hidden="true">‹</span></button>
      <button class="story-icon-button primary" type="button" data-route-action="play" aria-label="${isPlaying ? "暂停故事" : "播放故事"}"><span aria-hidden="true">${isPlaying ? "Ⅱ" : "▶"}</span></button>
      <button class="story-icon-button primary" type="button" data-route-action="next" aria-label="继续下一幕" ${activeRouteStep === route.eventIds.length - 1 ? "disabled" : ""}><span aria-hidden="true">›</span></button>
      <button class="story-icon-button" type="button" data-route-action="expand" aria-label="${expanded ? "收起正文" : "展开正文"}"><span aria-hidden="true">${expanded ? "⌄" : "⌃"}</span></button>
    </div>
    <article class="route-current">
      <small>${scene.yearLabel}</small>
      <h3>${scene.title}</h3>
      <p class="story-summary">${scene.narrative}</p>
      <p class="story-why-it-matters">${whyItMatters}</p>
      <div class="story-expanded-copy">
        <p>${scene.narrative}</p>
        <p>${whyItMatters}</p>
        <strong>${scene.bridgeToNext}</strong>
      </div>
    </article>
    <div class="route-reader-secondary">
      <button type="button" data-route-action="whole-map">自由探索</button>
      <button class="route-reset" type="button">重新开始</button>
      <button type="button" data-route-action="music-toggle" ${uiState.audio?.licenseReady ? "" : "disabled"}>${musicMuted ? "播放音乐" : "暂停音乐"}</button>
    </div>
    <p class="music-license-note">${backgroundMusic.attribution}</p>
  `;
  routeReader.querySelector(".route-reader-close")?.addEventListener("click", exitRouteReader);
  routeReader.querySelector(".story-mobile-priority")?.addEventListener("click", () => {
    if (uiState.panels.detailOpen) closeDetailPanel();
  });
  routeReader.querySelector('[data-route-action="prev"]')?.addEventListener("click", previousRouteStep);
  routeReader.querySelector('[data-route-action="next"]')?.addEventListener("click", nextRouteStep);
  routeReader.querySelector('[data-route-action="play"]')?.addEventListener("click", toggleStoryAutoplay);
  routeReader.querySelector('[data-route-action="expand"]')?.addEventListener("click", toggleStoryPanelExpanded);
  routeReader.querySelector('[data-route-action="music-toggle"]')?.addEventListener("click", toggleBackgroundMusic);
  routeReader.querySelector('[data-route-action="whole-map"]')?.addEventListener("click", () => {
    exitRouteReader();
  });
  routeReader.querySelector(".route-reset")?.addEventListener("click", () => {
    activeRouteStep = 0;
    previousStoryEventId = null;
    uiState = startStoryState(uiState, activeRoute, 0, route.eventIds);
    hydrateLegacyFromUiState();
    saveProgress();
    goToRouteStep(0);
  });
}

function storySceneForEvent(item, route, index) {
  if (!item) {
    return {
      yearLabel: "",
      title: "故事幕",
      narrative: route.description,
      whyItMatters: "这一幕帮你判断路线正在回答什么问题。",
      bridgeToNext: "继续向前，下一幕会把这条线索接上。"
    };
  }
  const explicit = storyScenes[activeRoute]?.find((scene) => scene.eventId === item.id);
  if (explicit) return explicit;
  const learning = getEventLearning(item);
  const next = eventById[route.eventIds[index + 1]];
  return {
    yearLabel: formatYear(item.year),
    title: item.title,
    narrative: `${item.summary} ${learning.changed || ""}`.trim(),
    whyItMatters: whyMattersForEvent(item),
    bridgeToNext: next
      ? `下一幕，镜头会移向「${next.title}」，看这股力量怎样继续改变历史。`
      : "故事线走到这里暂告一段落，你可以回到全图自由探索。"
  };
}

function whyMattersForEvent(item) {
  if (!item) return "这一幕帮你判断路线正在回答什么问题。";
  const learning = getEventLearning(item);
  return learning.because
    ? `为什么重要：${learning.because}`
    : `为什么重要：它把「${item.title}」从孤立事件变成后续制度、信仰或国家变化的线索。`;
}

function toggleStoryPanelExpanded() {
  uiState.panels.routeReaderExpanded = !uiState.panels.routeReaderExpanded;
  uiState.story.panelState = uiState.panels.routeReaderExpanded ? "expanded" : "mini";
  renderRouteReader();
  syncUIFromState();
}

function progressForRoute(routeId) {
  const route = routes[routeId];
  if (!route) return 0;
  const saved = readProgress();
  if (saved.lastRouteId === routeId && Number.isInteger(saved.lastRouteStep)) {
    return Math.max(0, Math.min(route.eventIds.length - 1, saved.lastRouteStep));
  }
  return 0;
}

function readProgress() {
  try {
    return JSON.parse(window.localStorage.getItem(progressStorageKey) || "{}");
  } catch {
    return {};
  }
}

function loadProgress() {
  const saved = restoreProgress(readProgress());
  completedEventIds = new Set(saved.completedEventIds);
  completedQuizIds = new Set(saved.completedQuizIds);
  if (saved.lastRouteId && routes[saved.lastRouteId]) {
    activeRoute = saved.lastRouteId;
    activeRouteStep = progressForRoute(saved.lastRouteId);
    uiState.story.lastRouteId = saved.lastRouteId;
    uiState.story.lastStep = activeRouteStep;
    uiState.story.hasStarted = activeRouteStep > 0 || saved.completedEventIds.length > 0;
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(progressStorageKey, serializeProgress({
      completedEventIds: Array.from(completedEventIds),
      completedQuizIds: Array.from(completedQuizIds),
      lastRouteId: activeRoute === "all" ? "westernMain" : activeRoute,
      lastRouteStep: activeRouteStep
    }));
  } catch {
    // Private browsing or local files can block storage; the UI should still work.
  }
  syncIntroProgressEntry();
}

function currentViewportState() {
  return {
    isMobile: isMobileViewport(),
    isPortrait: isMobilePortraitViewport(),
    lowZoomPreview: document.querySelector(".atlas-app")?.classList.contains("mobile-fit-preview") || false
  };
}

function syncMobileViewportInsets() {
  const app = document.querySelector(".atlas-app");
  if (!app) return;
  if (!isMobilePortraitViewport()) {
    app.style.setProperty("--mobile-browser-bottom", "0px");
    return;
  }
  const fallbackBottom = 28;
  const viewport = window.visualViewport;
  const coveredBottom = viewport
    ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    : 0;
  app.style.setProperty("--mobile-browser-bottom", `${Math.round(Math.max(fallbackBottom, coveredBottom))}px`);
}

function dispatch(action, options = {}) {
  previousStateSnapshot = uiState;
  uiState = reduceUiState(uiState, action);
  hydrateLegacyFromUiState();
  if (options.renderGraph) renderGraph();
  if (options.renderRouteReader !== false) renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  return uiState;
}

function hydrateLegacyFromUiState() {
  activeRoute = uiState.activeRouteId || "all";
  activeEntity = uiState.activeEntityId || "all";
  activeRelation = uiState.activeRelationId || "all";
  activeTimeRange = uiState.activeTimeRange ? { ...uiState.activeTimeRange } : null;
  selected = { ...(uiState.selected || { kind: "none", id: null }) };
  activeRouteStep = uiState.routeStep || 0;
  learningMode = uiState.mode === "routeReading" || uiState.mode === "story";
  routeSelect.value = activeRoute;
  entitySelect.value = activeEntity;
  chips.forEach((chip) => chip.classList.toggle("active", chip.dataset.filter === activeRelation));
  syncFilterRouteQuick();
}

function syncUIFromState() {
  const app = document.querySelector(".atlas-app");
  if (!app) return;
  const panels = getPanelPresentation(uiState);
  app.classList.toggle("route-reading", uiState.mode === "routeReading");
  app.classList.toggle("story-mode", uiState.mode === "story");
  app.classList.toggle("story-playing", Boolean(uiState.story?.isPlaying));
  app.classList.toggle("story-transitioning", Boolean(uiState.story?.transitioning));
  app.classList.toggle("story-panel-mini", panels.storyGuide === "mini");
  app.classList.toggle("story-panel-expanded", panels.storyGuide === "expanded" || panels.storyGuide === "rail");
  app.classList.toggle("story-panel-rail", panels.storyGuide === "rail");
  app.classList.toggle("story-filter-peek", panels.filter === "peek");
  app.classList.toggle("route-reader-open", uiState.panels.routeReaderOpen);
  app.classList.toggle("route-reader-suspended", panels.routeReader === "suspended");
  app.classList.toggle("route-reader-mini", panels.routeReader === "mini");
  app.classList.toggle("route-reader-expanded", panels.routeReader === "expanded");
  app.classList.toggle("filter-open", uiState.panels.filterOpen || panels.filter === "peek");
  app.classList.toggle("detail-open", uiState.panels.detailOpen);
  app.classList.toggle("audio-muted", Boolean(uiState.audio?.muted));
  app.classList.toggle("audio-unavailable", !uiState.audio?.licenseReady);
  app.classList.toggle("mobile-panel-open", uiState.viewport.isMobile && (uiState.panels.filterOpen || uiState.panels.storyFilterPeekOpen || uiState.panels.detailOpen || uiState.panels.routeReaderOpen));
  filterDrawer.classList.toggle("collapsed", panels.filter === "closed");
  filterDrawer.classList.toggle("story-filter-peek-drawer", panels.filter === "peek");
  detailPanel.classList.toggle("collapsed", !uiState.panels.detailOpen);
  if (!uiState.panels.routeReaderOpen) {
    routeReader?.classList.add("collapsed");
  }
  if (uiState.mode !== "story") clearStoryFocusHud();
  if (storyEntryButton) {
    const hasStoryProgress = Boolean(uiState.story?.hasStarted);
    storyEntryButton.textContent = uiState.mode === "story"
      ? (uiState.story?.isPlaying ? "故事播放中" : "故事导览中")
      : (hasStoryProgress ? "继续故事" : "开始故事");
  }
  syncExploreNavControls();
  syncGlobalMusicControl();
  syncBackgroundAudio();
}

function closeTopPanel() {
  if (uiState.panels.detailOpen) {
    closeDetailPanel();
    return true;
  }
  if (uiState.panels.filterOpen || uiState.panels.storyFilterPeekOpen) {
    uiState = closeFilterPanel(uiState);
    hydrateLegacyFromUiState();
    renderRouteReader();
    syncUIFromState();
    return true;
  }
  if (uiState.panels.routeReaderOpen) {
    exitRouteReader();
    return true;
  }
  return false;
}

function toggleControlState(forceCollapsed) {
  const app = document.querySelector(".atlas-app");
  const collapsed = typeof forceCollapsed === "boolean" ? forceCollapsed : !app.classList.contains("controls-collapsed");
  app.classList.toggle("controls-collapsed", collapsed);
  filterDrawer.classList.toggle("collapsed", collapsed);
  uiState = collapsed ? closeFilterPanel(uiState) : openFilterPanel(uiState);
  hydrateLegacyFromUiState();
  renderRouteReader();
  syncUIFromState();
  toggleControls.setAttribute("aria-expanded", String(!collapsed));
  toggleControls.textContent = collapsed ? "筛选" : (uiState.panels.storyFilterPeekOpen ? "故事筛选" : "收起筛选");
}

function toggleGlobalFilterShortcut() {
  const app = document.querySelector(".atlas-app");
  const opening = !(uiState.panels.filterOpen || uiState.panels.storyFilterPeekOpen);
  uiState = opening ? openFilterPanel(uiState) : closeFilterPanel(uiState);
  hydrateLegacyFromUiState();
  renderRouteReader();
  syncUIFromState();
  app?.classList.add("controls-collapsed");
  toggleControls.setAttribute("aria-expanded", String(opening));
  toggleControls.textContent = opening ? (uiState.panels.storyFilterPeekOpen ? "故事筛选" : "收起筛选") : "筛选";
}

function collapseControlsOnMobile() {
  if (!window.matchMedia("(max-width: 920px)").matches) return;
  toggleControlState(true);
}

function visibleBounds() {
  const scopedEvents = events.filter(isEventInScope);
  const scopedLinks = links.filter(isLinkInScope);
  const ids = new Set(scopedEvents.map((item) => item.id));
  scopedLinks.forEach((item) => {
    ids.add(item.source);
    ids.add(item.target);
  });
  if (!ids.size) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  ids.forEach((id) => {
    const item = eventById[id];
    const pos = eventPositions.get(id);
    if (!item || !pos) return;
    const radius = radiusForEvent(item) + 92;
    minX = Math.min(minX, pos.x - radius);
    maxX = Math.max(maxX, pos.x + radius);
    minY = Math.min(minY, pos.y - 98);
    maxY = Math.max(maxY, pos.y + 116);
  });
  if (!Number.isFinite(minX)) return null;
  return { minX, maxX, minY, maxY };
}

function fitCurrentSelection() {
  exitOverviewMode();
  const bounds = visibleBounds();
  if (!bounds) {
    fitWholeMap(true, { context: "whole" });
    return;
  }
  fitBounds(bounds, true, 170, {
    context: selectionPreviewContext(),
    mobileLowZoomPreview: true,
    verticalRatio: 0.48
  });
}

function fitInitialEntryView(animated = true) {
  const app = document.querySelector(".atlas-app");
  if (isMobilePortraitViewport()) {
    app?.classList.add("mobile-entry-preview");
    app?.classList.remove("mobile-entry-zooming", "mobile-fit-preview");
    setMobilePreviewText("正在打开历史档案主线", "从古代法典、信仰与城邦出发，进入西方秩序的第一条阅读路线。");
    renderGraph();
    fitMobileEntryPreview(animated);
    return;
  }
  app?.classList.remove("mobile-entry-preview", "mobile-entry-zooming", "mobile-fit-preview");
  fitWholeMap(animated, { context: "whole" });
}

function fitWholeMap(animated = true, options = {}) {
  fitBounds({
    minX: 0,
    maxX: graphSize.width,
    minY: 0,
    maxY: graphSize.height
  }, animated, 30, {
    context: options.context || "whole",
    mobileLowZoomPreview: true,
    verticalRatio: 0.46
  });
}

function fitMobileEntryPreview(animated = true) {
  const bounds = boundsForEventIds(Array.from(mobileEntryEventIds), 190);
  if (!bounds) {
    fitWholeMap(animated, { context: "entry" });
    return;
  }
  fitBounds(bounds, animated, 220, { minZoom: mobileReadableZoom, maxZoom: 0.3, verticalRatio: 0.47, context: "entry" });
}

function boundsForEventIds(ids, radiusPadding = 120) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  ids.forEach((id) => {
    const item = eventById[id];
    const pos = eventPositions.get(id);
    if (!item || !pos) return;
    const radius = radiusForEvent(item) + radiusPadding;
    minX = Math.min(minX, pos.x - radius);
    maxX = Math.max(maxX, pos.x + radius);
    minY = Math.min(minY, pos.y - radius * 0.86);
    maxY = Math.max(maxY, pos.y + radius);
  });
  if (!Number.isFinite(minX)) return null;
  return { minX, maxX, minY, maxY };
}

function fitBounds(bounds, animated = true, padding = 170, options = {}) {
  const scroller = document.querySelector(".graph-scroll");
  if (!scroller) return;
  const width = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
  const height = Math.max(1, bounds.maxY - bounds.minY + padding * 2);
  const fitZoom = Math.min(scroller.clientWidth / width, scroller.clientHeight / height, zoomMax);
  const shouldUseMobilePreview = Boolean(options.mobileLowZoomPreview && isMobileViewport() && fitZoom < mobileReadableZoom);
  const minZoom = options.minZoom ?? (shouldUseMobilePreview ? mobileReadableZoom : zoomMin);
  const maxZoom = options.maxZoom ?? zoomMax;
  const nextZoom = Math.max(minZoom, Math.min(maxZoom, fitZoom));
  updateMobileFitPreview(shouldUseMobilePreview, options.context);
  zoomLevel = Number(nextZoom.toFixed(2));
  applyZoom(zoomLevel);
  const targetLeft = Math.max(0, (bounds.minX + bounds.maxX) * 0.5 * zoomLevel - scroller.clientWidth * 0.5);
  const verticalRatio = options.verticalRatio ?? 0.5;
  const targetTop = Math.max(0, (bounds.minY + bounds.maxY) * 0.5 * zoomLevel - scroller.clientHeight * verticalRatio);
  if (animated && "scrollTo" in scroller) {
    scroller.scrollTo({ left: targetLeft, top: targetTop, behavior: "smooth" });
  } else {
    scroller.scrollLeft = targetLeft;
    scroller.scrollTop = targetTop;
  }
  updateTimelineRuler();
}

function selectionPreviewContext() {
  if (activeRoute !== "all") return `route:${activeRoute}`;
  if (activeEntity !== "all") return `entity:${activeEntity}`;
  if (activeRelation !== "all") return `relation:${activeRelation}`;
  if (activeTimeRange) return "time";
  return "whole";
}

function updateMobileFitPreview(active, context = "whole") {
  const app = document.querySelector(".atlas-app");
  if (!app) return;
  window.clearTimeout(mobileFitPreviewTimer);
  mobileFitPreviewTimer = null;
  app.classList.toggle("mobile-fit-preview", active);
  if (!active) return;
  app.classList.remove("mobile-entry-preview", "mobile-entry-zooming");
  setMobilePreviewText(...mobileFitPreviewText(context));
  mobileFitPreviewTimer = window.setTimeout(dismissMobileFitPreview, 2800);
}

function dismissMobileFitPreview() {
  window.clearTimeout(mobileFitPreviewTimer);
  mobileFitPreviewTimer = null;
  document.querySelector(".atlas-app")?.classList.remove("mobile-fit-preview");
}

function mobileFitPreviewText(context) {
  if (context?.startsWith("route:")) {
    const route = routes[context.split(":")[1]];
    return ["路线总览已优化为可读视图", route ? `当前路线：${route.title}。左右拖动可沿完整路线阅读，放大后会恢复全部标签。` : "左右拖动可沿完整路线阅读，放大后会恢复全部标签。"];
  }
  if (context?.startsWith("entity:")) {
    const entity = entities[context.split(":")[1]];
    return ["政治实体总览已优化为可读视图", entity ? `当前实体：${entity}。低缩放下先突出相关事件和线路。` : "低缩放下先突出相关事件和线路。"];
  }
  if (context?.startsWith("relation:")) {
    const relation = relationStyles[context.split(":")[1]]?.label;
    return ["关系线路总览已优化为可读视图", relation ? `当前关系：${relation}。低缩放下先保留主路径轮廓。` : "低缩放下先保留主路径轮廓。"];
  }
  if (context === "time") return ["时间区间总览已优化为可读视图", "当前区间跨度较长，先用可读缩放呈现主要事件；继续拖动可浏览完整范围。"];
  return ["完整地图已优化为可读视图", "移动端低缩放会自动简化标签和旗帜，避免全图压成远景缩略图。"];
}

function setMobilePreviewText(title, description) {
  if (mobilePreviewTitle) mobilePreviewTitle.textContent = title;
  if (mobilePreviewDescription) mobilePreviewDescription.textContent = description;
}

function exitOverviewMode() {
  if (!overviewMode) return false;
  killOverviewZoomTween();
  overviewMode = false;
  dismissMobileFitPreview();
  document.querySelector(".atlas-app")?.classList.remove("overview-mode", "mobile-entry-preview", "mobile-entry-zooming", "mobile-fit-preview");
  renderGraph();
  return true;
}

function metaBlock(title, content) {
  return `<section class="meta-block"><strong>${title}</strong><div>${content}</div></section>`;
}

function getEventLearning(item) {
  const specific = learningContent[item.id] || item.learning || {};
  return {
    why: specific.why || eventContext(item),
    changed: specific.changed || eventSignificance(item),
    comparison: specific.comparison || `${dynastyForYear(item.year)}。这个参照帮助你把西方事件放回同一时间尺度，而不是孤立背年份。`,
    misconception: specific.misconception || "不要把这个节点当作单点原因，它通常是长期结构变化中的一个可见转折。",
    sources: specific.sources || [
      { title: "A History of Western Society", author: "McKay et al.", note: "用于通史框架和时间线校准。" },
      { title: "Encyclopaedia Britannica / Oxford Reference", author: "reference editors", note: "用于事件释义和人物背景交叉核对。" }
    ],
    quiz: specific.quiz || {
      prompt: `理解 ${item.title} 时，最应该抓住哪一点？`,
      options: ["它改变了权力、制度或信仰之间的连接方式", "它与后续历史完全无关", "它只是一条孤立年份"],
      answer: "它改变了权力、制度或信仰之间的连接方式",
      explanation: "历史节点的价值在于它如何改变后续路径，而不只是年份本身。"
    }
  };
}

function renderSources(sources) {
  return `<div class="source-list">${sources.map((source) => `
    <article class="source-item">
      <h4>${source.title}</h4>
      <p>${source.author} · ${source.note}</p>
    </article>
  `).join("")}</div>`;
}

function renderQuiz(eventId, quiz) {
  const completed = completedQuizIds.has(eventId);
  return `
    <div class="quiz-card" data-quiz-id="${eventId}">
      <p>${quiz.prompt}</p>
      <div class="quiz-options">
        ${quiz.options.map((option) => `
          <button type="button" data-answer="${escapeAttribute(option)}" ${completed ? "disabled" : ""}>${option}</button>
        `).join("")}
      </div>
      <div class="quiz-feedback" aria-live="polite">${completed ? `已完成。${quiz.explanation}` : ""}</div>
    </div>
  `;
}

function bindQuiz(eventId, quiz) {
  const card = detailMeta.querySelector(`[data-quiz-id="${eventId}"]`);
  if (!card) return;
  const feedback = card.querySelector(".quiz-feedback");
  card.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = button.dataset.answer === quiz.answer;
      card.querySelectorAll("[data-answer]").forEach((item) => {
        item.disabled = true;
        item.classList.toggle("correct", item.dataset.answer === quiz.answer);
        item.classList.toggle("incorrect", item === button && !correct);
      });
      feedback.textContent = `${correct ? "答对了。" : "还差一点。"}${quiz.explanation}`;
      completedQuizIds.add(eventId);
      completedEventIds.add(eventId);
      saveProgress();
      renderRouteReader();
    });
  });
}

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function tagList(items) {
  return `<div class="tag-list">${items.map((item) => `<span class="tag">${item}</span>`).join("")}</div>`;
}

function iconForEvent(item) {
  if (item.type === "conflict") return "×";
  if (item.type === "expansion") return "→";
  if (item.type === "institution") return "§";
  if (item.type === "alliance") return "∞";
  if (item.type === "split") return "◇";
  return typeIcons[item.layer] || typeIcons[item.type] || "●";
}

function flagsForEvent(item) {
  const modern = item.year >= 1450 || item.entities.some((entity) => ["usa", "eu", "nato", "ukraine", "england", "france", "prussia", "russia", "italy", "spain", "dutch"].includes(entity));
  if (!modern) return "";
  return item.entities
    .map((entity) => entityFlags[entity])
    .filter(Boolean)
    .slice(0, 5)
    .join(" ");
}

function renderFlagSpans(element, item) {
  const flags = flagTokensForEvent(item);
  const spacing = 19 / zoomLevel;
  const start = -((flags.length - 1) * spacing) / 2;
  flags.forEach((flag, index) => {
    const tspan = createSvgElement("tspan", {
      x: String(start + index * spacing),
      dy: index === 0 ? "0" : "0"
    });
    tspan.textContent = flag;
    element.append(tspan);
  });
}

function flagTokensForEvent(item) {
  const modern = item.year >= 1450 || item.entities.some((entity) => ["usa", "eu", "nato", "ukraine", "england", "france", "prussia", "russia", "italy", "spain", "dutch"].includes(entity));
  if (!modern) return [];
  return item.entities
    .map((entity) => entityFlags[entity])
    .filter(Boolean)
    .slice(0, 5);
}

function visualTokensForEvent(item) {
  const assets = archiveImagesForEvent(item);
  const tokens = item.entities
    .map((entity) => ({ value: entityFlags[entity], label: entities[entity] }))
    .filter((token) => token.value)
    .slice(0, 5);
  return [
    ...assets.map((asset) => visualToken(`<img src="${asset.src}" alt="${asset.alt}">`, asset.alt)),
    visualToken(iconForEvent(item), eventTypeLabels[item.type] || eventTypeLabels[item.layer] || "事件类型"),
    ...tokens.map((token) => visualToken(token.value, token.label))
  ].join("");
}

function visualTokensForLink(item) {
  const tokens = item.entities
    .map((entity) => ({ value: entityFlags[entity], label: entities[entity] }))
    .filter((token) => token.value)
    .slice(0, 6);
  return [
    visualToken(relationStyles[item.type].label, "关系类型"),
    ...tokens.map((token) => visualToken(token.value, token.label))
  ].join("");
}

function visualToken(content, label) {
  return `<span class="visual-token" title="${label}"><span class="token-symbol">${content}</span><small>${label}</small></span>`;
}

function archiveImagesForEvent(item) {
  if (item.layer === "religion") {
    return [{ src: "assets/cathedral.svg", alt: "宗教建筑档案图" }];
  }
  if (item.layer === "monarchy" || item.type === "institution") {
    return [{ src: "assets/crown.svg", alt: "王权制度档案图" }];
  }
  if (item.layer === "classical" || item.layer === "ancient") {
    return [{ src: "assets/classical-bust.svg", alt: "古典人物档案图" }];
  }
  return [{ src: "assets/parchment-assembly.svg", alt: "档案文书图" }];
}

function personCards(item) {
  if (!item.people.length) return "这个事件更适合从制度或群体角度理解，没有单一人物能代表全部变化。";
  return `<div class="person-grid">${item.people.map((person) => `
    <article class="person-card">
      <span class="person-avatar">${person.slice(0, 1)}</span>
      <div>
        <h4>${person}</h4>
        <p>${personIntro(person, item)}</p>
      </div>
    </article>
  `).join("")}</div>`;
}

function personIntro(person, item) {
  if (item.layer === "religion") return `${person} 与这一事件中的宗教权威、教会组织或信仰传播密切相关，是理解宗教与政治关系的入口。`;
  if (item.layer === "monarchy") return `${person} 代表此阶段王权、帝国或国家建构中的关键力量，能帮助读者理解权力如何集中或转移。`;
  if (item.type === "conflict") return `${person} 处在冲突与秩序重组的中心，相关选择影响了战争、分裂或政治合法性。`;
  if (item.layer === "revolution") return `${person} 体现了思想、制度或社会动员的变化，是理解旧秩序被挑战的重要线索。`;
  return `${person} 是该事件的重要人物之一，可从其行动与身份理解事件对后续历史结构的影响。`;
}

function eventContext(item) {
  const entityText = item.entities.map((entity) => entities[entity]).filter(Boolean).slice(0, 4).join("、");
  return `这件事发生在 ${formatYear(item.year)} 前后，主要涉及 ${entityText || "多个政治与文化共同体"}。它既有当时的直接原因，也通过制度、信仰或国家权力继续影响后续事件。`;
}

function eventSignificance(item) {
  const impactText = Object.values(item.impacts || {}).slice(0, 2).join(" ");
  return impactText || "它的重要性在于改变了事件之间的连接方式，使后续政治、宗教或国际秩序出现新的路径。";
}

function showHoverTooltip(item, pos) {
  const scroller = document.querySelector(".graph-scroll");
  const rect = scroller.getBoundingClientRect();
  const x = rect.left + pos.x * zoomLevel - scroller.scrollLeft + 22;
  const y = rect.top + pos.y * zoomLevel - scroller.scrollTop - 18;
  hoverTooltip.innerHTML = `
    <h3>${item.title}</h3>
    <p>${shortenText(item.summary, 92)}</p>
    <div class="tooltip-meta">
      <span>${formatYear(item.year)}</span>
      <span>${eventTypeLabels[item.type] || eventTypeLabels[item.layer] || item.layer}</span>
      <span>${dynastyForYear(item.year)}</span>
    </div>
  `;
  hoverTooltip.hidden = false;
  const tooltipWidth = 320;
  const left = Math.min(window.innerWidth - tooltipWidth - 12, Math.max(12, x));
  const top = Math.min(window.innerHeight - 160, Math.max(92, y));
  hoverTooltip.style.left = `${left}px`;
  hoverTooltip.style.top = `${top}px`;
}

function hideHoverTooltip() {
  hoverTooltip.hidden = true;
}

function shortenText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function detailBadgesForEvent(item) {
  const typeLabel = eventTypeLabels[item.type] || eventTypeLabels[item.layer] || item.layer;
  const entityLabels = item.entities.map((entity) => entities[entity]).filter(Boolean).slice(0, 3);
  return [
    formatYear(item.year),
    typeLabel,
    ...entityLabels
  ].map((label) => `<span class="detail-badge">${label}</span>`).join("");
}

function detailBadgesForLink(item) {
  const labels = [
    relationStyles[item.type].label,
    `权重 ${item.weight}`,
    ...item.entities.map((entity) => entities[entity]).filter(Boolean).slice(0, 2)
  ];
  return labels.map((label) => `<span class="detail-badge">${label}</span>`).join("");
}

function timeToX(year) {
  const segments = [
    { from: -3000, to: -1000, x1: 240, x2: 1320 },
    { from: -1000, to: 500, x1: 1320, x2: 2950 },
    { from: 500, to: 1200, x1: 2950, x2: 4240 },
    { from: 1200, to: 1500, x1: 4240, x2: 5420 },
    { from: 1500, to: 1800, x1: 5420, x2: 6800 },
    { from: 1800, to: 1900, x1: 6800, x2: 7520 },
    { from: 1900, to: 1950, x1: 7520, x2: 8100 },
    { from: 1950, to: 2026, x1: 8100, x2: 9600 }
  ];
  const segment = segments.find((item) => year >= item.from && year <= item.to) || segments[segments.length - 1];
  const t = (year - segment.from) / (segment.to - segment.from);
  return Math.round(segment.x1 + t * (segment.x2 - segment.x1));
}

function computeEventPositions() {
  const positions = new Map();
  Object.keys(regions).forEach((layer) => {
    const region = regions[layer];
    const layerEvents = events
      .filter((item) => item.layer === layer)
      .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    const lastRightByLane = Array(region.lanes).fill(-Infinity);
    layerEvents.forEach((item, index) => {
      const desiredX = timeToX(item.year);
      const radius = radiusForEvent(item);
      const hasFlags = flagTokensForEvent(item).length > 0;
      const labelWidth = Math.min(380, Math.max(156, item.title.length * 20 + 90));
      const nodeWidth = Math.max(labelWidth, radius * 2 + (hasFlags ? 132 : 92));
      const minGap = 108;
      let lane = lastRightByLane.findIndex((right) => desiredX - nodeWidth / 2 - right > minGap);
      let x = desiredX;
      if (lane === -1) {
        lane = lastRightByLane
          .map((right, laneIndex) => ({ right, laneIndex }))
          .sort((a, b) => a.right - b.right)[0].laneIndex;
        x = Math.max(desiredX, lastRightByLane[lane] + minGap + nodeWidth / 2);
      }
      x = Math.min(graphSize.width - 120, Math.max(120, Math.round(x)));
      lastRightByLane[lane] = x + nodeWidth / 2;
      const laneGap = (region.height - 132) / Math.max(1, region.lanes - 1);
      const stagger = index % 2 === 0 ? -10 : 10;
      const y = Math.round(region.top + 84 + lane * laneGap + stagger);
      positions.set(item.id, { x, y, lane });
    });
  });
  return positions;
}

const majorEventIds = new Set([
  "athens", "romanRepublic", "augustus", "jesus", "constantine", "westFall", "islam",
  "charlemagne", "schism1054", "canossa", "crusades", "magnaCarta", "reconquista1492",
  "reformation", "councilTrent", "westphalia", "glorious", "enlightenment", "american",
  "frenchRevolution", "napoleon", "industrial", "italyGermany", "ww1", "russianRev",
  "ww2", "holocaust", "unNatoEU", "coldWar", "1989", "maastricht", "brexit",
  "ukraine2022", "west2026"
]);

function importanceForEvent(item) {
  const linkScore = links
    .filter((linkItem) => linkItem.source === item.id || linkItem.target === item.id)
    .reduce((sum, linkItem) => sum + linkItem.weight, 0);
  const base = majorEventIds.has(item.id) ? 5 : item.year >= 1900 ? 3 : 2;
  return Math.min(6, base + Math.floor(linkScore / 12));
}

function radiusForEvent(item) {
  const importance = importanceForEvent(item);
  return 8 + importance * 3.2;
}

function formatYear(year) {
  return year < 0 ? `前${Math.abs(year)}` : String(year);
}

function centerOnEvent(id, horizontalRatio = 0.5) {
  const item = eventById[id];
  const scroller = document.querySelector(".graph-scroll");
  if (!item || !scroller) return;
  const pos = eventPositions.get(id) || { x: timeToX(item.year), y: regions[item.layer].top };
  scroller.scrollLeft = Math.max(0, pos.x * zoomLevel - scroller.clientWidth * horizontalRatio);
  scroller.scrollTop = Math.max(0, pos.y * zoomLevel - scroller.clientHeight * 0.52);
}

function focusExploreEvent(eventId, animated = true) {
  const scroller = document.querySelector(".graph-scroll");
  const item = eventById[eventId];
  if (!scroller || !item) return;
  const targetZoom = isMobileViewport() ? Math.max(0.58, zoomLevel) : Math.max(0.82, zoomLevel);
  const pos = eventPositions.get(eventId) || { x: timeToX(item.year), y: regions[item.layer].top };
  const target = calculateStoryCameraTarget({
    eventPosition: pos,
    scrollerSize: { width: scroller.clientWidth, height: scroller.clientHeight },
    graphSize,
    targetZoom,
    focusViewport: getStoryFocusViewport({
      width: scroller.clientWidth,
      height: scroller.clientHeight,
      isMobile: isMobileViewport(),
      isPortrait: isMobilePortraitViewport(),
      storyPanelOpen: false,
      detailOpen: uiState.panels.detailOpen,
      filterOpen: uiState.panels.filterOpen
    })
  });
  if (prefersReducedMotion() || !animated) {
    killExploreCameraTween();
    setZoom(target.zoom);
    scroller.scrollLeft = target.left;
    scroller.scrollTop = target.top;
    return;
  }
  animateExploreCamera(target);
}

function animateExploreCamera(target) {
  const scroller = document.querySelector(".graph-scroll");
  if (!scroller || !target) return;
  const gsap = getGsap();
  const app = document.querySelector(".atlas-app");
  if (!gsap || prefersReducedMotion()) {
    setZoom(target.zoom);
    scroller.scrollLeft = target.left;
    scroller.scrollTop = target.top;
    updateTimelineRuler();
    return;
  }
  killExploreCameraTween();
  const cameraState = {
    zoom: zoomLevel,
    left: scroller.scrollLeft,
    top: scroller.scrollTop
  };
  app?.classList.add("explore-camera-moving");
  exploreCameraTween = gsap.to(cameraState, {
    zoom: target.zoom,
    left: target.left,
    top: target.top,
    duration: 0.62,
    ease: "power3.out",
    overwrite: true,
    onUpdate() {
      zoomLevel = Number(cameraState.zoom.toFixed(3));
      applyZoom(zoomLevel);
      scroller.scrollLeft = cameraState.left;
      scroller.scrollTop = cameraState.top;
      updateTimelineRuler();
    },
    onComplete() {
      exploreCameraTween = null;
      zoomLevel = target.zoom;
      applyZoom(zoomLevel);
      scroller.scrollLeft = target.left;
      scroller.scrollTop = target.top;
      app?.classList.remove("explore-camera-moving");
    },
    onInterrupt() {
      exploreCameraTween = null;
      app?.classList.remove("explore-camera-moving");
    }
  });
}

function focusStoryScene(eventId, previousEventId = null, animated = true) {
  const item = eventById[eventId];
  if (!item) return;
  const targetZoom = storyTargetZoom();
  const target = storyCameraTargetForEvent(eventId, targetZoom);
  if (prefersReducedMotion() || !animated) {
    killStoryCameraTween();
    setZoom(targetZoom);
    const scroller = document.querySelector(".graph-scroll");
    if (scroller && target) {
      scroller.scrollLeft = target.left;
      scroller.scrollTop = target.top;
    }
    renderStoryFocusHud(eventId);
    updateTimelineRuler();
    return;
  }
  animateStoryCamera(eventId, previousEventId, target);
}

function storyTargetZoom() {
  if (!isMobileViewport()) return 1.04;
  return isMobilePortraitViewport() ? 0.62 : 0.7;
}

function storyCameraTargetForEvent(eventId, targetZoom = storyTargetZoom()) {
  const scroller = document.querySelector(".graph-scroll");
  const item = eventById[eventId];
  if (!scroller || !item) return null;
  const pos = eventPositions.get(eventId) || { x: timeToX(item.year), y: regions[item.layer].top };
  const focusViewport = getStoryFocusViewport({
    width: scroller.clientWidth,
    height: scroller.clientHeight,
    isMobile: isMobileViewport(),
    isPortrait: isMobilePortraitViewport(),
    storyPanelOpen: uiState.panels.routeReaderOpen,
    detailOpen: uiState.panels.detailOpen,
    filterOpen: uiState.panels.filterOpen
  });
  return calculateStoryCameraTarget({
    eventPosition: pos,
    scrollerSize: { width: scroller.clientWidth, height: scroller.clientHeight },
    graphSize,
    targetZoom,
    focusViewport
  });
}

function animateStoryCamera(eventId, previousEventId, target) {
  const scroller = document.querySelector(".graph-scroll");
  const item = eventById[eventId];
  if (!scroller || !item || !target) return;
  const gsap = getGsap();
  if (!gsap || prefersReducedMotion()) {
    setZoom(target.zoom);
    scroller.scrollLeft = target.left;
    scroller.scrollTop = target.top;
    renderStoryFocusHud(eventId);
    updateTimelineRuler();
    return;
  }
  killStoryCameraTween();
  uiState = setStoryTransitioning(uiState, true);
  const transitionId = uiState.story.transitionId;
  syncUIFromState();
  const duration = uiState.story?.isPlaying ? 1100 : 900;
  const cameraState = {
    zoom: zoomLevel,
    left: scroller.scrollLeft,
    top: scroller.scrollTop
  };
  renderStoryFocusHud(eventId);

  storyCameraTween = gsap.to(cameraState, {
    zoom: target.zoom,
    left: target.left,
    top: target.top,
    duration: duration / 1000,
    ease: "power3.inOut",
    overwrite: true,
    onUpdate() {
      if (uiState.story.transitionId !== transitionId) {
        killStoryCameraTween();
        return;
      }
      zoomLevel = Number(cameraState.zoom.toFixed(3));
      applyZoom(zoomLevel);
      scroller.scrollLeft = cameraState.left;
      scroller.scrollTop = cameraState.top;
      positionStoryFocusHud(eventId);
      updateTimelineRuler();
    },
    onComplete() {
      if (uiState.story.transitionId !== transitionId) return;
      storyCameraTween = null;
      scroller.scrollLeft = target.left;
      scroller.scrollTop = target.top;
      zoomLevel = target.zoom;
      applyZoom(zoomLevel);
      positionStoryFocusHud(eventId);
      uiState = setStoryTransitioning(uiState, false);
      syncUIFromState();
      renderGraph();
      renderStoryFocusHud(eventId);
    },
    onInterrupt() {
      storyCameraTween = null;
    }
  });
}

function animateStoryFocusHud() {
  if (!storyFocusHud || prefersReducedMotion()) return;
  const gsap = getGsap();
  if (!gsap) return;
  const hudParts = storyFocusHud.querySelectorAll(".story-focus-core, .story-focus-halo, .story-focus-icon, .story-year-badge");
  gsap.killTweensOf([storyFocusHud, ...hudParts]);
  gsap.fromTo(storyFocusHud, {
    autoAlpha: 0
  }, {
    autoAlpha: 1,
    duration: 0.36,
    ease: "power3.out",
    overwrite: true
  });
  gsap.fromTo(hudParts, {
    autoAlpha: 0,
    scale: 0.82
  }, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.42,
    ease: "back.out(1.45)",
    stagger: 0.035,
    overwrite: true
  });
}

function renderStoryFocusHud(eventId) {
  if (!storyFocusHud) return;
  const item = eventById[eventId];
  if (!item || uiState.mode !== "story") {
    storyFocusHud.innerHTML = "";
    storyFocusHud.classList.remove("visible");
    return;
  }
  storyFocusHud.innerHTML = `
    <div class="story-focus-core"></div>
    <div class="story-focus-halo"></div>
    <div class="story-focus-icon">${iconForEvent(item)}</div>
    <div class="story-year-badge">${formatYear(item.year)}</div>
  `;
  storyFocusHud.classList.add("visible");
  positionStoryFocusHud(eventId);
  animateStoryFocusHud();
}

function clearStoryFocusHud() {
  if (!storyFocusHud) return;
  getGsap()?.killTweensOf([storyFocusHud, ...storyFocusHud.querySelectorAll("*")]);
  storyFocusHud.innerHTML = "";
  storyFocusHud.classList.remove("visible");
  storyFocusHud.style.removeProperty("opacity");
  storyFocusHud.style.removeProperty("visibility");
  const app = document.querySelector(".atlas-app");
  app?.style.removeProperty("--story-focus-x");
  app?.style.removeProperty("--story-focus-y");
}

function positionStoryFocusHud(eventId) {
  if (!storyFocusHud) return;
  const scroller = document.querySelector(".graph-scroll");
  const item = eventById[eventId];
  if (!scroller || !item) return;
  const pos = eventPositions.get(eventId) || { x: timeToX(item.year), y: regions[item.layer].top };
  const x = pos.x * zoomLevel - scroller.scrollLeft;
  const y = pos.y * zoomLevel - scroller.scrollTop;
  storyFocusHud.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  document.querySelector(".atlas-app")?.style.setProperty("--story-focus-x", `${Math.round(x)}px`);
  document.querySelector(".atlas-app")?.style.setProperty("--story-focus-y", `${Math.round(y)}px`);
}

function centerOnLink(item) {
  const scroller = document.querySelector(".graph-scroll");
  const sourcePos = eventPositions.get(item.source);
  const targetPos = eventPositions.get(item.target);
  if (!scroller || !sourcePos || !targetPos) return;
  const x = ((sourcePos.x + targetPos.x) / 2) * zoomLevel;
  const y = ((sourcePos.y + targetPos.y) / 2) * zoomLevel;
  scroller.scrollLeft = Math.max(0, x - scroller.clientWidth * 0.44);
  scroller.scrollTop = Math.max(0, y - scroller.clientHeight * 0.52);
}

function enableDragPan() {
  const scroller = document.querySelector(".graph-scroll");
  const activeTouches = new Map();
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let moved = false;
  let clearedRangeDuringDrag = false;
  let closedDetailDuringDrag = false;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;

  const beginMapInteraction = (evt) => {
    if (evt.target.closest(".top-toolbar, .detail-panel, .filter-drawer, .route-reader, .global-map-controls, .zoom-controls, .timeline-ruler, .intro-modal, .pinch-guide")) return false;
    if (evt.target.closest(".event-node, .link-group")) {
      collapseControlsOnMobile();
      return false;
    }
    if (introAutoPending && Date.now() < introInteractionLockUntil) return false;
    userMovedMap = true;
    introAutoPending = false;
    killExploreCameraTween();
    killStoryCameraTween();
    window.clearTimeout(overviewAutoTimer);
    exitOverviewMode();
    collapseControlsOnMobile();
    return true;
  };

  document.addEventListener("mousedown", beginMapInteraction, true);
  document.addEventListener("touchstart", beginMapInteraction, { capture: true, passive: true });
  scroller.addEventListener("mousedown", beginMapInteraction);
  scroller.addEventListener("touchstart", beginMapInteraction, { passive: true });

  scroller.addEventListener("pointerdown", (evt) => {
    if (!beginMapInteraction(evt)) return;
    if (evt.pointerType === "touch") {
      activeTouches.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
      if (activeTouches.size >= 2) {
        dragging = false;
        moved = false;
        const pinch = currentPinch(activeTouches);
        pinchStartDistance = pinch.distance;
        pinchStartZoom = zoomLevel;
        showMobileZoomControls();
      }
    }
    if (evt.pointerType === "touch" && activeTouches.size >= 2) {
      if (!scroller.hasPointerCapture(evt.pointerId)) scroller.setPointerCapture(evt.pointerId);
      return;
    }
    dragging = true;
    moved = false;
    clearedRangeDuringDrag = false;
    closedDetailDuringDrag = false;
    startX = evt.clientX;
    startY = evt.clientY;
    startLeft = scroller.scrollLeft;
    startTop = scroller.scrollTop;
    scroller.setPointerCapture(evt.pointerId);
  });

  scroller.addEventListener("pointermove", (evt) => {
    if (evt.pointerType === "touch" && activeTouches.has(evt.pointerId)) {
      activeTouches.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
      if (activeTouches.size >= 2 && pinchStartDistance > 0) {
        evt.preventDefault();
        const pinch = currentPinch(activeTouches);
        const ratio = pinch.distance / pinchStartDistance;
        setZoom(pinchStartZoom * ratio, pinch.centerX, pinch.centerY);
        showMobileZoomControls();
        return;
      }
    }
    if (!dragging) return;
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 8) {
      moved = true;
      collapseControlsOnMobile();
      if (!clearedRangeDuringDrag) {
        clearedRangeDuringDrag = clearTimeRangeFilter();
      }
    }
    if (!closedDetailDuringDrag && Math.hypot(dx, dy) > 54) {
      closedDetailDuringDrag = closeDetailPanel();
    }
    scroller.scrollLeft = startLeft - dx;
    scroller.scrollTop = startTop - dy;
  });

  const stopDragging = (evt) => {
    if (evt.pointerType === "touch") {
      activeTouches.delete(evt.pointerId);
      if (activeTouches.size < 2) {
        pinchStartDistance = 0;
        pinchStartZoom = zoomLevel;
      }
    }
    if (!dragging) return;
    dragging = false;
    if (evt.pointerId !== undefined && scroller.hasPointerCapture(evt.pointerId)) {
      scroller.releasePointerCapture(evt.pointerId);
    }
    if (moved) {
      lastDragAt = Date.now();
    }
  };

  scroller.addEventListener("pointerup", stopDragging);
  scroller.addEventListener("pointercancel", stopDragging);
}

function currentPinch(activeTouches) {
  const points = Array.from(activeTouches.values()).slice(0, 2);
  const dx = points[1].x - points[0].x;
  const dy = points[1].y - points[0].y;
  return {
    distance: Math.max(1, Math.hypot(dx, dy)),
    centerX: (points[0].x + points[1].x) / 2,
    centerY: (points[0].y + points[1].y) / 2
  };
}

function enableZoomControls() {
  const scroller = document.querySelector(".graph-scroll");

  zoomIn.addEventListener("click", () => zoomBy(zoomStep));
  zoomOut.addEventListener("click", () => zoomBy(-zoomStep));
  zoomReset.addEventListener("click", () => setZoom(1));
  centerSelectedButton.addEventListener("click", centerOnSelected);

  scroller.addEventListener("wheel", (evt) => {
    if (!evt.ctrlKey && !evt.metaKey) return;
    evt.preventDefault();
    const direction = evt.deltaY > 0 ? -1 : 1;
    zoomBy(direction * zoomStep, evt.clientX, evt.clientY);
  }, { passive: false });

  document.addEventListener("keydown", (evt) => {
    if (isFormControl(evt.target)) return;
    if (evt.key === "Escape") {
      if (closeTopPanel()) evt.preventDefault();
    } else if (evt.key === "+" || evt.key === "=") {
      evt.preventDefault();
      zoomBy(zoomStep);
    } else if (evt.key === "-" || evt.key === "_") {
      evt.preventDefault();
      zoomBy(-zoomStep);
    } else if (evt.key === "0") {
      evt.preventDefault();
      setZoom(1);
    }
  });
}

function zoomBy(delta, originClientX, originClientY) {
  setZoom(zoomLevel + delta, originClientX, originClientY);
}

function setZoom(nextZoom, originClientX, originClientY) {
  const scroller = document.querySelector(".graph-scroll");
  const clamped = Math.min(zoomMax, Math.max(zoomMin, Number(nextZoom.toFixed(2))));
  if (!scroller || clamped === zoomLevel) return;

  const rect = scroller.getBoundingClientRect();
  const originX = originClientX === undefined ? rect.left + scroller.clientWidth / 2 : originClientX;
  const originY = originClientY === undefined ? rect.top + scroller.clientHeight / 2 : originClientY;
  const graphX = (scroller.scrollLeft + originX - rect.left) / zoomLevel;
  const graphY = (scroller.scrollTop + originY - rect.top) / zoomLevel;

  zoomLevel = clamped;
  applyZoom(zoomLevel);
  if (zoomLevel > mobileReadableZoom) {
    document.querySelector(".atlas-app")?.classList.remove("mobile-fit-preview");
  }

  scroller.scrollLeft = Math.max(0, graphX * zoomLevel - (originX - rect.left));
  scroller.scrollTop = Math.max(0, graphY * zoomLevel - (originY - rect.top));
}

function showMobileZoomControls() {
  if (!isMobileViewport()) return;
  const app = document.querySelector(".atlas-app");
  app.classList.add("gesture-zooming");
  window.clearTimeout(zoomControlsTimer);
  zoomControlsTimer = window.setTimeout(() => {
    app.classList.remove("gesture-zooming");
  }, 3000);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 920px), (pointer: coarse)").matches;
}

function isMobilePortraitViewport() {
  return window.matchMedia("(max-width: 720px) and (orientation: portrait)").matches;
}

function applyZoom(level) {
  svg.style.width = `${Math.round(graphSize.width * level)}px`;
  svg.style.height = `${Math.round(graphSize.height * level)}px`;
  svg.style.minWidth = svg.style.width;
  svg.style.minHeight = svg.style.height;
  svg.style.setProperty("--zoom-level", String(level));
  svg.classList.toggle("flags-hidden", level < 0.86);
  updateMobileLowZoomState(level);
  zoomReset.textContent = `${Math.round(level * 100)}%`;
  updateStatusBar();
  updateTimelineRuler();
  updateViewportLayerTitles();
}

function updateMobileLowZoomState(level) {
  const app = document.querySelector(".atlas-app");
  if (!app) return;
  const lowZoom = isMobileViewport() && level < mobileReadableZoom;
  app.classList.toggle("mobile-low-zoom", lowZoom);
  if (!lowZoom) dismissMobileFitPreview();
}

function centerOnSelected() {
  if (selected.kind === "event" && selected.id) {
    focusExploreEvent(selected.id);
    return;
  }
  if (selected.kind === "link" && selected.id) {
    const item = links.find((linkItem) => linkItem.id === selected.id);
    if (item) centerOnLink(item);
    return;
  }
  centerOnEvent("hebrew", 0.45);
}

function updateStatusBar() {
  const relation = activeRelation === "all" ? "全部关系" : relationStyles[activeRelation].label;
  const routeLabel = activeRoute === "all" ? "整张大网" : routes[activeRoute].title;
  toolbarRoute.textContent = routeLabel;
  toolbarEntity.textContent = activeEntity === "all" ? "全部政治实体" : entities[activeEntity];
  toolbarRelation.textContent = activeTimeRange ? `${relation} · ${activeTimeRange.label}` : relation;
  toolbarZoom.textContent = `${Math.round(zoomLevel * 100)}%`;
  toolbarSelected.textContent = selectedStatusText();
}

function selectedStatusText() {
  if (selected.kind === "event" && selected.id) {
    return `选中：${eventById[selected.id]?.title || selected.id}`;
  }
  if (selected.kind === "link" && selected.id) {
    const item = links.find((linkItem) => linkItem.id === selected.id);
    if (!item) return "未选择档案";
    return `选中：${eventById[item.source].title} → ${eventById[item.target].title}`;
  }
  return "未选择档案";
}

function isFormControl(target) {
  return target && target.closest("input, textarea, select, button");
}

function updateTimelineRuler() {
  const scroller = document.querySelector(".graph-scroll");
  if (!scroller || !timelineTicks) return;
  const width = scroller.clientWidth;
  const leftX = scroller.scrollLeft / zoomLevel;
  const rightX = (scroller.scrollLeft + width) / zoomLevel;
  const visibleYears = timelineYears().filter((year) => {
    const x = timeToX(year);
    return x >= leftX - 60 && x <= rightX + 60;
  });
  const tickMarkup = visibleYears.map((year) => {
    const left = ((timeToX(year) * zoomLevel - scroller.scrollLeft) / width) * 100;
    const range = rangeForTimelineYear(year);
    const active = activeTimeRange && activeTimeRange.from === range.from && activeTimeRange.to === range.to;
    return `<div class="timeline-tick ${active ? "active" : ""}" data-from="${range.from}" data-to="${range.to}" data-label="${formatTimelineYear(year)}" style="left:${left}%"><span>${formatTimelineYear(year)}</span></div>`;
  }).join("");
  const dynastyMarkup = chineseDynasties.map((dynasty) => {
    const start = Math.max(timeToX(Math.max(dynasty.from, -3000)) * zoomLevel - scroller.scrollLeft, 0);
    const end = Math.min(timeToX(Math.min(dynasty.to, 2026)) * zoomLevel - scroller.scrollLeft, width);
    const bandWidth = end - start;
    if (bandWidth < 28) return "";
    const active = activeTimeRange && activeTimeRange.from === dynasty.from && activeTimeRange.to === dynasty.to;
    return `<div class="dynasty-band ${active ? "active" : ""}" data-from="${dynasty.from}" data-to="${dynasty.to}" data-label="${dynasty.label}" style="left:${(start / width) * 100}%;width:${(bandWidth / width) * 100}%">${dynasty.label}</div>`;
  }).join("");
  timelineTicks.innerHTML = `${tickMarkup}${dynastyMarkup}`;
}

function updateViewportLayerTitles() {
  const scroller = document.querySelector(".graph-scroll");
  if (!scroller) return;
  const x = scroller.scrollLeft / zoomLevel + 54 / zoomLevel;
  svg.querySelectorAll(".layer-title").forEach((label) => {
    label.setAttribute("x", String(Math.max(54, Math.min(graphSize.width - 520, x))));
  });
}

function handleTimelineClick(evt) {
  const target = evt.target.closest(".timeline-tick, .dynasty-band");
  if (!target) return;
  const from = Number(target.dataset.from);
  const to = Number(target.dataset.to);
  const label = target.dataset.label;
  stopStoryAutoplay();
  const sameRange = activeTimeRange && activeTimeRange.from === from && activeTimeRange.to === to;
  uiState = applyTimeRange(uiState, sameRange ? null : { from, to, label });
  hydrateLegacyFromUiState();
  renderGraph();
  renderRouteReader();
  syncUIFromState();
  updateTimelineRuler();
  updateStatusBar();
  showTimeFocusToast(sameRange ? "已恢复完整时间线" : `已聚焦：${label}`);
  fitCurrentSelection();
}

function clearTimeRangeFilter() {
  if (!activeTimeRange) return false;
  uiState = applyTimeRange(uiState, null);
  hydrateLegacyFromUiState();
  renderGraph();
  renderRouteReader();
  syncUIFromState();
  updateTimelineRuler();
  updateStatusBar();
  hideTimeFocusToast();
  return true;
}

function showTimeFocusToast(label) {
  if (!timeFocusToast || !isMobileViewport()) return;
  timeFocusToast.textContent = label;
  timeFocusToast.hidden = false;
  window.clearTimeout(timeFocusToastTimer);
  timeFocusToastTimer = window.setTimeout(hideTimeFocusToast, 2200);
}

function hideTimeFocusToast() {
  window.clearTimeout(timeFocusToastTimer);
  timeFocusToastTimer = null;
  if (timeFocusToast) timeFocusToast.hidden = true;
}

function showIntroModal() {
  if (!introModal) {
    finishIntroSequence();
    return;
  }
  introModal.hidden = false;
}

function handleIntroPointerIntent(evt) {
  if (evt.target === introModal) {
    closeIntroModal();
  }
}

function closeIntroModal() {
  if (introClosed) return;
  introClosed = true;
  userMovedMap = false;
  introAutoPending = true;
  introInteractionLockUntil = Date.now() + 900;
  if (introModal) introModal.hidden = true;
  finishIntroSequence();
}

function finishIntroSequence() {
  if (introSequenceStarted) return;
  introSequenceStarted = true;
  scheduleOverviewAutoZoom();
}

function watchIntroClosure() {
  if (!introModal) return;
  const observer = new MutationObserver(() => {
    if (!introModal.hidden || !overviewMode || introSequenceStarted) return;
    introClosed = true;
    userMovedMap = false;
    introAutoPending = true;
    introInteractionLockUntil = Date.now() + 900;
    finishIntroSequence();
    observer.disconnect();
  });
  observer.observe(introModal, { attributes: true, attributeFilter: ["hidden"] });
  const watcher = window.setInterval(() => {
    if (!overviewMode || introSequenceStarted) {
      window.clearInterval(watcher);
      return;
    }
    if (introModal.hidden) {
      introClosed = true;
      userMovedMap = false;
      introAutoPending = true;
      introInteractionLockUntil = Date.now() + 900;
      finishIntroSequence();
      window.clearInterval(watcher);
    }
  }, 120);
}

function scheduleOverviewAutoZoom() {
  window.clearTimeout(overviewAutoTimer);
  overviewAutoTimer = window.setTimeout(() => {
    if (userMovedMap && !introAutoPending) return;
    introAutoPending = false;
    const firstRouteId = activeRoute === "all" ? "westernMain" : activeRoute;
    const route = routes[firstRouteId];
    if (!route) {
      centerOnSelected();
      return;
    }
    const firstEvent = route.eventIds.find((id) => eventById[id]);
    const entryZoom = isMobileViewport() ? 0.42 : 0.55;
    if (firstEvent) animateZoomToEvent(firstEvent, entryZoom, 0.34);
  }, 500);
}

function animateZoomToEvent(eventId, targetZoom, horizontalRatio = 0.5, duration = 850) {
  const scroller = document.querySelector(".graph-scroll");
  const item = eventById[eventId];
  if (!scroller || !item) return;
  const app = document.querySelector(".atlas-app");
  const gsap = getGsap();
  if (app?.classList.contains("mobile-entry-preview")) {
    app.classList.add("mobile-entry-zooming");
  }
  const pos = eventPositions.get(eventId) || { x: timeToX(item.year), y: regions[item.layer].top };
  if (!gsap || prefersReducedMotion()) {
    exitOverviewMode();
    app?.style.removeProperty("--overview-secondary-opacity");
    app?.classList.remove("mobile-entry-preview", "mobile-entry-zooming");
    setZoom(targetZoom);
    centerOnEvent(eventId, horizontalRatio);
    showLandscapeHint();
    return;
  }

  killOverviewZoomTween();
  const zoomState = {
    zoom: zoomLevel,
    left: scroller.scrollLeft,
    top: scroller.scrollTop,
    reveal: 0
  };
  overviewZoomTween = gsap.to(zoomState, {
    zoom: targetZoom,
    reveal: 1,
    duration: duration / 1000,
    ease: "power3.out",
    overwrite: true,
    onUpdate() {
      zoomLevel = Number(zoomState.zoom.toFixed(3));
      applyZoom(zoomLevel);
      const targetLeft = Math.max(0, pos.x * zoomLevel - scroller.clientWidth * horizontalRatio);
      const targetTop = Math.max(0, pos.y * zoomLevel - scroller.clientHeight * 0.52);
      scroller.scrollLeft = zoomState.left + (targetLeft - zoomState.left) * zoomState.reveal;
      scroller.scrollTop = zoomState.top + (targetTop - zoomState.top) * zoomState.reveal;
      app?.style.setProperty("--overview-secondary-opacity", String(zoomState.reveal));
    },
    onComplete() {
      overviewZoomTween = null;
      exitOverviewMode();
      app?.style.removeProperty("--overview-secondary-opacity");
      app?.classList.remove("mobile-entry-preview", "mobile-entry-zooming");
      setZoom(targetZoom);
      centerOnEvent(eventId, horizontalRatio);
      showLandscapeHint();
    },
    onInterrupt() {
      overviewZoomTween = null;
    }
  });
}

function showLandscapeHint() {
  const app = document.querySelector(".atlas-app");
  if (!app || !window.matchMedia("(max-width: 720px) and (orientation: portrait)").matches) return;
  app.classList.add("landscape-hint-visible");
  window.setTimeout(() => {
    app.classList.remove("landscape-hint-visible");
  }, 3000);
}

function showPinchGuide() {
  if (!pinchGuide || !isMobileViewport()) return;
  if (mobileGestureHintShown) return;
  mobileGestureHintShown = true;
  pinchGuide.hidden = false;
  window.setTimeout(() => {
    hidePinchGuide();
  }, 3000);
}

function hidePinchGuide() {
  if (!pinchGuide) return;
  pinchGuide.hidden = true;
}

function closeDetailPanel() {
  if (!detailPanel || !uiState.panels.detailOpen) return false;
  uiState = closeDetailPanelState(uiState);
  hydrateLegacyFromUiState();
  renderRouteReader();
  syncUIFromState();
  updateStatusBar();
  return true;
}

function rangeForTimelineYear(year) {
  const years = timelineYears();
  const index = years.indexOf(year);
  const previous = years[Math.max(0, index - 1)];
  const next = years[Math.min(years.length - 1, index + 1)];
  const from = index === 0 ? -3000 : Math.round((previous + year) / 2);
  const to = index === years.length - 1 ? 2026 : Math.round((year + next) / 2);
  return { from, to };
}

function timelineYears() {
  return [-3000, -2500, -2000, -1600, -1200, -1000, -800, -600, -400, -221, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 1900, 1950, 2000, 2026];
}

function formatTimelineYear(year) {
  return year < 0 ? `前${Math.abs(year)}` : String(year);
}

function dynastyForYear(year) {
  const dynasty = chineseDynasties.find((item) => year >= item.from && year <= item.to);
  return dynasty ? `中国：${dynasty.label}` : "中国：分裂过渡期";
}

function wasDragClick(evt) {
  if (Date.now() - lastDragAt < 120) {
    evt.preventDefault();
    evt.stopPropagation();
    return true;
  }
  return false;
}

init();

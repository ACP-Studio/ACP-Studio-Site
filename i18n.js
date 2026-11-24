/* i18n.js: English / Arabic switching.
 *
 * How it works
 *  - Every translatable element in the HTML carries data-i18n="key" (plain text)
 *    or data-i18n-html="key" (text that contains links / bold / icons), and
 *    data-i18n-attr="attr=key" for attributes such as aria-label.
 *  - English is whatever is written in the HTML. This file only holds the
 *    Arabic (AR below), so the English text is never duplicated.
 *  - Texts that script.js creates (errors, log-out dialog, ...) live in DYN
 *    and are read with ACP_I18N.t("key").
 *  - The choice is saved in localStorage as "acpLang" (boot.js reads it first,
 *    so the page opens with the right language and direction).
 *  - If you edit an English sentence in the HTML, update its Arabic here by
 *    the same key. ACP_I18N.missing() in the console lists untranslated keys.
 */
(function () {
  "use strict";

  var KEY = window.ACP_LANG_KEY || "acpLang";
  var root = document.documentElement;
  var current = root.lang === "ar" ? "ar" : "en";
  var LRM = "\u200E";

  /* ------------------------------------------------------------------ */
  /* Arabic for the text that is written in the HTML                     */
  /* ------------------------------------------------------------------ */
  var AR = {
    /* navigation + footer */
    home: `الرئيسية`,
    c_projects: `مشاريع C++${LRM}`,
    youtube_studio: `استوديو يوتيوب`,
    contact: `تواصل معنا`,
    main_menu: `القائمة الرئيسية`,
    navigate: `التنقل`,
    projects: `المشاريع`,
    company: `الشركة`,
    youtube_2: `يوتيوب`,
    connect: `التواصل`,
    email: `البريد الإلكتروني`,
    instagram: `إنستغرام`,
    github: `جيت هاب`,
    youtube: `يوتيوب`,
    building_great_code_takes_time: `" بناء كود رائع يستغرق وقتاً... <svg class="icon" aria-hidden="true"><use href="icons.svg#time"></use></svg> "`,
    "2026_zeyad_adel_architected_with": `© 2026 Zeyad Adel. صُمّمت بذكاء خالص | "جميع الحقوق محفوظة".`,
    privacy_policy: `سياسة الخصوصية`,
    privacy_policy_2: `سياسة الخصوصية`,
    terms_conditions: `الشروط والأحكام`,
    cookies: `الكوكيز`,

    /* index.html */
    acp_studio_c_projects_and: `ACP-Studio: مشاريع C++${LRM} ومحتوى يوتيوب من Zeyad Adel.`,
    c_developer_technical_creator: `مطوّر C++${LRM} وصانع محتوى تقني`,
    crafting_elegant_solutions_in_c: `صياغة حلول أنيقة بلغة C++${LRM} والأنظمة منخفضة المستوى. بناء معمارية قابلة للتوسع. إنشاء محتوى يعلّم ويُلهم الجيل القادم من الشباب.`,
    view_my_work: `عرض أعمالي`,
    what_s_next: `ما التالي!`,
    what_s_next_2: `ما التالي`,
    systems_code_showcase: `عرض الأنظمة والأكواد`,
    a_curated_collection_of_projects: `مجموعة منتقاة من المشاريع، تُظهر التصميم النظيف، وتحسين الأداء، والتفكير على مستوى الأنظمة.`,
    validation: `التحقق`,
    login_app: `تطبيق تسجيل الدخول`,
    a_c_project_that_validates: `مشروع بلغة C++${LRM} يتحقق من صحة أسماء المستخدمين. يتأكد من أن المُدخل ليس فارغاً وأنه يحتوي على حروف ومسافات فقط.`,
    password_app: `تطبيق كلمات المرور`,
    a_friendly_c_project_that: `مشروع ودود بلغة C++${LRM} يوضّح التحقق من كلمات المرور. يفحص البرنامج ما إذا كانت كلمة المرور تلبّي قواعد الأمان الأساسية (الطول، الأحرف الكبيرة، الأحرف الصغيرة، الأرقام، الرموز الخاصة، عدم وجود مسافات)`,
    network: `الشبكات`,
    under_development: `قيد التطوير`,
    network_analyzer_app: `تطبيق محلل الشبكة`,
    a_lightweight_c_network_analyzer: `محلل شبكة خفيف بلغة C++${LRM} لنظامي Windows وLinux يختبر زمن الاستجابة ويفحص شبكتك ويتتبع أجهزتك، بواجهة سطر أوامر فقط`,
    mathematics: `الرياضيات`,
    advanced_calculator: `الآلة الحاسبة المتقدمة`,
    c_calculator_contain_complex_calculation: `آلة حاسبة بلغة C++${LRM} تتضمن عمليات حسابية معقدة ودوال أُسّية مع دعم المصفوفات والمزيد من الميزات`,
    still_in_production_not_finished: `لا يزال قيد الإنتاج، لم يكتمل بعد`,
    commercial: `تجاري`,
    computer_store: `متجر الحاسوب`,
    an_object_oriented_c_computer: `متجر لقطع الحاسوب موجّه للكائنات بلغة C++${LRM} لسطر الأوامر، مع سلة تسوق وفحوصات توافق وإيصالات.`,
    creating_in_depth_technical_content: `إنشاء محتوى تقني معمّق حول معمارية C++${LRM} وبرمجة الأنظمة ومبادئ تصميم البرمجيات.`,
    building_a_lock_free_queue: `بناء طابور خالٍ من الأقفال`,
    a_deep_dive_into_synchronization: `غوص عميق في أوليات المزامنة وعمليات المقارنة والتبديل (compare-and-swap) والأنماط العملية لهياكل البيانات المتزامنة. شاهد كيف نبني بنية تحتية بمستوى الإنتاج من المبادئ الأولى.`,
    watch_on_youtube: `شاهد على يوتيوب`,
    channel_stats: `إحصائيات القناة`,
    subscribers: `المشتركون`,
    views: `المشاهدات`,
    videos: `الفيديوهات`,
    recent_focus: `التركيز الأخير`,
    c_standards_evolution_systems_design: `تطور معايير C++${LRM}، وأنماط تصميم الأنظمة، وتقنيات التزامن الحديثة.`,
    latest_video: `أحدث فيديو`,

    /* company.html */
    company_acp_studio: `الشركة · ACP-Studio`,
    company_details_and_the_people: `تفاصيل الشركة والأشخاص خلفها.`,
    building_great_code_takes_time_2: `"بناء كود رائع يستغرق وقتاً... ☕⚙️"`,
    description: `الوصف`,
    about_the_company: `عن الشركة`,
    acp_studio_is_an_independent: `ACP-Studio استوديو مستقل لتطوير البرمجيات يركّز على بناء مشاريع إبداعية عالية الجودة ومشاركة المعرفة عبر يوتيوب. نؤمن بالكود النظيف والأفكار المبتكرة وفهم كيفية عمل الأشياء من الداخل. بدءاً من C++${LRM}، نتوسع في تقنيات مثل Flutter وDart وPython، ونواصل تطوير مهاراتنا وإنشاء مشاريع أكثر تقدماً. مهمتنا بسيطة: "ابنِ. تعلّم. أبدِع." ونجعل البرمجة أسهل فهماً للجميع.`,
    base: `المقر`,
    dubai_uae: `دبي ، الإمارات العربية المتحدة`,
    acp_studio_is_based_in: `يقع مقر ACP-Studio في دبي، الإمارات العربية المتحدة، مع فريق عن بُعد يعمل عبر دول مختلفة. وتُعدّ مصر قاعدتنا التشغيلية الرئيسية، حيث تجمع المواهب والإبداع لتطوير مشاريع البرمجيات والمحتوى التعليمي.`,
    founded: `التأسيس`,
    founded_in_march_2024_by: `تأسست في مارس 2024 على يد Zeyad Adel، وقضت ACP-Studio سنواتها الأولى في بناء المعرفة وصقل نهجها. الآن، نحن مستعدون لمشاركة ما تعلمناه وتحقيق رؤيتنا..`,
    field: `المجال`,
    industry_or_main_work: `الصناعة أو العمل الرئيسي`,
    software_development_programming_educati: `تطوير البرمجيات وتعليم البرمجة. بناء مشاريع البرمجيات، واستكشاف لغات البرمجة، وتطوير التطبيقات، وإنشاء محتوى تعليمي من خلال دروس عملية ومقاطع فيديو على يوتيوب.`,
    team: `الفريق`,
    one_vision_different_countries_one: `رؤية واحدة - دول مختلفة - فريق واحد`,
    developer: `مطوّر`,
    egypt: `مصر`,
    leading_acp_studio_s_development: `يقود التوجه التطويري والتعليمي لـ ACP-Studio`,
    marketing_manger: `مدير التسويق`,
    indonesia: `إندونيسيا`,
    managing_acp_studio_s_social: `يدير منصات التواصل الاجتماعي لـ ACP-Studio وحضورها على الإنترنت`,
    editor: `محرر`,
    united_kingdom: `المملكة المتحدة`,
    responsible_for_video_editing_and: `مسؤول عن تحرير الفيديو وصياغة محتوى ACP-Studio`,

    /* login.html */
    log_in_acp_studio: `تسجيل الدخول · ACP-Studio`,
    log_in: `تسجيل الدخول`,
    welcome_to_acp_studio: `مرحباً بك في ACP-Studio`,
    email_address: `عنوان البريد الإلكتروني`,
    code_from_your_email: `الرمز من بريدك الإلكتروني`,
    use_a_different_email: `استخدم بريداً إلكترونياً آخر`,
    continue_to_the_site: `المتابعة إلى الموقع`,
    by_continuing_you_agree_to: `بمتابعتك فإنك توافق على <a href="terms.html">الشروط والأحكام</a> و<a href="privacy.html">سياسة الخصوصية</a>. لدينا أيضاً صفحة <a href="cookies.html">الكوكيز</a>.`,

    /* closing.html */
    acp_studio_is_closing_acp: `ACP-Studio سيُغلق · ACP-Studio`,
    closing_notice: `إشعار الإغلاق`,
    important_notice: `إشعار مهم`,
    acp_studio_is_closing_soon: `ACP-Studio سيُغلق قريباً`,
    thank_you_for_logging_in: `شكراً لتسجيل دخولك. قبل أن تتابع، نريد أن نكون صادقين معك بشأن الوجهة التي يتجه إليها الموقع.`,
    no_new_content: `لا محتوى جديد`,
    there_is_nothing_more_to: `لا يوجد المزيد لتجده في الموقع الرئيسي. لا توجد مشاريع أو فيديوهات جديدة مخطط لها، وما تراه هناك هو كل ما هناك.`,
    closing_soon: `الإغلاق قريباً`,
    the_site_and_the_studio: `سيتم إغلاق الموقع والاستوديو. ليس لدينا موعد محدد بعد، لكنه لن يبقى متاحاً على الإنترنت طويلاً.`,
    the_reason: `السبب`,
    this_is_because_of_financial: `هذا بسبب مشاكل مالية. لا نستطيع تغطية تكاليف إبقاء الاستوديو والموقع قيد التشغيل.`,
    your_data: `بياناتك`,
    as_of_time_datetime_2026: `اعتباراً من <time datetime="2026-11-23">23 نوفمبر 2026</time>، تم حذف جميع البيانات التي جمعناها من المستخدمين قبل هذا التاريخ نهائياً من قاعدة بياناتنا. ويشمل ذلك عناوين البريد الإلكتروني وسجلات تسجيل الدخول وأي معلومات أخرى مرتبطة بحسابك أو نشاطك على الموقع.`,
    thank_you_to_everyone_who: `شكراً لكل من زار وشاهد ودعم ACP-Studio. لقد كان ذلك يعني لنا الكثير حقاً. مشاريع الكود على <a href="https://github.com/ACP-Studio/ACP-Studio" target="_blank" rel="noopener noreferrer">GitHub</a> منفصلة عن هذا الموقع، لذا لا يزال بإمكانك استخدامها.`,
    take_a_look: `ألقِ نظرة`,
    questions_about_your_data_write: `أسئلة حول بياناتك؟ اكتب إلى <a href="mailto:za8398866@gmail.com">za8398866@gmail.com</a>.`,

    /* coming-soon.html */
    coming_soon_acp_studio: `قريباً · ACP-Studio`,
    coming_soon: `قريباً`,
    it_will_be_available_soon: `سيكون متاحاً قريباً.`,
    back_to_the_site: `العودة إلى الموقع`,

    /* under-development.html */
    under_development_acp_studio: `قيد التطوير · ACP-Studio`,
    the_site_is_still_being: `الموقع لا يزال قيد الإنشاء. سيكون متاحاً في <time datetime="2026-11-19T00:00:00+04:00"><strong>19 نوفمبر 2026 الساعة 16:00</strong></time> بتوقيت الإمارات (GMT+4).`,
    days: `أيام`,
    hours: `ساعات`,
    minutes: `دقائق`,
    seconds: `ثوانٍ`,
    time_left_until_the_site: `الوقت المتبقي حتى افتتاح الموقع`,

    /* privacy.html */
    privacy_policy_acp_studio: `سياسة الخصوصية · ACP-Studio`,
    last_updated_november_23_2026: `آخر تحديث: 23 نوفمبر 2026`,
    "1_who_we_are": `1. من نحن`,
    acp_studio_is_a_company: `ACP-Studio شركة يديرها Zeyad Adel. تعرض مشاريع C++${LRM} ومحتوى يوتيوب. في هذه السياسة.`,
    "2_what_we_collect": `2. ما الذي نجمعه`,
    strong_your_email_address_strong: `<strong>عنوان بريدك الإلكتروني.</strong> تكتبه في صفحة تسجيل الدخول. وهو المعلومة الشخصية الوحيدة التي نطلبها.`,
    strong_a_sign_in_time: `<strong>وقت تسجيل الدخول.</strong> يخزّن متصفحك لحظة تسجيل دخولك، مع بريدك الإلكتروني، حتى يتذكرك الموقع.`,
    we_do_not_ask_for: `لا نطلب اسمك أو كلمة مرورك أو رقم هاتفك أو موقعك أو بيانات الدفع. وقد يحتفظ مزوّد الاستضافة لدينا بسجلات الخادم القياسية (مثل عنوان IP ونوع المتصفح) لأغراض الأمان ولإبقاء الموقع قيد التشغيل.`,
    "3_why_we_ask_for": `3. لماذا نطلب بريدك الإلكتروني`,
    you_need_an_email_address: `تحتاج إلى عنوان بريد إلكتروني لدخول الموقع. نستخدمه من أجل:`,
    let_real_people_in_and: `السماح للأشخاص الحقيقيين بالدخول والاحتفاظ بقائمة بالأشخاص الذين يستخدمون الموقع فعلاً، بدلاً من الزيارات الآلية المجهولة (البوتات)؛`,
    know_roughly_how_many_people: `معرفة عدد الأشخاص الذين يصل إليهم الموقع والقناة بشكل تقريبي؛`,
    contact_you_about_acp_studio: `التواصل معك بخصوص ACP-Studio، إذا احتجنا إلى ذلك يوماً (على سبيل المثال، تغيير مهم في الموقع).`,
    asking_for_an_email_address: `طلب عنوان بريد إلكتروني يجعل من الأصعب على السكربتات الآلية البسيطة تصفح الموقع ونسخه. في الوقت الحالي نتحقق من أن العنوان مكتوب بشكل صحيح. لا نرسل رابط تأكيد بعد، لذلك لا يمكننا ضمان أن كل عنوان يعود إلى الشخص الذي كتبه. وقد نضيف خطوة تأكيد لاحقاً.`,
    we_do_not_sell_your: `لا نبيع بريدك الإلكتروني ولا نؤجّره ولا نشاركه لأغراض الإعلانات. ولا نرسل رسائل تسويقية اليوم. وإذا تغيّر ذلك يوماً، فسنخبرك أولاً وستتمكن من إلغاء الاشتراك.`,
    "4_where_your_data_is": `4. أين تُخزَّن بياناتك`,
    strong_in_our_database_strong: `<strong>في قاعدة بياناتنا.</strong> يُحفظ بريدك الإلكتروني لدى مزوّد قاعدة البيانات لدينا ، وقد يحتفظ به على خوادم خارج بلدك.`,
    "5_other_services_the_site": `5. خدمات أخرى يستخدمها الموقع`,
    the_site_s_fonts_and: `تأتي خطوط الموقع وأيقوناته من ملفات الموقع نفسه، لذلك لا تستطيع أي شركة أخرى رؤية زيارتك أثناء التصفح. تُستخدم خدمتان خارجيتان عند تسجيل الدخول. مزوّد قاعدة البيانات لدينا ، يخزّن بريدك الإلكتروني. أما Cloudflare Turnstile فهو اختبار CAPTCHA يتحقق من أنك شخص وليس بوتاً؛ ولهذا الفحص تتلقى Cloudflare عنوان IP الخاص بك وبعض التفاصيل عن متصفحك، وقد تحتفظ بعناصر صغيرة في متصفحك. نحن لا نتحكم في هذه الخدمات، لذا يُرجى قراءة سياساتها الخاصة. تأخذك الروابط إلى GitHub وYouTube إلى مواقع أخرى لها سياسات خصوصية خاصة بها، ولا نتحكم فيها.`,
    "6_how_long_we_keep": `6. المدة التي نحتفظ فيها بالبيانات`,
    we_keep_your_email_for: `نحتفظ ببريدك الإلكتروني ما دام الموقع قيد التشغيل أو حتى تطلب منا حذفه، أيهما أسبق.`,
    "7_your_rights": `7. حقوقك`,
    you_can_ask_us_at: `يمكنك أن تطلب منا في أي وقت أن نعرض لك البيانات التي نحتفظ بها عنك، أو نصحّحها، أو نحذفها، ويمكنك أن تطلب منا التوقف عن استخدام بريدك الإلكتروني. راسلنا على العنوان أدناه وسنرد في أقرب وقت ممكن. بحسب مكان إقامتك، قد تكون لديك حقوق أكثر بموجب قانون حماية البيانات المحلي لديك (على سبيل المثال قانون حماية البيانات الشخصية في مصر، أو GDPR في أوروبا).`,
    "8_changes_to_this_policy": `8. تغييرات على هذه السياسة`,
    we_may_update_this_policy: `قد نحدّث هذه السياسة. يوضح التاريخ في الأعلى آخر مرة تغيّرت فيها.`,
    "9_contact": `9. التواصل`,
    questions_or_requests_a_href: `أسئلة أو طلبات: <a href="mailto:za8398866@gmail.com">za8398866@gmail.com</a>`,
    "10_end_of_operations": `10. نهاية العمليات`,
    due_to_unforeseen_financial_difficulties: `نظراً لصعوبات مالية غير متوقعة، لم تعد شركتنا قادرة على مواصلة عملياتها، وسيتم إغلاق موقعنا قريباً. وكجزء من هذه العملية، قمنا بحذف جميع بيانات المستخدمين المخزّنة سابقاً نهائياً. وسيتم أيضاً حذف أي بيانات مستخدمين متبقية نهائياً بمجرد إغلاق الموقع رسمياً. نود أن نطمئنك بأن خصوصيتك وأمان بياناتك يظلان أولوية. إضافةً إلى ذلك، يُمنح لك إذن كامل للوصول إلى الكود المصدري الخاص بنا واستخدامه وتعديله دون قيود. نقدّر بصدق ثقتكم ودعمكم وتعاونكم طوال رحلتنا. شكراً لكونكم جزءاً من مجتمعنا.`,

    /* terms.html */
    terms_conditions_acp_studio: `الشروط والأحكام · ACP-Studio`,
    terms: `الشروط`,
    "1_agreement": `1. الاتفاقية`,
    by_logging_in_to_or: `بتسجيل دخولك إلى ACP-Studio أو باستخدامه، فإنك توافق على هذه الشروط. إذا كنت لا توافق، فلا تستخدم الموقع.`,
    "2_what_the_site_is": `2. ما هو الموقع`,
    acp_studio_is_a_small: `ACP-Studio شركة صغيرة يديرها Zeyad Adel، تضم مشاريع C++${LRM} ومعلومات عن قناة على يوتيوب. بعض الأجزاء، مثل مقاطع يوتيوب.`,
    "3_logging_in": `3. تسجيل الدخول`,
    you_log_in_with_an: `تسجّل الدخول باستخدام عنوان بريد إلكتروني. لا توجد كلمة مرور.`,
    use_your_own_real_email: `استخدم عنوان بريدك الإلكتروني الحقيقي الخاص بك. لا تستخدم عنوان شخص آخر.`,
    your_login_is_saved_in: `يُحفظ تسجيل دخولك في متصفحك أنت. إذا استخدم أشخاص آخرون جهازك، فسجّل الخروج عند الانتهاء.`,
    we_use_your_email_as: `نستخدم بريدك الإلكتروني كما هو موضح في <a href="privacy.html">سياسة الخصوصية</a> لدينا.`,
    "4_what_you_may_not": `4. ما لا يجوز لك فعله`,
    use_bots_scripts_or_other: `استخدام البوتات أو السكربتات أو أدوات آلية أخرى لتسجيل الدخول أو لنسخ الموقع.`,
    try_to_break_overload_or: `محاولة تعطيل أمان الموقع أو إغراقه أو التحايل عليه.`,
    submit_false_fake_or_someone: `إرسال عناوين بريد إلكتروني كاذبة أو مزيفة أو تخص شخصاً آخر.`,
    use_the_site_for_anything: `استخدام الموقع في أي شيء غير قانوني أو ضار.`,
    we_will_block_access_to: `سنحظر الوصول عن أي شخص يخالف هذه القواعد، دون إشعار.`,
    "5_ownership": `5. الملكية`,
    the_design_text_images_and: `التصميم والنصوص والصور والفيديوهات على هذا الموقع مملوكة لـ ACP-Studio ما لم يُذكر خلاف ذلك. لا يجوز لك نسخها أو إعادة استخدامها دون إذن. وتخضع مشاريع الكود المرتبطة على GitHub للترخيص المعروض في كل مستودع.`,
    "6_links_to_other_sites": `6. روابط إلى مواقع أخرى`,
    the_site_links_to_services: `يرتبط الموقع بخدمات مثل GitHub وYouTube. نحن لا نتحكم في تلك المواقع ولسنا مسؤولين عما تحتويه أو عن كيفية تعاملها مع بياناتك.`,
    "7_limit_of_responsibility": `7. حدود المسؤولية`,
    to_the_extent_the_law: `بالقدر الذي يسمح به القانون، لسنا مسؤولين عن أي خسارة أو ضرر ينشأ عن استخدام الموقع أو الاعتماد على محتواه.`,
    "8_changes": `8. التغييرات`,
    we_may_change_the_site: `قد نغيّر الموقع أو هذه الشروط في أي وقت. يوضح التاريخ في الأعلى أحدث نسخة. وإذا واصلت استخدام الموقع بعد التغيير، فإنك تقبل الشروط الجديدة.`,
    "9_governing_law": `9. القانون الحاكم`,
    these_terms_are_governed_by: `تخضع هذه الشروط لقوانين مصر، ما لم يمنحك قانونك المحلي حقوقاً لا يمكن التنازل عنها.`,
    "10_contact": `10. التواصل`,
    questions_about_these_terms_a: `أسئلة حول هذه الشروط: <a href="mailto:za8398866@gmail.com">za8398866@gmail.com</a>`,
    "11_end_of_operations": `11. نهاية العمليات`,
    our_company_has_officially_ceased: `لقد أوقفت شركتنا عملياتها رسمياً، لذا فإن هذه القواعد والإرشادات لم تعد سارية. إذا أردت معرفة المزيد عن كيفية التعامل مع بياناتك المخزّنة، فراجع سياسة الخصوصية لدينا.`,

    /* cookies.html */
    cookies_acp_studio: `الكوكيز · ACP-Studio`,
    "1_what_this_page_covers": `1. ما تغطيه هذه الصفحة`,
    cookies_and_similar_technologies_are: `ملفات تعريف الارتباط (الكوكيز) والتقنيات المشابهة هي قطع صغيرة من البيانات يحفظها الموقع في متصفحك. توضح هذه الصفحة ما تحفظه ACP-Studio على جهازك.`,
    "2_what_we_save": `2. ما الذي نحفظه`,
    we_do_not_set_any: `لا نضع أي كوكيز للتتبع أو الإعلانات أو التحليلات. يحفظ الموقع عنصرين في التخزين المحلي لمتصفحك:`,
    strong_acpstudiouser_strong_your_email: `<strong>acpStudioUser</strong>: عنوان بريدك الإلكتروني ووقت تسجيل دخولك. يُبقيك مسجّل الدخول، فلا تحتاج إلى كتابة بريدك في كل صفحة. لا يمكن للموقع أن يعمل بدونه، لأن تسجيل الدخول مطلوب.`,
    strong_acplang_strong_your_language: `<strong>acpLang</strong>: اختيارك للغة (الإنجليزية أو العربية). يعمل الموقع بدونه ويعرض الإنجليزية بدلاً منه.`,
    this_item_stays_on_your: `يبقى عنصر تسجيل الدخول على جهازك لمدة تصل إلى 30 يوماً، أو حتى تسجّل الخروج أو تمسح بيانات متصفحك، أيهما أسبق. ويبقى عنصر اللغة حتى تمسح بيانات متصفحك.`,
    "3_other_services": `3. خدمات أخرى`,
    the_fonts_and_icons_are: `تُقدَّم الخطوط والأيقونات من هذا الموقع، لذلك فإن التصفح لا يتصل بأي شركة أخرى. تُستخدم خدمتان خارجيتان عند تسجيل الدخول: Supabase، قاعدة البيانات التي تخزّن بريدك الإلكتروني، وCloudflare Turnstile، وهو اختبار CAPTCHA يتحقق من أنك شخص. وعندما يتصل متصفحك بهما، يمكنهما رؤية عنوان IP الخاص بك وقد تحتفظان بسجلاتهما الخاصة. وقد تحتفظ Turnstile أيضاً بعناصر صغيرة في متصفحك لإجراء فحصها. نحن لا نتحكم في هذه الخدمات. يُرجى قراءة سياساتها الخاصة للاطلاع على التفاصيل.`,
    "4_how_to_remove_or": `4. كيفية إزالته أو حظره`,
    use_the_log_out_link: `استخدم رابط تسجيل الخروج في القائمة أعلى الصفحة. فهو يحذف عنصر تسجيل الدخول.`,
    or_clear_the_site_data: `أو امسح بيانات الموقع من إعدادات متصفحك. وعندها ستضطر إلى تسجيل الدخول من جديد لاستخدام الموقع.`,
    if_you_block_site_data: `إذا حظرت بيانات الموقع بالكامل، فلن تتمكن من تسجيل الدخول.`,
    "5_contact": `5. التواصل`,
    questions_a_href_mailto_za8398866: `أسئلة: <a href="mailto:za8398866@gmail.com">za8398866@gmail.com</a>. المزيد حول كيفية استخدامنا لبريدك الإلكتروني في <a href="privacy.html">سياسة الخصوصية</a>.`
  };

  /* ------------------------------------------------------------------ */
  /* Texts used by script.js / under-development.js (English + Arabic)   */
  /* {name} is replaced by the value passed to t()                       */
  /* ------------------------------------------------------------------ */
  var DYN = {
    toggle_label: {
      en: "Switch to Arabic (العربية)",
      ar: "التبديل إلى الإنجليزية (English)"
    },

    island_home: { en: "Home", ar: AR.home },
    island_projects: { en: "C++ Projects", ar: AR.c_projects },
    island_studio: { en: "YouTube Studio", ar: AR.youtube_studio },
    island_contact: { en: "Contact", ar: AR.contact },

    auth_login: { en: "Log in", ar: "تسجيل الدخول" },
    auth_logout: { en: "Log out", ar: "تسجيل الخروج" },
    auth_signed_in_as: { en: "Signed in as {email}", ar: "مسجّل الدخول باسم {email}" },

    confirm_title: { en: "Log out?", ar: "تسجيل الخروج؟" },
    confirm_text: {
      en: "You're signed in as {email}. Do you really want to log out?",
      ar: "أنت مسجّل الدخول باسم {email}. هل تريد فعلاً تسجيل الخروج؟"
    },
    confirm_no: { en: "No, stay", ar: "لا، ابقَ" },
    confirm_yes: { en: "Yes, log out", ar: "نعم، سجّل الخروج" },

    login_lead_email: {
      en: "Enter your email and we'll send you a login code.",
      ar: "أدخل بريدك الإلكتروني وسنرسل لك رمز تسجيل الدخول."
    },
    login_lead_code: {
      en: "We sent a code to {email}. Enter it below.",
      ar: "أرسلنا رمزاً إلى {email}. أدخله أدناه."
    },
    login_submit: { en: "Log in", ar: "تسجيل الدخول" },
    login_verify: { en: "Verify code", ar: "تحقق من الرمز" },
    login_sending: { en: "Sending code…", ar: "جارٍ إرسال الرمز…" },
    login_checking: { en: "Checking…", ar: "جارٍ التحقق…" },

    err_blocked: {
      en: "Your browser is blocking site data, so we can't keep you logged in. Allow site data and try again.",
      ar: "متصفحك يحظر بيانات الموقع، لذلك لا يمكننا إبقاءك مسجّل الدخول. اسمح ببيانات الموقع وحاول مرة أخرى."
    },
    err_enter_email: { en: "Enter your email address.", ar: "أدخل عنوان بريدك الإلكتروني." },
    err_captcha_first: {
      en: "Please complete the security check first.",
      ar: "يرجى إكمال الفحص الأمني أولاً."
    },
    err_code_format: {
      en: "Enter the code from your email (numbers only).",
      ar: "أدخل الرمز الموجود في بريدك الإلكتروني (أرقام فقط)."
    },
    err_captcha_run: {
      en: "The security check could not run. Refresh the page and try again.",
      ar: "تعذّر تشغيل الفحص الأمني. حدّث الصفحة وحاول مرة أخرى."
    },
    err_captcha_load: {
      en: "The security check could not load. Check your connection and refresh the page.",
      ar: "تعذّر تحميل الفحص الأمني. تحقق من اتصالك وحدّث الصفحة."
    },
    err_captcha_failed: {
      en: "The security check failed. Please try again.",
      ar: "فشل الفحص الأمني. يرجى المحاولة مرة أخرى."
    },
    err_invalid_email: {
      en: "That email doesn't look right. Check it and try again.",
      ar: "هذا البريد الإلكتروني غير صحيح. تحقق منه وحاول مرة أخرى."
    },
    err_rate_limited: {
      en: "Too many tries. Please wait a few minutes and try again.",
      ar: "محاولات كثيرة جداً. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى."
    },
    err_unavailable_send: {
      en: "We couldn't send the code right now. Please try again in a minute.",
      ar: "تعذّر علينا إرسال الرمز الآن. يرجى المحاولة مرة أخرى بعد دقيقة."
    },
    err_invalid_code: {
      en: "That code is wrong or has expired. Check it, or use a different email to get a new one.",
      ar: "هذا الرمز خاطئ أو منتهي الصلاحية. تحقق منه، أو استخدم بريداً إلكترونياً آخر للحصول على رمز جديد."
    },
    err_unavailable_code: {
      en: "We couldn't check the code right now. Please try again in a minute.",
      ar: "تعذّر علينا التحقق من الرمز الآن. يرجى المحاولة مرة أخرى بعد دقيقة."
    },

    dev_local: { en: "In your time zone: {time}.", ar: "حسب منطقتك الزمنية: {time}." }
  };

  /* ------------------------------------------------------------------ */
  /* Engine                                                              */
  /* ------------------------------------------------------------------ */
  var store = new WeakMap();

  function t(key, vars) {
    var row = DYN[key];
    var s = row ? row[current] || row.en : key;
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      if (!vars || vars[name] == null) return m;
      var v = String(vars[name]);
      // keep an email or a time readable inside a right-to-left sentence
      return current === "ar" ? "\u2068" + v + "\u2069" : v;
    });
  }

  function textNodeOf(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    }
    return null;
  }

  function translateDom(lang) {
    var els = document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-attr]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var st = store.get(el);
      if (!st) {
        st = { attrs: {} };
        if (el.hasAttribute("data-i18n-html")) {
          st.html = true;
          st.orig = el.innerHTML;
        } else if (el.hasAttribute("data-i18n")) {
          st.node = textNodeOf(el);
          if (st.node) st.orig = st.node.nodeValue;
        }
        store.set(el, st);
      }

      var key = el.getAttribute(st.html ? "data-i18n-html" : "data-i18n");
      if (key && st.orig !== undefined) {
        var ar = AR[key];
        var useAr = lang === "ar" && ar !== undefined;
        if (st.html) {
          el.innerHTML = useAr ? ar : st.orig;
        } else if (st.node) {
          var lead = st.orig.match(/^\s*/)[0];
          var trail = st.orig.match(/\s*$/)[0];
          st.node.nodeValue = useAr ? lead + ar + trail : st.orig;
        }
      }

      var attrSpec = el.getAttribute("data-i18n-attr");
      if (attrSpec) {
        attrSpec.split(";").forEach(function (pair) {
          var bits = pair.split("=");
          var name = bits[0];
          var akey = bits[1];
          if (!name || !akey) return;
          if (!(name in st.attrs)) st.attrs[name] = el.getAttribute(name);
          var aval = AR[akey];
          el.setAttribute(name, lang === "ar" && aval !== undefined ? aval : st.attrs[name]);
        });
      }
    }
  }

  /* ---- the globe button inside the island ---- */
  var button = null;

  function ensureToggle() {
    var island = document.getElementById("dynamicIsland");
    if (!island || document.getElementById("langToggle")) return;
    button = document.createElement("button");
    button.type = "button";
    button.id = "langToggle";
    button.className = "lang-toggle";
    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\uD83C\uDF10"; // 🌐 (no text on the button, only the icon)
    button.appendChild(icon);
    var status = island.querySelector(".island-status");
    if (status && status.nextSibling) island.insertBefore(button, status.nextSibling);
    else island.appendChild(button);
    button.addEventListener("click", function () {
      set(current === "ar" ? "en" : "ar");
    });
  }

  function updateToggle() {
    if (!button) return;
    var label = t("toggle_label");
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function set(lang, persist) {
    lang = lang === "ar" ? "ar" : "en";
    current = lang;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    if (persist !== false) {
      try {
        localStorage.setItem(KEY, lang);
      } catch (e) {
      }
    }
    translateDom(lang);
    updateToggle();
    document.dispatchEvent(new CustomEvent("acp:langchange", { detail: { lang: lang } }));
  }

  // keep several open tabs in the same language
  window.addEventListener("storage", function (e) {
    if (e.key === KEY && e.newValue && e.newValue !== current) set(e.newValue, false);
  });

  // Console helper: ACP_I18N.missing() lists keys that have no Arabic yet.
  function missing() {
    var out = [];
    document.querySelectorAll("[data-i18n],[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n") || el.getAttribute("data-i18n-html");
      if (AR[k] === undefined && out.indexOf(k) < 0) out.push(k);
    });
    return out;
  }

  window.ACP_I18N = {
    t: t,
    set: set,
    lang: function () {
      return current;
    },
    toggle: function () {
      set(current === "ar" ? "en" : "ar");
    },
    missing: missing
  };

  ensureToggle();
  translateDom(current);
  updateToggle();
})();

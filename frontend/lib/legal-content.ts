// Legal content for Privacy Policy and Terms of Use
// Binding version is Greek. All other language versions are informational translations.

export interface LegalSection {
  heading: string;
  content: string;
}

export interface LegalContent {
  disclaimer: string;
  sections: LegalSection[];
}

export const privacyPolicy: Record<string, LegalContent> = {
  el: {
    disclaimer: "Νομικά δεσμευτική έκδοση είναι η ελληνική. Όλες οι υπόλοιπες γλωσσικές εκδόσεις αποτελούν ενημερωτικές μεταφράσεις.",
    sections: [
      {
        heading: "1. Υπεύθυνος Επεξεργασίας",
        content: "Η πλατφόρμα ΑΠΑΛΛΑΚΤΗΣ λειτουργεί ως Υπεύθυνος Επεξεργασίας των προσωπικών δεδομένων που συλλέγονται στο πλαίσιο της παροχής της υπηρεσίας."
      },
      {
        heading: "2. Ποια Δεδομένα Συλλέγουμε",
        content: "Συλλέγουμε μόνο δεδομένα απαραίτητα για τη λειτουργία της υπηρεσίας, όπως: στοιχεία εγγραφής (όνομα, email, τηλέφωνο), στοιχεία λογαριασμού χρήστη, οικονομικά δεδομένα που καταχωρεί ο χρήστης (έργα, πληρωμές, έξοδα), τεχνικά δεδομένα (διεύθυνση IP, τύπος συσκευής, πρόγραμμα περιήγησης), αρχεία καταγραφής (logs) για λόγους ασφάλειας."
      },
      {
        heading: "3. Πώς Συλλέγουμε τα Δεδομένα",
        content: "Τα δεδομένα συλλέγονται απευθείας από τον χρήστη μέσω φορμών, μέσω της χρήσης της πλατφόρμας και μέσω cookies λειτουργικότητας και ασφάλειας."
      },
      {
        heading: "4. Σκοπός Επεξεργασίας",
        content: "Τα δεδομένα χρησιμοποιούνται αποκλειστικά για τη λειτουργία και παροχή της υπηρεσίας, τη διαχείριση του λογαριασμού χρήστη, την τεχνική υποστήριξη και τη βελτίωση της εμπειρίας χρήστη."
      },
      {
        heading: "5. Νομική Βάση Επεξεργασίας (GDPR – Άρθρο 6)",
        content: "Η επεξεργασία βασίζεται στη συγκατάθεση του χρήστη, στην εκτέλεση σύμβασης και στο έννομο συμφέρον για την ασφάλεια και λειτουργία της πλατφόρμας."
      },
      {
        heading: "6. Αυτοματοποιημένη Επεξεργασία",
        content: "Ορισμένα δεδομένα ενδέχεται να υποβάλλονται σε αυτοματοποιημένη επεξεργασία (υπολογισμοί, στατιστικά, σύνοψη δεδομένων). Η τελική ευθύνη για την ακρίβεια των δεδομένων ανήκει αποκλειστικά στον χρήστη."
      },
      {
        heading: "7. Τρίτοι Πάροχοι",
        content: "Τα δεδομένα ενδέχεται να διαβιβαστούν σε τρίτους παρόχους μόνο εφόσον είναι απαραίτητο για τη λειτουργία της υπηρεσίας και σύμφωνα με τον GDPR."
      },
      {
        heading: "8. Cookies",
        content: "Η πλατφόρμα χρησιμοποιεί cookies λειτουργικότητας και ασφάλειας. Ο χρήστης μπορεί να τα διαχειριστεί μέσω των ρυθμίσεων του προγράμματος περιήγησής του."
      },
      {
        heading: "9. Δικαιώματα Χρήστη",
        content: "Ο χρήστης έχει δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού ή εναντίωσης στην επεξεργασία και ανάκλησης της συγκατάθεσης."
      },
      {
        heading: "10. Διάρκεια Τήρησης",
        content: "Τα δεδομένα διατηρούνται όσο ο λογαριασμός παραμένει ενεργός ή όσο απαιτείται από την ισχύουσα νομοθεσία."
      },
      {
        heading: "11. Ασφάλεια Δεδομένων",
        content: "Λαμβάνονται κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων."
      },
      {
        heading: "12. Ανηλίκοι",
        content: "Η υπηρεσία δεν απευθύνεται σε άτομα κάτω των 16 ετών."
      },
      {
        heading: "13. Επικοινωνία",
        content: "Για θέματα απορρήτου, ο χρήστης μπορεί να επικοινωνήσει μέσω των στοιχείων επικοινωνίας της πλατφόρμας."
      }
    ]
  },
  en: {
    disclaimer: "The legally binding version is in Greek. All other language versions are informational translations.",
    sections: [
      {
        heading: "1. Data Controller",
        content: "The APALLAKTIS platform acts as the Data Controller of personal data processed in the context of providing the service."
      },
      {
        heading: "2. Data We Collect",
        content: "We collect only data necessary for the operation of the service, such as: registration data (name, email, phone), user account data, financial data entered by the user (projects, payments, expenses), technical data (IP address, device type, browser), security logs."
      },
      {
        heading: "3. How We Collect Data",
        content: "Data is collected directly from the user through forms, through use of the platform, and via functional and security cookies."
      },
      {
        heading: "4. Purpose of Processing",
        content: "Data is used exclusively to provide and operate the service, manage user accounts, provide technical support, and improve user experience."
      },
      {
        heading: "5. Legal Basis (GDPR Article 6)",
        content: "Processing is based on user consent, contract performance, and legitimate interest related to security and service operation."
      },
      {
        heading: "6. Automated Processing",
        content: "Some data may be processed automatically (calculations, statistics, summaries). Final responsibility for data accuracy remains with the user."
      },
      {
        heading: "7. Third Parties",
        content: "Data may be shared with third-party providers only when necessary for service operation and in compliance with GDPR."
      },
      {
        heading: "8. Cookies",
        content: "The platform uses functional and security cookies. Users can manage cookies via browser settings."
      },
      {
        heading: "9. User Rights",
        content: "Users have the right to access, correct, delete, restrict or object to processing, and withdraw consent."
      },
      {
        heading: "10. Data Retention",
        content: "Data is retained while the account is active or as required by law."
      },
      {
        heading: "11. Data Security",
        content: "Appropriate technical and organizational measures are taken to protect data."
      },
      {
        heading: "12. Minors",
        content: "The service is not intended for persons under the age of 16."
      },
      {
        heading: "13. Contact",
        content: "For privacy-related matters, users may contact the platform through its contact details."
      }
    ]
  },
  ru: {
    disclaimer: "Юридически обязывающая версия на греческом языке. Все остальные языковые версии являются информационными переводами.",
    sections: [
      {
        heading: "1. Оператор данных",
        content: "Платформа АПАЛЛАКТИС является оператором персональных данных пользователей."
      },
      {
        heading: "2. Какие данные мы собираем",
        content: "Мы собираем только данные, необходимые для работы сервиса: регистрационные данные, данные аккаунта, финансовые данные, вводимые пользователем, технические данные и журналы безопасности."
      },
      {
        heading: "3. Как собираются данные",
        content: "Данные собираются через формы, при использовании сервиса и с помощью cookies функциональности и безопасности."
      },
      {
        heading: "4. Цель обработки",
        content: "Данные используются исключительно для предоставления сервиса, управления аккаунтом и улучшения пользовательского опыта."
      },
      {
        heading: "5. Правовое основание",
        content: "Обработка осуществляется на основании согласия пользователя, исполнения договора и законного интереса."
      },
      {
        heading: "6. Автоматизированная обработка",
        content: "Часть данных может обрабатываться автоматически. Ответственность за точность данных несёт пользователь."
      },
      {
        heading: "7. Третьи лица",
        content: "Данные могут передаваться третьим лицам только для работы сервиса и в соответствии с GDPR."
      },
      {
        heading: "8. Cookies",
        content: "Используются cookies функциональности и безопасности."
      },
      {
        heading: "9. Права пользователя",
        content: "Пользователь имеет право на доступ, исправление, удаление и отзыв согласия."
      },
      {
        heading: "10. Срок хранения",
        content: "Данные хранятся, пока аккаунт активен или требуется законом."
      },
      {
        heading: "11. Безопасность",
        content: "Применяются меры защиты данных."
      },
      {
        heading: "12. Несовершеннолетние",
        content: "Сервис не предназначен для лиц младше 16 лет."
      },
      {
        heading: "13. Контакты",
        content: "Связь осуществляется через контакты платформы."
      }
    ]
  },
  uk: {
    disclaimer: "Юридично обов'язкова версія грецькою. Усі інші мовні версії є інформаційними перекладами.",
    sections: [
      {
        heading: "1. Контролер даних",
        content: "Платформа APALLAKTIS виступає контролером персональних даних, які обробляються в межах надання сервісу."
      },
      {
        heading: "2. Які дані ми збираємо",
        content: "Ми збираємо лише ті дані, які є необхідними для функціонування сервісу, зокрема: реєстраційні дані (ім'я, електронна пошта, телефон), дані облікового запису користувача, фінансові дані, які вводить користувач (проєкти, платежі, витрати), технічні дані (IP-адреса, тип пристрою, браузер), журнали безпеки (logs)."
      },
      {
        heading: "3. Як ми збираємо дані",
        content: "Дані збираються: безпосередньо від користувача через форми, під час використання платформи, за допомогою файлів cookie для функціональності та безпеки."
      },
      {
        heading: "4. Мета обробки",
        content: "Дані використовуються виключно для: надання та функціонування сервісу, управління обліковим записом користувача, технічної підтримки та забезпечення безпеки, покращення користувацького досвіду."
      },
      {
        heading: "5. Правова підстава обробки (GDPR, стаття 6)",
        content: "Обробка даних здійснюється на підставі: згоди користувача, виконання договору, законного інтересу щодо безпеки та стабільної роботи сервісу."
      },
      {
        heading: "6. Автоматизована обробка",
        content: "Деякі дані можуть оброблятися автоматично (обчислення, статистика, зведення даних). Остаточна відповідальність за точність даних залишається за користувачем."
      },
      {
        heading: "7. Треті сторони",
        content: "Дані можуть передаватися третім сторонам лише у випадках, коли це необхідно для роботи сервісу (наприклад, хостинг, платіжні або email-сервіси) та відповідно до вимог GDPR."
      },
      {
        heading: "8. Файли cookie",
        content: "Платформа використовує файли cookie для функціональності та безпеки. Користувач може керувати або вимикати файли cookie через налаштування свого браузера."
      },
      {
        heading: "9. Права користувача",
        content: "Користувач має право: на доступ до своїх даних, на виправлення або видалення даних, на обмеження або заперечення обробки, на відкликання своєї згоди у будь-який момент."
      },
      {
        heading: "10. Строк зберігання",
        content: "Дані зберігаються протягом часу, поки обліковий запис є активним, або відповідно до вимог законодавства."
      },
      {
        heading: "11. Безпека даних",
        content: "Вживаються відповідні технічні та організаційні заходи для захисту даних від несанкціонованого доступу або втрати."
      },
      {
        heading: "12. Неповнолітні",
        content: "Сервіс не призначений для осіб віком до 16 років."
      },
      {
        heading: "13. Контакт",
        content: "З питань конфіденційності користувач може звернутися через контактні дані, зазначені на платформі."
      }
    ]
  },
  sq: {
    disclaimer: "Versioni juridikisht i detyrueshëm është në greqisht. Të gjitha versionet e tjera gjuhësore janë përkthime informative.",
    sections: [
      {
        heading: "1. Kontrolluesi i të Dhënave",
        content: "Platforma APALLAKTIS vepron si kontrollues i të dhënave personale që përpunohen në kuadër të ofrimit të shërbimit."
      },
      {
        heading: "2. Çfarë të dhënash mbledhim",
        content: "Ne mbledhim vetëm të dhëna të nevojshme për funksionimin e shërbimit, si: të dhëna regjistrimi (emër, email, telefon), të dhëna të llogarisë së përdoruesit, të dhëna financiare të futura nga përdoruesi (projekte, pagesa, shpenzime), të dhëna teknike (adresa IP, lloji i pajisjes, shfletuesi), regjistra sigurie (logs)."
      },
      {
        heading: "3. Si i mbledhim të dhënat",
        content: "Të dhënat mblidhen: drejtpërdrejt nga përdoruesi përmes formularëve, gjatë përdorimit të platformës, përmes cookies funksionale dhe sigurie."
      },
      {
        heading: "4. Qëllimi i përpunimit",
        content: "Të dhënat përdoren vetëm për: ofrimin dhe funksionimin e shërbimit, menaxhimin e llogarisë së përdoruesit, mbështetjen teknike dhe sigurinë, përmirësimin e përvojës së përdoruesit."
      },
      {
        heading: "5. Baza Ligjore (GDPR – Neni 6)",
        content: "Përpunimi bazohet në: pëlqimin e përdoruesit, ekzekutimin e kontratës, interesin legjitim për sigurinë dhe funksionimin e shërbimit."
      },
      {
        heading: "6. Përpunimi i Automatizuar",
        content: "Disa të dhëna mund të përpunohen automatikisht (llogaritje, statistika, përmbledhje). Përgjegjësia për saktësinë e të dhënave mbetet te përdoruesi."
      },
      {
        heading: "7. Palë të Treta",
        content: "Të dhënat mund t'u transmetohen palëve të treta vetëm kur është e nevojshme për funksionimin e shërbimit dhe në përputhje me GDPR."
      },
      {
        heading: "8. Cookies",
        content: "Platforma përdor cookies funksionale dhe sigurie. Përdoruesi mund t'i menaxhojë ato përmes cilësimeve të shfletuesit."
      },
      {
        heading: "9. Të Drejtat e Përdoruesit",
        content: "Përdoruesi ka të drejtë: aksesimi, korrigjimi ose fshirja e të dhënave, kufizimi ose kundërshtimi i përpunimit, tërheqja e pëlqimit në çdo kohë."
      },
      {
        heading: "10. Kohëzgjatja e Ruajtjes",
        content: "Të dhënat ruhen për aq kohë sa llogaria është aktive ose sipas kërkesave ligjore."
      },
      {
        heading: "11. Siguria e të Dhënave",
        content: "Zbatohen masa teknike dhe organizative për mbrojtjen e të dhënave."
      },
      {
        heading: "12. Të Miturit",
        content: "Shërbimi nuk është i destinuar për persona nën moshën 16 vjeç."
      },
      {
        heading: "13. Kontakt",
        content: "Për çështje privatësie, përdoruesi mund të kontaktojë përmes të dhënave të kontaktit të platformës."
      }
    ]
  },
  bg: {
    disclaimer: "Юридически обвързващата версия е на гръцки. Всички останали езикови версии са информационни преводи.",
    sections: [
      {
        heading: "1. Администратор на данни",
        content: "Платформата APALLAKTIS действа като администратор на личните данни."
      },
      {
        heading: "2. Какви данни събираме",
        content: "Събираме само данни, необходими за работата на услугата, включително: регистрационни данни (име, email, телефон), данни за потребителския акаунт, финансови данни, въведени от потребителя (проекти, плащания, разходи), технически данни (IP адрес, устройство, браузър), защитни логове."
      },
      {
        heading: "3. Как събираме данните",
        content: "Данните се събират чрез форми, използване на платформата и чрез функционални и защитни cookies."
      },
      {
        heading: "4. Цел на обработката",
        content: "Данните се използват само за предоставяне и поддръжка на услугата, управление на акаунта и подобряване на потребителското изживяване."
      },
      {
        heading: "5. Правно основание",
        content: "Обработката се основава на съгласие, изпълнение на договор и легитимен интерес."
      },
      {
        heading: "6. Автоматизирана обработка",
        content: "Възможна е автоматизирана обработка. Отговорността за точността е на потребителя."
      },
      {
        heading: "7. Трети страни",
        content: "Данните се споделят с трети страни само при необходимост и в съответствие с GDPR."
      },
      {
        heading: "8. Cookies",
        content: "Използват се cookies за функционалност и сигурност."
      },
      {
        heading: "9. Права на потребителя",
        content: "Достъп, корекция, изтриване, ограничаване и оттегляне на съгласие."
      },
      {
        heading: "10. Срок на съхранение",
        content: "Докато акаунтът е активен или по закон."
      },
      {
        heading: "11. Сигурност",
        content: "Прилагат се защитни мерки."
      },
      {
        heading: "12. Непълнолетни",
        content: "Услугата не е предназначена за лица под 16 години."
      },
      {
        heading: "13. Контакт",
        content: "Контакт чрез данните на платформата."
      }
    ]
  },
  ro: {
    disclaimer: "Versiunea legal obligatorie este în greacă. Toate celelalte versiuni lingvistice sunt traduceri informative.",
    sections: [
      {
        heading: "1. Operator de date",
        content: "Platforma APALLAKTIS acționează ca operator de date."
      },
      {
        heading: "2. Date colectate",
        content: "Colectăm doar date necesare funcționării serviciului: date de înregistrare, date de cont, date financiare introduse de utilizator, date tehnice, jurnale de securitate."
      },
      {
        heading: "3. Colectare",
        content: "Prin formulare, utilizarea platformei și cookies."
      },
      {
        heading: "4. Scop",
        content: "Furnizarea serviciului, gestionarea contului și îmbunătățirea experienței."
      },
      {
        heading: "5. Bază legală",
        content: "Consimțământ, contract, interes legitim."
      },
      {
        heading: "6. Procesare automată",
        content: "Datele pot fi procesate automat; responsabilitatea revine utilizatorului."
      },
      {
        heading: "7. Terți",
        content: "Doar dacă este necesar și conform GDPR."
      },
      {
        heading: "8. Cookies",
        content: "Funcționale și de securitate."
      },
      {
        heading: "9. Drepturi",
        content: "Acces, corectare, ștergere, retragere consimțământ."
      },
      {
        heading: "10. Păstrare",
        content: "Cât timp contul este activ."
      },
      {
        heading: "11. Securitate",
        content: "Măsuri adecvate aplicate."
      },
      {
        heading: "12. Minori",
        content: "Nu este destinat minorilor sub 16 ani."
      },
      {
        heading: "13. Contact",
        content: "Prin datele platformei."
      }
    ]
  },
  ar: {
    disclaimer: "النسخة الملزمة قانونيًا هي باللغة اليونانية. جميع النسخ اللغوية الأخرى هي ترجمات إرشادية.",
    sections: [
      {
        heading: "1. مسؤول معالجة البيانات",
        content: "تعمل منصة APALLAKTIS كمسؤول عن معالجة البيانات الشخصية."
      },
      {
        heading: "2. البيانات التي نجمعها",
        content: "نقوم بجمع البيانات الضرورية فقط لتشغيل الخدمة، مثل: بيانات التسجيل، بيانات الحساب، البيانات المالية التي يدخلها المستخدم، البيانات التقنية، سجلات الأمان."
      },
      {
        heading: "3. كيفية جمع البيانات",
        content: "يتم جمع البيانات عبر النماذج، استخدام المنصة، وملفات تعريف الارتباط."
      },
      {
        heading: "4. غرض المعالجة",
        content: "تُستخدم البيانات لتقديم الخدمة وإدارتها وتحسين تجربة المستخدم فقط."
      },
      {
        heading: "5. الأساس القانوني",
        content: "الموافقة، تنفيذ العقد، والمصلحة المشروعة."
      },
      {
        heading: "6. المعالجة الآلية",
        content: "قد تتم معالجة بعض البيانات تلقائيًا. المسؤولية تقع على المستخدم."
      },
      {
        heading: "7. أطراف ثالثة",
        content: "تتم مشاركة البيانات فقط عند الضرورة ووفقًا لـ GDPR."
      },
      {
        heading: "8. ملفات تعريف الارتباط",
        content: "نستخدم ملفات تعريف ارتباط وظيفية وأمنية."
      },
      {
        heading: "9. حقوق المستخدم",
        content: "الوصول، التصحيح، الحذف، سحب الموافقة."
      },
      {
        heading: "10. مدة الاحتفاظ",
        content: "طالما أن الحساب نشط أو حسب القانون."
      },
      {
        heading: "11. الأمان",
        content: "يتم تطبيق تدابير أمنية مناسبة."
      },
      {
        heading: "12. القُصّر",
        content: "الخدمة غير مخصصة لمن هم دون 16 عامًا."
      },
      {
        heading: "13. الاتصال",
        content: "عبر بيانات الاتصال الخاصة بالمنصة."
      }
    ]
  }
};

// Terms of Use
export const termsOfUse: Record<string, LegalContent> = {
  el: {
    disclaimer: "Νομικά δεσμευτική έκδοση είναι η ελληνική. Όλες οι υπόλοιπες γλωσσικές εκδόσεις αποτελούν ενημερωτικές μεταφράσεις.",
    sections: [
      {
        heading: "1. Περιγραφή Υπηρεσίας",
        content: "Η πλατφόρμα ΑΠΑΛΛΑΚΤΗΣ παρέχει ψηφιακό εργαλείο οργάνωσης, καταγραφής και παρακολούθησης οικονομικών στοιχείων, έργων, πληρωμών και εξόδων. Η υπηρεσία δεν αποτελεί λογιστική, φορολογική ή νομική συμβουλευτική."
      },
      {
        heading: "2. Αποδοχή Όρων",
        content: "Η χρήση της πλατφόρμας προϋποθέτει την πλήρη αποδοχή των παρόντων Όρων Χρήσης και της Πολιτικής Απορρήτου."
      },
      {
        heading: "3. Λογαριασμός Χρήστη",
        content: "Ο χρήστης είναι αποκλειστικά υπεύθυνος για: την ακρίβεια των δεδομένων που καταχωρεί, την ασφάλεια των στοιχείων σύνδεσης, κάθε ενέργεια που πραγματοποιείται μέσω του λογαριασμού του."
      },
      {
        heading: "4. Δοκιμαστική Περίοδος και Συνδρομή",
        content: "Η πλατφόρμα μπορεί να προσφέρει δοκιμαστική πρόσβαση περιορισμένης διάρκειας. Μετά τη λήξη της δοκιμαστικής περιόδου, απαιτείται ενεργή συνδρομή για τη συνέχιση της χρήσης."
      },
      {
        heading: "5. Οικονομικά Δεδομένα",
        content: "Όλα τα οικονομικά δεδομένα εισάγονται από τον χρήστη. Η ΑΠΑΛΛΑΚΤΗΣ δεν εγγυάται την ακρίβεια των αποτελεσμάτων και δεν ευθύνεται για αποφάσεις που λαμβάνονται βάσει αυτών."
      },
      {
        heading: "6. Αποποίηση Ευθύνης",
        content: "Η ΑΠΑΛΛΑΚΤΗΣ δεν φέρει ευθύνη για: σφάλματα καταχώρησης δεδομένων, απώλειες ή ζημίες που προκύπτουν από τη χρήση της υπηρεσίας, φορολογικές ή λογιστικές συνέπειες."
      },
      {
        heading: "7. Διαθεσιμότητα Υπηρεσίας",
        content: "Η λειτουργία της πλατφόρμας παρέχεται «ως έχει». Δεν παρέχεται εγγύηση αδιάλειπτης ή χωρίς σφάλματα λειτουργίας."
      },
      {
        heading: "8. Πνευματική Ιδιοκτησία",
        content: "Όλο το περιεχόμενο της πλατφόρμας αποτελεί πνευματική ιδιοκτησία της ΑΠΑΛΛΑΚΤΗΣ."
      },
      {
        heading: "9. Τροποποιήσεις",
        content: "Η ΑΠΑΛΛΑΚΤΗΣ διατηρεί το δικαίωμα τροποποίησης των Όρων Χρήσης οποτεδήποτε."
      },
      {
        heading: "10. Εφαρμοστέο Δίκαιο",
        content: "Οι παρόντες Όροι διέπονται από το Ελληνικό Δίκαιο. Αρμόδια είναι τα δικαστήρια της Ελλάδας."
      }
    ]
  },
  en: {
    disclaimer: "The legally binding version is in Greek. All other language versions are informational translations.",
    sections: [
      {
        heading: "1. Service Description",
        content: "APALLAKTIS provides a digital tool for organizing and tracking financial data, projects, payments, and expenses. The service does not provide accounting, tax, or legal advice."
      },
      {
        heading: "2. Acceptance of Terms",
        content: "Use of the platform requires acceptance of these Terms and the Privacy Policy."
      },
      {
        heading: "3. User Account",
        content: "The user is fully responsible for data accuracy, account security, and all actions performed."
      },
      {
        heading: "4. Trial and Subscription",
        content: "A limited trial period may be offered. Continued use requires an active subscription."
      },
      {
        heading: "5. Financial Data",
        content: "All financial data is entered by the user. APALLAKTIS is not responsible for decisions based on such data."
      },
      {
        heading: "6. Disclaimer",
        content: "APALLAKTIS is not liable for errors, losses, or consequences arising from use of the service."
      },
      {
        heading: "7. Availability",
        content: "The service is provided 'as is', without guarantees of uninterrupted operation."
      },
      {
        heading: "8. Intellectual Property",
        content: "All content is the intellectual property of APALLAKTIS."
      },
      {
        heading: "9. Modifications",
        content: "Terms may be updated at any time."
      },
      {
        heading: "10. Governing Law",
        content: "Greek law applies."
      }
    ]
  },
  ru: {
    disclaimer: "Юридически обязывающая версия на греческом языке. Все остальные языковые версии являются информационными переводами.",
    sections: [
      {
        heading: "1. Описание сервиса",
        content: "АПАЛЛАКТИС — это инструмент для учёта и организации финансовых данных. Сервис не является бухгалтерской или налоговой консультацией."
      },
      {
        heading: "2. Принятие условий",
        content: "Использование сервиса означает согласие с условиями и политикой конфиденциальности."
      },
      {
        heading: "3. Ответственность пользователя",
        content: "Пользователь несёт ответственность за введённые данные и доступ к аккаунту."
      },
      {
        heading: "4. Пробный период и подписка",
        content: "Может предоставляться ограниченный пробный период. Для дальнейшего использования требуется подписка."
      },
      {
        heading: "5. Финансовые данные",
        content: "Все данные вводятся пользователем. Сервис не отвечает за принятые решения."
      },
      {
        heading: "6. Ограничение ответственности",
        content: "Сервис не несёт ответственности за ошибки и последствия использования."
      },
      {
        heading: "7. Доступность",
        content: "Сервис предоставляется «как есть»."
      },
      {
        heading: "8. Авторские права",
        content: "Все материалы принадлежат APALLAKTIS."
      },
      {
        heading: "9. Изменения",
        content: "Условия могут изменяться."
      },
      {
        heading: "10. Применимое право",
        content: "Применяется право Греции."
      }
    ]
  },
  uk: {
    disclaimer: "Юридично обов'язкова версія грецькою. Усі інші мовні версії є інформаційними перекладами.",
    sections: [
      {
        heading: "1. Опис сервісу",
        content: "Платформа APALLAKTIS надає цифровий інструмент для організації, обліку та відстеження фінансових даних, проєктів, платежів і витрат. Сервіс не є бухгалтерською, податковою або юридичною консультацією."
      },
      {
        heading: "2. Прийняття умов",
        content: "Використання платформи означає повну згоду з цими Умовами використання та Політикою конфіденційності."
      },
      {
        heading: "3. Обліковий запис користувача",
        content: "Користувач несе повну відповідальність за: точність введених даних, безпеку доступу до облікового запису, усі дії, виконані через його акаунт."
      },
      {
        heading: "4. Пробний період та підписка",
        content: "Платформа може надавати пробний доступ обмеженої тривалості. Після завершення пробного періоду для подальшого використання потрібна активна підписка."
      },
      {
        heading: "5. Фінансові дані",
        content: "Усі фінансові дані вводяться користувачем. APALLAKTIS не гарантує точність результатів і не несе відповідальності за рішення, прийняті на їх основі."
      },
      {
        heading: "6. Обмеження відповідальності",
        content: "APALLAKTIS не несе відповідальності за: помилки введення даних, фінансові або інші збитки, податкові чи бухгалтерські наслідки."
      },
      {
        heading: "7. Доступність сервісу",
        content: "Сервіс надається «як є» без гарантії безперебійної або безпомилкової роботи."
      },
      {
        heading: "8. Інтелектуальна власність",
        content: "Увесь контент платформи є інтелектуальною власністю APALLAKTIS."
      },
      {
        heading: "9. Зміни",
        content: "APALLAKTIS залишає за собою право змінювати ці Умови у будь-який час."
      },
      {
        heading: "10. Застосовне право",
        content: "Ці Умови регулюються законодавством Греції. Компетентними є суди Греції."
      }
    ]
  },
  sq: {
    disclaimer: "Versioni juridikisht i detyrueshëm është në greqisht. Të gjitha versionet e tjera gjuhësore janë përkthime informative.",
    sections: [
      {
        heading: "1. Përshkrimi i Shërbimit",
        content: "Platforma APALLAKTIS ofron një mjet dixhital për organizimin dhe ndjekjen e të dhënave financiare, projekteve, pagesave dhe shpenzimeve. Shërbimi nuk përbën këshillë kontabël, tatimore ose ligjore."
      },
      {
        heading: "2. Pranimi i Kushteve",
        content: "Përdorimi i platformës nënkupton pranimin e plotë të këtyre Kushteve dhe Politikës së Privatësisë."
      },
      {
        heading: "3. Llogaria e Përdoruesit",
        content: "Përdoruesi është plotësisht përgjegjës për: saktësinë e të dhënave, sigurinë e llogarisë, të gjitha veprimet e kryera."
      },
      {
        heading: "4. Periudha Provë dhe Abonimi",
        content: "Mund të ofrohet një periudhë prove me kohë të kufizuar. Përdorimi i mëtejshëm kërkon abonim aktiv."
      },
      {
        heading: "5. Të Dhënat Financiare",
        content: "Të gjitha të dhënat futen nga përdoruesi. APALLAKTIS nuk mban përgjegjësi për vendime të marra mbi bazën e tyre."
      },
      {
        heading: "6. Mohim Përgjegjësie",
        content: "Platforma nuk mban përgjegjësi për gabime, humbje apo pasoja fiskale."
      },
      {
        heading: "7. Disponueshmëria",
        content: "Shërbimi ofrohet 'siç është', pa garanci."
      },
      {
        heading: "8. Pronësia Intelektuale",
        content: "I gjithë përmbajtja i përket APALLAKTIS."
      },
      {
        heading: "9. Ndryshime",
        content: "Kushtet mund të ndryshohen në çdo kohë."
      },
      {
        heading: "10. Ligji i Zbatueshëm",
        content: "Zbatohet ligji grek."
      }
    ]
  },
  bg: {
    disclaimer: "Юридически обвързващата версия е на гръцки. Всички останали езикови версии са информационни преводи.",
    sections: [
      {
        heading: "1. Описание на услугата",
        content: "Платформата APALLAKTIS предоставя дигитален инструмент за управление и проследяване на финансови данни, проекти, плащания и разходи. Услугата не представлява счетоводна, данъчна или правна консултация."
      },
      {
        heading: "2. Приемане на условията",
        content: "Използването на платформата означава приемане на настоящите условия и политиката за поверителност."
      },
      {
        heading: "3. Потребителски акаунт",
        content: "Потребителят носи пълна отговорност за въведените данни и сигурността на акаунта."
      },
      {
        heading: "4. Пробен период и абонамент",
        content: "Може да бъде предоставен ограничен пробен период. След него се изисква активен абонамент."
      },
      {
        heading: "5. Финансови данни",
        content: "Данните се въвеждат от потребителя. APALLAKTIS не носи отговорност за взети решения."
      },
      {
        heading: "6. Ограничаване на отговорността",
        content: "Платформата не отговаря за грешки, загуби или последици."
      },
      {
        heading: "7. Наличност",
        content: "Услугата се предоставя «както е»."
      },
      {
        heading: "8. Авторски права",
        content: "Съдържанието принадлежи на APALLAKTIS."
      },
      {
        heading: "9. Промени",
        content: "Условията могат да бъдат променяни."
      },
      {
        heading: "10. Приложимо право",
        content: "Прилага се гръцкото право."
      }
    ]
  },
  ro: {
    disclaimer: "Versiunea legal obligatorie este în greacă. Toate celelalte versiuni lingvistice sunt traduceri informative.",
    sections: [
      {
        heading: "1. Descrierea serviciului",
        content: "APALLAKTIS oferă un instrument digital pentru organizarea și urmărirea datelor financiare, proiectelor, plăților și cheltuielilor. Serviciul nu reprezintă consultanță contabilă, fiscală sau juridică."
      },
      {
        heading: "2. Acceptarea termenilor",
        content: "Utilizarea platformei implică acceptarea acestor termeni și a politicii de confidențialitate."
      },
      {
        heading: "3. Contul utilizatorului",
        content: "Utilizatorul este responsabil pentru datele introduse și securitatea contului."
      },
      {
        heading: "4. Perioadă de probă și abonament",
        content: "Poate fi oferită o perioadă de probă limitată. Utilizarea ulterioară necesită abonament activ."
      },
      {
        heading: "5. Date financiare",
        content: "Datele sunt introduse de utilizator. APALLAKTIS nu răspunde pentru deciziile luate."
      },
      {
        heading: "6. Limitarea răspunderii",
        content: "Platforma nu este responsabilă pentru erori sau pierderi."
      },
      {
        heading: "7. Disponibilitate",
        content: "Serviciul este oferit «ca atare»."
      },
      {
        heading: "8. Proprietate intelectuală",
        content: "Conținutul aparține APALLAKTIS."
      },
      {
        heading: "9. Modificări",
        content: "Termenii pot fi modificați."
      },
      {
        heading: "10. Legea aplicabilă",
        content: "Se aplică legea Greciei."
      }
    ]
  },
  ar: {
    disclaimer: "النسخة الملزمة قانونيًا هي باللغة اليونانية. جميع النسخ اللغوية الأخرى هي ترجمات إرشادية.",
    sections: [
      {
        heading: "1. وصف الخدمة",
        content: "توفر منصة APALLAKTIS أداة رقمية لتنظيم وتتبع البيانات المالية والمشاريع والمدفوعات والمصروفات. لا تمثل الخدمة استشارة محاسبية أو ضريبية أو قانونية."
      },
      {
        heading: "2. قبول الشروط",
        content: "استخدام المنصة يعني الموافقة الكاملة على هذه الشروط وسياسة الخصوصية."
      },
      {
        heading: "3. حساب المستخدم",
        content: "يتحمل المستخدم المسؤولية الكاملة عن صحة البيانات وأمان الحساب."
      },
      {
        heading: "4. الفترة التجريبية والاشتراك",
        content: "قد يتم توفير فترة تجريبية محدودة. يتطلب الاستخدام المستمر اشتراكًا نشطًا."
      },
      {
        heading: "5. البيانات المالية",
        content: "يتم إدخال جميع البيانات من قبل المستخدم. لا تتحمل APALLAKTIS مسؤولية القرارات المتخذة."
      },
      {
        heading: "6. إخلاء المسؤولية",
        content: "لا تتحمل المنصة مسؤولية الأخطاء أو الخسائر أو العواقب."
      },
      {
        heading: "7. توفر الخدمة",
        content: "يتم تقديم الخدمة «كما هي»."
      },
      {
        heading: "8. الملكية الفكرية",
        content: "جميع المحتويات مملوكة لـ APALLAKTIS."
      },
      {
        heading: "9. التعديلات",
        content: "يجوز تعديل الشروط في أي وقت."
      },
      {
        heading: "10. القانون المعمول به",
        content: "يخضع ذلك لقانون اليونان."
      }
    ]
  }
};

// =============================================
// AD MANAGEMENT SYSTEM
// =============================================

let lastAdRefreshTime = 0;
const AD_COOLDOWN = 30000;

// AD CONFIGURATION
const AD_CONFIG = {
    // Banner Ad (for results modal) - 300x250
    banner: {
        key: '49f2a402e67de18641783843fe0fa8f0',
        scriptSrc: '//www.highperformanceformat.com/49f2a402e67de18641783843fe0fa8f0/invoke.js'
    },
    // Native Ad (for cards containers)
    native: {
        key: '46074e7115c278e921d40938f6b8717b',
        scriptSrc: '//pl28201116.effectivegatecpm.com/46074e7115c278e921d40938f6b8717b/invoke.js',
        adInterval: 3
    }
};

// Function to load a fresh banner ad
function loadFreshBannerAd() {
    console.log("🔄 Loading fresh banner ad...");
    
    const placeholder = document.getElementById('adPlaceholder');
    if (!placeholder) return;
    
    placeholder.innerHTML = '';
    
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.textContent = `
        atOptions = {
            'key' : '${AD_CONFIG.banner.key}',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
        };
    `;
    
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = AD_CONFIG.banner.scriptSrc;
    
    placeholder.appendChild(adScript);
    placeholder.appendChild(invokeScript);
    
    lastAdRefreshTime = Date.now();
}

function shouldShowNewAd() {
    const now = Date.now();
    const timeSinceLastAd = now - lastAdRefreshTime;
    return timeSinceLastAd > AD_COOLDOWN;
}

function showBannerAd() {
    if (shouldShowNewAd()) {
        loadFreshBannerAd();
    }
}

// =============================================
// NATIVE ADS MANAGEMENT
// =============================================

let nativeAdCounter = 0;
let nativeAdScriptLoaded = false;

function createNativeAdSlot() {
    nativeAdCounter++;
    const uniqueId = `native-ad-${Date.now()}-${nativeAdCounter}`;
    
    const adContainer = document.createElement('div');
    adContainer.className = 'native-ad-container';
    
    // Create the ad slot
    const adSlot = document.createElement('div');
    adSlot.id = uniqueId;
    adSlot.className = 'native-ad-slot';
    adSlot.innerHTML = '<div style="text-align: center; padding: 20px;">Loading ad...</div>';
    
    // Add label and slot to container
    adContainer.innerHTML = '<div class="ad-label">Sponsored</div>';
    adContainer.appendChild(adSlot);
    
    // Load native ad script with delay
    setTimeout(() => {
        // Load the ad script if not already loaded
        if (!nativeAdScriptLoaded) {
            const script = document.createElement('script');
            script.async = true;
            script.cfasync = false;
            script.src = AD_CONFIG.native.scriptSrc;
            script.onload = () => {
                console.log('✅ Native ad script loaded');
                nativeAdScriptLoaded = true;
                loadNativeAdIntoSlot(uniqueId);
            };
            document.body.appendChild(script);
        } else {
            // Script already loaded, just inject the ad
            loadNativeAdIntoSlot(uniqueId);
        }
    }, 300);
    
    return adContainer;
}

function loadNativeAdIntoSlot(slotId) {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    
    // Clear and add fresh ad code
    slot.innerHTML = '';
    
    const adCode = `
        <script type="text/javascript">
            atOptions = {
                'key' : '${AD_CONFIG.native.key}',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        </script>
        <script type="text/javascript" src="${AD_CONFIG.native.scriptSrc}"></script>
    `;
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = adCode;
    
    // Add scripts to the slot
    while (tempDiv.firstChild) {
        slot.appendChild(tempDiv.firstChild);
    }
    
    console.log(`✅ Native ad loaded in slot: ${slotId}`);
}

function insertNativeAds(container, cards, cardType) {
    container.innerHTML = '';
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="no-quizzes-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>No ${cardType} available</p>
            </div>
        `;
        return;
    }
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        cards.forEach((card, index) => {
            container.appendChild(card);
            
            // Insert native ad after every N cards (starting from 3rd)
            if ((index + 1) % AD_CONFIG.native.adInterval === 0 && index !== cards.length - 1) {
                const adSlot = createNativeAdSlot();
                container.appendChild(adSlot);
            }
        });
        
        // Add one final ad if we have enough content
        if (cards.length >= AD_CONFIG.native.adInterval * 2) {
            const adSlot = createNativeAdSlot();
            container.appendChild(adSlot);
        }
    }, 50);
}

// =============================================
// APP STATE AND CONFIGURATION
// =============================================

const state = {
    user: null,
    hasFullAccess: true,
    currentPage: 'loading',
    selectedSubject: null,
    quizType: null, // 'random' or 'topic'
    selectedTopic: null,
    selectedQuiz: null,
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    quizTimeLimit: 0,
    timeRemaining: 0,
    timerInterval: null,
    questions: [],
    randomData: {},
    questionsData: {}
};

const subjects = [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Economics", "Geography", "History", "Government", "Commerce",
    "Accounting", "Literature in English", "Christian Religious Studies",
    "Islamic Religious Studies", "Further Mathematics", "French", "Agricultural Science"
];

const defaultQuestions = [
    {
        id: 1,
        text: "What is the value of π (pi) rounded to two decimal places?",
        options: ["3.14", "3.16", "3.12", "3.18"],
        answer: 0,
        explanation: "The value of π (pi) is approximately 3.14159. When rounded to two decimal places, it becomes 3.14."
    },
    {
        id: 2,
        text: "What is the square root of 144?",
        options: ["11", "12", "13", "14"],
        answer: 1,
        explanation: "12 × 12 = 144, so the square root of 144 is 12."
    },
    {
        id: 3,
        text: "Solve for x: 2x + 5 = 15",
        options: ["x = 5", "x = 10", "x = 7.5", "x = 5.5"],
        answer: 0,
        explanation: "Subtract 5 from both sides: 2x = 10. Divide both sides by 2: x = 5."
    },
    {
        id: 4,
        text: "What is 15% of 200?",
        options: ["15", "30", "45", "60"],
        answer: 1,
        explanation: "15% of 200 = 0.15 × 200 = 30."
    },
    {
        id: 5,
        text: "Simplify: (3x²)(4x³)",
        options: ["7x⁵", "12x⁵", "7x⁶", "12x⁶"],
        answer: 1,
        explanation: "Multiply coefficients: 3 × 4 = 12. Add exponents: 2 + 3 = 5. Result: 12x⁵."
    }
];

// =============================================
// DOM ELEMENTS
// =============================================

const loadingScreen = document.getElementById('loadingScreen');
const waveProgress = document.getElementById('waveProgress');
const continueBtn = document.getElementById('continueBtn');
const mainHeader = document.getElementById('mainHeader');
const homePage = document.getElementById('homePage');
const takeQuizBtn = document.getElementById('takeQuizBtn');
const quizScreen = document.getElementById('quizScreen');
const quizSubjectTitle = document.getElementById('quizSubjectTitle');
const quizTimer = document.getElementById('quizTimer');
const questionGrid = document.getElementById('questionGrid');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const homeNavBtn = document.getElementById('homeNavBtn');

// Modals
const subjectModal = document.getElementById('subjectModal');
const subjectSearch = document.getElementById('subjectSearch');
const subjectList = document.getElementById('subjectList');
const closeSubjectModal = document.getElementById('closeSubjectModal');
const setupModal = document.getElementById('setupModal');
const selectedQuizLabel = document.getElementById('selectedQuizLabel');
const durationSelect = document.getElementById('durationSelect');
const quizSetupForm = document.getElementById('quizSetupForm');
const closeSetupModal = document.getElementById('closeSetupModal');

// Explanation Modal Elements
const explanationModal = document.getElementById('explanationModal');
const closeExplanationModal = document.getElementById('closeExplanationModal');
const explanationTitle = document.getElementById('explanationTitle');
const resultIcon = document.getElementById('resultIcon');
const resultText = document.getElementById('resultText');
const explanationText = document.getElementById('explanationText');
const continueQuizBtn = document.getElementById('continueQuizBtn');

// Results Modal Elements
const resultsModal = document.getElementById('resultsModal');
const scorePercentage = document.getElementById('scorePercentage');
const correctCount = document.getElementById('correctCount');
const totalQuestions = document.getElementById('totalQuestions');
const closeResultsModal = document.getElementById('closeResultsModal');
const backToQuizzesBtn = document.getElementById('backToQuizzesBtn');
const goHomeBtn = document.getElementById('goHomeBtn');

// Toast Elements
const correctToast = document.getElementById('correctToast');
const incorrectToast = document.getElementById('incorrectToast');
const unansweredToast = document.getElementById('unansweredToast');

// New screens
const quizTypePage = document.getElementById('quizTypePage');
const backToSubjectsBtn = document.getElementById('backToSubjectsBtn');
const quizTypeTitle = document.getElementById('quizTypeTitle');
const quizTypeSelect = document.getElementById('quizTypeSelect');
const cardsContainer = document.getElementById('cardsContainer');

const topicQuizPage = document.getElementById('topicQuizPage');
const backToQuizTypeBtn = document.getElementById('backToQuizTypeBtn');
const topicQuizTitle = document.getElementById('topicQuizTitle');
const topicQuizContainer = document.getElementById('topicQuizContainer');

// =============================================
// INITIALIZATION
// =============================================

function initApp() {
    console.log("🚀 A Plus Buddy Initializing...");
    
    waveProgress.addEventListener('transitionend', function() {
        waveProgress.style.display = 'none';
        continueBtn.classList.remove('hidden');
        continueBtn.style.display = 'flex';
    });
    
    setTimeout(() => {
        waveProgress.classList.add('complete');
    }, 500);

    setupEventListeners();
}

function setupEventListeners() {
    // Continue Button
    continueBtn.addEventListener('click', handleContinue);
    
    // Home Navigation
    homeNavBtn.addEventListener('click', goToHomePage);
    
    // Home page
    takeQuizBtn.addEventListener('click', showSubjectModal);
    
    // Subject Modal
    closeSubjectModal.addEventListener('click', () => closeModal(subjectModal));
    subjectSearch.addEventListener('input', filterSubjects);
    
    // Setup Modal
    closeSetupModal.addEventListener('click', () => closeModal(setupModal));
    quizSetupForm.addEventListener('submit', handleQuizSetup);
    
    // New navigation
    backToSubjectsBtn.addEventListener('click', showSubjectModal);
    backToQuizTypeBtn.addEventListener('click', goToQuizTypeSelection);
    
    // Quiz type change
    quizTypeSelect.addEventListener('change', handleQuizTypeChange);
    
    // Explanation Modal
    closeExplanationModal.addEventListener('click', () => closeModal(explanationModal));
    continueQuizBtn.addEventListener('click', handleContinueAfterExplanation);
    
    // Results Modal
    closeResultsModal.addEventListener('click', () => closeModal(resultsModal));
    backToQuizzesBtn.addEventListener('click', () => {
        closeModal(resultsModal);
        if (state.quizType === 'topic' && state.selectedTopic) {
            showTopicQuizPage();
        } else {
            showQuizTypePage();
        }
    });
    goHomeBtn.addEventListener('click', () => {
        closeModal(resultsModal);
        goToHomePage();
    });
    
    // Quiz Navigation
    prevBtn.addEventListener('click', goToPreviousQuestion);
    nextBtn.addEventListener('click', goToNextQuestion);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
}

// =============================================
// CORE FUNCTIONS
// =============================================

function handleContinue() {
    continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    continueBtn.disabled = true;
    
    loadQuizData();
    
    setTimeout(() => {
        hideLoadingScreen();
        showHomePage();
        continueBtn.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
        continueBtn.disabled = false;
    }, 1000);
}

async function loadQuizData() {
    try {
        console.log("📥 Loading quiz data...");
        
        // Load random.json
        const randomResponse = await fetch('random.json');
        if (randomResponse.ok) {
            state.randomData = await randomResponse.json();
            console.log("✓ Loaded random.json");
        } else {
            console.error("Failed to load random.json");
            state.randomData = {};
        }
        
        // Load questions.json
        const questionsResponse = await fetch('questions.json');
        if (questionsResponse.ok) {
            state.questionsData = await questionsResponse.json();
            console.log("✓ Loaded questions.json");
        } else {
            console.error("Failed to load questions.json");
            state.questionsData = {};
        }
        
    } catch (error) {
        console.error("Error loading quiz data:", error);
        state.randomData = {};
        state.questionsData = {};
    }
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainHeader.classList.remove('hidden');
    }, 500);
}

// =============================================
// PAGE NAVIGATION
// =============================================

function hideAllPages() {
    homePage.classList.add('hidden');
    quizTypePage.classList.add('hidden');
    topicQuizPage.classList.add('hidden');
    quizScreen.classList.add('hidden');
}

function showHomePage() {
    hideAllPages();
    homePage.classList.remove('hidden');
    state.currentPage = 'home';
}

function goToHomePage() {
    showHomePage();
}

function goToQuizTypeSelection() {
    showQuizTypePage();
}

// =============================================
// QUIZ TYPE SELECTION PAGE
// =============================================

async function showQuizTypePage() {
    hideAllPages();
    quizTypePage.classList.remove('hidden');
    state.currentPage = 'quizType';
    
    quizTypeTitle.textContent = `${state.selectedSubject} Quizzes`;
    quizTypeSelect.value = 'random';
    state.quizType = 'random';
    
    if (Object.keys(state.randomData).length === 0) {
        await loadQuizData();
    }
    
    displayQuizTypeCards();
}

function handleQuizTypeChange() {
    state.quizType = quizTypeSelect.value;
    displayQuizTypeCards();
}

async function displayQuizTypeCards() {
    const cardElements = [];
    
    if (state.quizType === 'random') {
        // Show random quiz cards
        cardElements.push(...await createRandomQuizCards());
    } else {
        // Show topic-based cards
        cardElements.push(...await createTopicCards());
    }
    
    insertNativeAds(cardsContainer, cardElements, state.quizType === 'random' ? 'random quizzes' : 'topics');
}

async function createRandomQuizCards() {
    const cards = [];
    const subject = state.selectedSubject;
    
    if (state.randomData[subject]) {
        const quizzes = state.randomData[subject];
        
        Object.keys(quizzes).forEach(quizNumber => {
            const quiz = quizzes[quizNumber];
            const questionsCount = Array.isArray(quiz) ? quiz.length : 50;
            
            const card = createCard({
                type: 'random',
                title: `Random Quiz ${quizNumber.replace('quiz', '')}`,
                subtitle: `${questionsCount} questions`,
                onClick: () => handleRandomQuizSelection(quizNumber, questionsCount)
            });
            
            cards.push(card);
        });
    } else {
        // If no random quizzes found, show message
        cardsContainer.innerHTML = `
            <div class="no-quizzes-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>No random quizzes available for ${subject}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Try selecting "Topic-Based Quiz" instead</p>
            </div>
        `;
        return [];
    }
    
    return cards;
}

async function createTopicCards() {
    const cards = [];
    const subject = state.selectedSubject;
    
    if (state.questionsData[subject]) {
        const topics = Object.keys(state.questionsData[subject]);
        
        if (topics.length > 0) {
            topics.forEach(topic => {
                const topicData = state.questionsData[subject][topic];
                const quizCount = Object.keys(topicData).length;
                
                const card = createCard({
                    type: 'topic',
                    title: topic,
                    subtitle: `${quizCount} quiz${quizCount !== 1 ? 'zes' : ''} available`,
                    onClick: () => handleTopicSelection(topic)
                });
                
                cards.push(card);
            });
        } else {
            // If no topics found
            cardsContainer.innerHTML = `
                <div class="no-quizzes-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No topics available for ${subject}</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Try selecting "Random Quiz" instead</p>
                </div>
            `;
            return [];
        }
    } else {
        // If subject doesn't have topic-based quizzes
        cardsContainer.innerHTML = `
            <div class="no-quizzes-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${subject} doesn't have topic-based quizzes</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Try selecting "Random Quiz" instead</p>
            </div>
        `;
        return [];
    }
    
    return cards;
}

// =============================================
// TOPIC QUIZ SELECTION PAGE
// =============================================

function handleTopicSelection(topic) {
    state.selectedTopic = topic;
    showTopicQuizPage();
}

function showTopicQuizPage() {
    hideAllPages();
    topicQuizPage.classList.remove('hidden');
    state.currentPage = 'topicQuiz';
    
    topicQuizTitle.textContent = `${state.selectedSubject}: ${state.selectedTopic}`;
    displayTopicQuizCards();
}

function displayTopicQuizCards() {
    const cardElements = createTopicQuizCards();
    insertNativeAds(topicQuizContainer, cardElements, 'quizzes');
}

function createTopicQuizCards() {
    const cards = [];
    const subject = state.selectedSubject;
    const topic = state.selectedTopic;
    
    if (state.questionsData[subject] && state.questionsData[subject][topic]) {
        const quizzes = state.questionsData[subject][topic];
        
        Object.keys(quizzes).forEach(quizNumber => {
            const quiz = quizzes[quizNumber];
            const questionsCount = Array.isArray(quiz) ? quiz.length : 50;
            
            const card = createCard({
                type: 'topic-quiz',
                title: `Quiz ${quizNumber.replace('quiz', '')}`,
                subtitle: `${questionsCount} questions`,
                onClick: () => handleTopicQuizSelection(quizNumber, questionsCount)
            });
            
            cards.push(card);
        });
    } else {
        // If no quizzes found for this topic
        topicQuizContainer.innerHTML = `
            <div class="no-quizzes-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>No quizzes available for ${topic}</p>
            </div>
        `;
        return [];
    }
    
    return cards;
}

// =============================================
// QUIZ SELECTION HANDLERS
// =============================================

function handleRandomQuizSelection(quizNumber, questionsCount) {
    state.selectedQuiz = {
        subject: state.selectedSubject,
        type: 'random',
        quizNumber: quizNumber,
        questions: questionsCount,
        title: `${state.selectedSubject} - Random Quiz ${quizNumber.replace('quiz', '')}`
    };
    
    showQuizSetup();
}

function handleTopicQuizSelection(quizNumber, questionsCount) {
    state.selectedQuiz = {
        subject: state.selectedSubject,
        type: 'topic',
        topic: state.selectedTopic,
        quizNumber: quizNumber,
        questions: questionsCount,
        title: `${state.selectedSubject}: ${state.selectedTopic} - Quiz ${quizNumber.replace('quiz', '')}`
    };
    
    showQuizSetup();
}

// =============================================
// QUIZ SETUP
// =============================================

function showQuizSetup() {
    selectedQuizLabel.textContent = state.selectedQuiz.title;
    durationSelect.value = '0';
    openModal(setupModal);
}

function handleQuizSetup(e) {
    e.preventDefault();
    
    const duration = parseInt(durationSelect.value);
    
    state.quizSetup = {
        duration: duration,
        timestamp: new Date().toISOString()
    };
    
    state.currentQuiz = {
        id: Date.now(),
        subject: state.selectedQuiz.subject,
        type: state.selectedQuiz.type,
        topic: state.selectedQuiz.topic,
        quizNumber: state.selectedQuiz.quizNumber,
        questions: state.selectedQuiz.questions,
        isUnlocked: true
    };
    
    closeModal(setupModal);
    loadQuestionsForQuiz();
}

// =============================================
// CARD CREATION UTILITY
// =============================================

function createCard(options) {
    const {
        type,
        title,
        subtitle,
        onClick
    } = options;
    
    const card = document.createElement('div');
    card.className = 'quiz-card active';
    card.dataset.type = type;
    
    card.innerHTML = `
        <div class="quiz-card-header">
            <div class="quiz-subject">${title}</div>
            <div class="quiz-status status-available">
                Available
            </div>
        </div>
        <div class="quiz-details">${subtitle}</div>
        <div class="quiz-card-footer">
            <div class="quiz-questions"></div>
            <button class="quiz-action">
                Select
            </button>
        </div>
    `;
    
    card.addEventListener('click', onClick);
    
    const actionBtn = card.querySelector('.quiz-action');
    actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    
    return card;
}

// =============================================
// QUIZ FUNCTIONALITY
// =============================================

async function loadQuestionsForQuiz() {
    try {
        console.log(`📥 Loading questions...`);
        
        let questions = [];
        
        if (state.currentQuiz.type === 'random') {
            if (state.randomData[state.currentQuiz.subject] && 
                state.randomData[state.currentQuiz.subject][state.currentQuiz.quizNumber]) {
                questions = state.randomData[state.currentQuiz.subject][state.currentQuiz.quizNumber];
            }
        } else {
            if (state.questionsData[state.currentQuiz.subject] && 
                state.questionsData[state.currentQuiz.subject][state.currentQuiz.topic] &&
                state.questionsData[state.currentQuiz.subject][state.currentQuiz.topic][state.currentQuiz.quizNumber]) {
                questions = state.questionsData[state.currentQuiz.subject][state.currentQuiz.topic][state.currentQuiz.quizNumber];
            }
        }
        
        if (questions.length > 0) {
            state.questions = questions;
            console.log(`✓ Loaded ${state.questions.length} questions`);
        } else {
            console.log("No questions found, using default");
            state.questions = defaultQuestions;
        }
        
        showQuizScreen();
        
    } catch (error) {
        console.error("Error loading questions:", error);
        state.questions = defaultQuestions;
        showQuizScreen();
    }
}

function showQuizScreen() {
    hideAllPages();
    quizScreen.classList.remove('hidden');
    state.currentPage = 'quiz';
    initializeQuiz();
}

function initializeQuiz() {
    state.currentQuestionIndex = 0;
    state.userAnswers = {};
    
    quizSubjectTitle.textContent = state.currentQuiz.subject;
    
    if (state.quizSetup && state.quizSetup.duration > 0) {
        state.quizTimeLimit = state.quizSetup.duration * 60;
        state.timeRemaining = state.quizTimeLimit;
        startTimer();
    } else {
        state.quizTimeLimit = 0;
        quizTimer.textContent = "∞";
    }
    
    createQuestionGrid(state.questions.length);
    loadQuestion(0);
}

function createQuestionGrid(count) {
    questionGrid.innerHTML = '';
    const displayCount = Math.min(count, 50);
    
    for (let i = 1; i <= displayCount; i++) {
        const questionBox = document.createElement('div');
        questionBox.className = 'question-box unanswered';
        questionBox.textContent = i;
        questionBox.dataset.questionIndex = i - 1;
        
        questionBox.addEventListener('click', () => {
            loadQuestion(parseInt(questionBox.dataset.questionIndex));
        });
        
        questionGrid.appendChild(questionBox);
    }
}

function loadQuestion(index) {
    if (index < 0 || index >= state.questions.length) return;
    
    state.currentQuestionIndex = index;
    const question = state.questions[index];
    
    questionNumber.textContent = `Question ${index + 1} of ${state.questions.length}`;
    questionText.textContent = question.text;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        if (state.userAnswers[index] === optionIndex) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span>
            ${option}
        `;
        
        optionElement.addEventListener('click', () => selectOption(optionIndex));
        optionsContainer.appendChild(optionElement);
    });
    
    updateQuestionGrid();
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === state.questions.length - 1 ? 'Finish' : 'Next';
}

function selectOption(optionIndex) {
    const currentIndex = state.currentQuestionIndex;
    const question = state.questions[currentIndex];
    
    if (state.userAnswers[currentIndex] === optionIndex) {
        delete state.userAnswers[currentIndex];
        closeModal(explanationModal);
    } else {
        state.userAnswers[currentIndex] = optionIndex;
        const isCorrect = optionIndex === question.answer;
        
        showExplanationModal(
            isCorrect,
            question.explanation || 'No explanation available.',
            isCorrect ? null : question.options[question.answer]
        );
        
        showToast(isCorrect ? correctToast : incorrectToast, 
                 isCorrect ? "Correct! Check explanation." : "Incorrect. Check explanation.");
    }
    
    loadQuestion(currentIndex);
    updateQuestionGrid();
}

function showExplanationModal(isCorrect, explanation, correctAnswer = null) {
    if (isCorrect) {
        explanationTitle.innerHTML = '<i class="fas fa-check-circle"></i> Correct!';
        explanationTitle.className = 'modal-title correct';
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.className = 'result-icon correct';
        resultText.textContent = 'Excellent! Your answer is correct.';
    } else {
        explanationTitle.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect';
        explanationTitle.className = 'modal-title incorrect';
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        resultIcon.className = 'result-icon incorrect';
        resultText.textContent = 'Incorrect. Here\'s the right answer:';
        
        if (correctAnswer !== null) {
            explanation += `<br><br><strong>Correct Answer:</strong> ${correctAnswer}`;
        }
    }
    
    explanationText.innerHTML = explanation || 'No explanation available.';
    openModal(explanationModal);
}

function handleContinueAfterExplanation() {
    closeModal(explanationModal);
    
    const currentIndex = state.currentQuestionIndex;
    const isLastQuestion = currentIndex === state.questions.length - 1;
    
    if (isLastQuestion) {
        finishQuiz();
    } else {
        goToNextQuestion();
    }
}

function updateQuestionGrid() {
    const questionBoxes = questionGrid.querySelectorAll('.question-box');
    
    questionBoxes.forEach((box, index) => {
        box.classList.remove('current', 'answered', 'unanswered');
        
        if (index === state.currentQuestionIndex) {
            box.classList.add('current');
        } else if (state.userAnswers[index] !== undefined) {
            box.classList.add('answered');
        } else {
            box.classList.add('unanswered');
        }
    });
}

function goToPreviousQuestion() {
    if (state.currentQuestionIndex > 0) {
        loadQuestion(state.currentQuestionIndex - 1);
    }
}

function goToNextQuestion() {
    const currentIndex = state.currentQuestionIndex;
    const isLastQuestion = currentIndex === state.questions.length - 1;
    
    closeModal(explanationModal);
    
    if (isLastQuestion) {
        finishQuiz();
    } else {
        loadQuestion(currentIndex + 1);
    }
}

function finishQuiz() {
    const answeredCount = Object.keys(state.userAnswers).length;
    const totalQuestionsCount = state.questions.length;
    
    if (answeredCount < totalQuestionsCount) {
        showToast(unansweredToast, "You have unanswered questions!");
        return;
    }
    
    let correctCountValue = 0;
    for (let i = 0; i < totalQuestionsCount; i++) {
        if (state.userAnswers[i] === state.questions[i].answer) {
            correctCountValue++;
        }
    }
    
    const percentage = Math.round((correctCountValue / totalQuestionsCount) * 100);
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    scorePercentage.textContent = `${percentage}%`;
    correctCount.textContent = correctCountValue;
    totalQuestions.textContent = totalQuestionsCount;
    
    // Show banner ad in results modal
    showBannerAd();
    
    setTimeout(() => {
        openModal(resultsModal);
    }, 800);
}

function startTimer() {
    updateTimerDisplay();
    
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();
        
        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    
    quizTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    quizTimer.classList.remove('timer-warning', 'timer-danger');
    if (state.timeRemaining < 60) {
        quizTimer.classList.add('timer-danger');
    } else if (state.timeRemaining < 300) {
        quizTimer.classList.add('timer-warning');
    }
}

// =============================================
// SUBJECT SELECTION
// =============================================

function showSubjectModal() {
    openModal(subjectModal);
    populateSubjectList();
}

function populateSubjectList(filter = '') {
    subjectList.innerHTML = '';
    
    const filteredSubjects = subjects.filter(subject => 
        subject.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredSubjects.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.textContent = subject;
        item.addEventListener('click', () => selectSubject(subject));
        subjectList.appendChild(item);
    });
    
    if (filteredSubjects.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'search-item';
        noResults.textContent = 'No subjects found';
        noResults.style.textAlign = 'center';
        noResults.style.color = 'var(--gray)';
        subjectList.appendChild(noResults);
    }
}

function filterSubjects() {
    populateSubjectList(subjectSearch.value);
}

function selectSubject(subject) {
    state.selectedSubject = subject;
    closeModal(subjectModal);
    showQuizTypePage();
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showToast(toastElement, message) {
    const toastText = toastElement.querySelector('.toast-text');
    if (toastText) {
        toastText.textContent = message;
    }
    
    toastElement.classList.remove('hidden');
    toastElement.style.display = 'flex';
    
    setTimeout(() => {
        toastElement.classList.add('hidden');
        setTimeout(() => {
            toastElement.style.display = 'none';
        }, 300);
    }, 3000);
}

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // If it's the results modal, ensure ad is loaded
    if (modal.id === 'resultsModal') {
        setTimeout(() => {
            const placeholder = document.getElementById('adPlaceholder');
            if (placeholder && placeholder.innerHTML.trim() === '') {
                console.log("⚠️ Banner ad didn't load, retrying...");
                loadFreshBannerAd();
            }
        }, 500);
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =============================================
// DEBUG FUNCTION - Check if ads are loading
// =============================================

function debugAds() {
    console.log('🔍 DEBUGGING ADS...');
    console.log('Native ad script loaded:', nativeAdScriptLoaded);
    console.log('Native ad containers:', document.querySelectorAll('.native-ad-container').length);
    console.log('Banner ad container:', document.getElementById('adPlaceholder')?.innerHTML ? 'EXISTS' : 'NOT FOUND');
    
    // Check for Adsterra scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.src.includes('effectivegatecpm') || script.src.includes('highperformanceformat')) {
            console.log('Ad script found:', script.src);
        }
    });
}

// Run debug after page loads
setTimeout(debugAds, 3000);

// =============================================
// INITIALIZE APP
// =============================================

window.addEventListener('DOMContentLoaded', initApp);

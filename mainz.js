// =============================================
// AD MANAGEMENT SYSTEM
// =============================================

let lastAdRefreshTime = 0;
const AD_COOLDOWN = 30000; // 30 seconds minimum between refreshes

// Function to load a fresh ad
function loadFreshAd() {
    console.log("🔄 Loading fresh ad for new impression...");
    
    const placeholder = document.getElementById('adPlaceholder');
    if (!placeholder) {
        console.error("❌ Ad placeholder not found");
        return;
    }
    
    // Clear any existing content
    placeholder.innerHTML = '';
    
    // Create new ad script
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.textContent = `
        atOptions = {
            'key' : '49f2a402e67de18641783843fe0fa8f0',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
        };
    `;
    
    // Create second script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/49f2a402e67de18641783843fe0fa8f0/invoke.js';
    
    // Add to placeholder
    placeholder.appendChild(adScript);
    placeholder.appendChild(invokeScript);
    
    // Update last refresh time
    lastAdRefreshTime = Date.now();
    
    console.log("✅ Fresh ad loaded - WILL count as new impression");
}

// Function to check if we should show a new ad
function shouldShowNewAd() {
    const now = Date.now();
    const timeSinceLastAd = now - lastAdRefreshTime;
    
    // If it's been more than cooldown time, show new ad
    if (timeSinceLastAd > AD_COOLDOWN) {
        console.log(`✅ Ready for new ad (${Math.round(timeSinceLastAd/1000)}s since last)`);
        return true;
    }
    
    // Otherwise, show existing ad
    console.log(`⏳ Ad cooldown: ${Math.round((AD_COOLDOWN - timeSinceLastAd)/1000)}s remaining`);
    return false;
}

// Function to show ad (smart refresh)
function showAd() {
    if (shouldShowNewAd()) {
        loadFreshAd();
    } else {
        console.log("📦 Using existing ad (within cooldown period)");
        // Ad is already loaded from previous quiz
    }
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
    randomData: {},      // For random quizzes
    questionsData: {}    // For topic-based quizzes
};

// Sample Subjects
const subjects = [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Economics", "Geography", "History", "Government", "Commerce",
    "Accounting", "Literature in English", "Christian Religious Studies",
    "Islamic Religious Studies", "Further Mathematics", "French", "Agricultural Science"
];

// Default sample questions (fallback if JSON fails)
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

// Modal Elements
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

// New screens (DUAL QUIZ SYSTEM)
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
        console.log("✓ Loading animation complete (transitionend event)");
        
        // Hide the progress bar
        waveProgress.style.display = 'none';
        
        // Show Continue button
        continueBtn.classList.remove('hidden');
        continueBtn.style.display = 'flex';
        console.log("✓ Showing Continue button");
    });
    
    // Start loading animation after a short delay
    setTimeout(() => {
        waveProgress.classList.add('complete');
        console.log("Loading animation started...");
    }, 500);

    // Set up event listeners
    setupEventListeners();
    
    console.log("✓ Event listeners initialized");
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
    
    // New navigation (DUAL QUIZ SYSTEM)
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
    console.log("🎯 User clicked Continue");
    
    // Show loading state IN THE BUTTON ONLY
    continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    continueBtn.disabled = true;
    
    // Load quiz data (DUAL QUIZ SYSTEM)
    loadQuizData();
    
    // Go to homepage after short delay
    setTimeout(() => {
        hideLoadingScreen();
        showHomePage();
        
        // Reset button state
        continueBtn.innerHTML = '<i class="fas fa-play-circle"></i> Continue';
        continueBtn.disabled = false;
        
        console.log("✅ Redirected to homepage");
    }, 1000);
}

// DUAL QUIZ SYSTEM: Load both JSON files
async function loadQuizData() {
    try {
        console.log("📥 Loading quiz data (dual system)...");
        
        // Load random.json for random quizzes
        const randomResponse = await fetch('random.json');
        if (randomResponse.ok) {
            state.randomData = await randomResponse.json();
            console.log("✓ Loaded random.json for random quizzes");
        } else {
            console.error("Failed to load random.json");
            state.randomData = {};
        }
        
        // Load questions.json for topic-based quizzes
        const questionsResponse = await fetch('questions.json');
        if (questionsResponse.ok) {
            state.questionsData = await questionsResponse.json();
            console.log("✓ Loaded questions.json for topic-based quizzes");
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
    console.log("🎬 Hiding loading screen...");
    
    // Fade out the entire loading screen
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
    console.log("✅ Homepage visible");
}

function goToHomePage() {
    showHomePage();
}

// NEW NAVIGATION: Go back to quiz type selection
function goToQuizTypeSelection() {
    showQuizTypePage();
}

// =============================================
// DUAL QUIZ SYSTEM: QUIZ TYPE SELECTION PAGE
// =============================================

async function showQuizTypePage() {
    hideAllPages();
    quizTypePage.classList.remove('hidden');
    state.currentPage = 'quizType';
    
    // Update page title
    quizTypeTitle.textContent = `${state.selectedSubject} Quizzes`;
    
    // Set default quiz type
    quizTypeSelect.value = 'random';
    state.quizType = 'random';
    
    // Reload data if empty
    if (Object.keys(state.randomData).length === 0 || Object.keys(state.questionsData).length === 0) {
        await loadQuizData();
    }
    
    // Display appropriate cards
    displayQuizTypeCards();
    
    console.log("📚 Showing quiz type selection page");
}

function handleQuizTypeChange() {
    state.quizType = quizTypeSelect.value;
    console.log(`🔄 Quiz type changed to: ${state.quizType}`);
    displayQuizTypeCards();
}

async function displayQuizTypeCards() {
    const cardElements = [];
    
    if (state.quizType === 'random') {
        // Show random quiz cards
        console.log(`🃏 Displaying random quizzes for ${state.selectedSubject}`);
        cardElements.push(...await createRandomQuizCards());
    } else {
        // Show topic-based cards
        console.log(`📘 Displaying topics for ${state.selectedSubject}`);
        cardElements.push(...await createTopicCards());
    }
    
    // Clear and display cards
    cardsContainer.innerHTML = '';
    cardElements.forEach(card => cardsContainer.appendChild(card));
}

async function createRandomQuizCards() {
    const cards = [];
    const subject = state.selectedSubject;
    
    if (state.randomData[subject]) {
        const quizzes = state.randomData[subject];
        const quizNumbers = Object.keys(quizzes);
        
        console.log(`🎯 Found ${quizNumbers.length} random quizzes for ${subject}`);
        
        quizNumbers.forEach(quizNumber => {
            const quiz = quizzes[quizNumber];
            const questionsCount = Array.isArray(quiz) ? quiz.length : 50;
            
            const card = createCard({
                type: 'random',
                title: `Random Quiz ${quizNumber.replace('quiz', '')}`,
                subtitle: `${questionsCount} random questions`,
                onClick: () => handleRandomQuizSelection(quizNumber, questionsCount)
            });
            
            cards.push(card);
        });
    } else {
        // If no random quizzes found
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
            console.log(`📚 Found ${topics.length} topics for ${subject}`);
            
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
// DUAL QUIZ SYSTEM: TOPIC QUIZ SELECTION PAGE
// =============================================

function handleTopicSelection(topic) {
    console.log(`🎯 Topic selected: ${topic}`);
    state.selectedTopic = topic;
    showTopicQuizPage();
}

function showTopicQuizPage() {
    hideAllPages();
    topicQuizPage.classList.remove('hidden');
    state.currentPage = 'topicQuiz';
    
    // Update page title
    topicQuizTitle.textContent = `${state.selectedSubject}: ${state.selectedTopic}`;
    
    // Display quiz cards for this topic
    displayTopicQuizCards();
    
    console.log(`📖 Showing quizzes for topic: ${state.selectedTopic}`);
}

function displayTopicQuizCards() {
    const cardElements = createTopicQuizCards();
    
    // Clear and display cards
    topicQuizContainer.innerHTML = '';
    cardElements.forEach(card => topicQuizContainer.appendChild(card));
}

function createTopicQuizCards() {
    const cards = [];
    const subject = state.selectedSubject;
    const topic = state.selectedTopic;
    
    if (state.questionsData[subject] && state.questionsData[subject][topic]) {
        const quizzes = state.questionsData[subject][topic];
        const quizNumbers = Object.keys(quizzes);
        
        console.log(`🎯 Found ${quizNumbers.length} quizzes for ${topic}`);
        
        quizNumbers.forEach(quizNumber => {
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
// QUIZ SELECTION HANDLERS (DUAL SYSTEM)
// =============================================

function handleRandomQuizSelection(quizNumber, questionsCount) {
    console.log(`🎲 Random quiz selected: ${quizNumber} (${questionsCount} questions)`);
    
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
    console.log(`📘 Topic quiz selected: ${quizNumber} (${questionsCount} questions)`);
    
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
    console.log("⚙️ Showing quiz setup for:", state.selectedQuiz.title);
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
    
    console.log("✅ Quiz setup complete:", state.currentQuiz);
    
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
        console.log(`📥 Loading questions for ${state.currentQuiz.type} quiz...`);
        
        let questions = [];
        
        if (state.currentQuiz.type === 'random') {
            // Load from random.json
            if (state.randomData[state.currentQuiz.subject] && 
                state.randomData[state.currentQuiz.subject][state.currentQuiz.quizNumber]) {
                questions = state.randomData[state.currentQuiz.subject][state.currentQuiz.quizNumber];
            }
        } else {
            // Load from questions.json
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
    
    // Initialize quiz
    initializeQuiz();
    console.log("📝 Showing quiz screen");
}

function initializeQuiz() {
    // Reset state
    state.currentQuestionIndex = 0;
    state.userAnswers = {};
    
    // Set quiz subject title
    quizSubjectTitle.textContent = state.currentQuiz.subject;
    
    // Set time limit if applicable
    if (state.quizSetup && state.quizSetup.duration > 0) {
        state.quizTimeLimit = state.quizSetup.duration * 60;
        state.timeRemaining = state.quizTimeLimit;
        startTimer();
    } else {
        state.quizTimeLimit = 0;
        quizTimer.textContent = "∞";
    }
    
    // Create question grid
    createQuestionGrid(state.questions.length);
    
    // Load first question
    loadQuestion(0);
}

function createQuestionGrid(count) {
    questionGrid.innerHTML = '';
    
    // Show max 50 questions, or actual count if less
    const displayCount = Math.min(count, 50);
    
    for (let i = 1; i <= displayCount; i++) {
        const questionBox = document.createElement('div');
        questionBox.className = 'question-box unanswered';
        questionBox.textContent = i;
        questionBox.dataset.questionIndex = i - 1;
        
        questionBox.addEventListener('click', () => {
            const index = parseInt(questionBox.dataset.questionIndex);
            loadQuestion(index);
        });
        
        questionGrid.appendChild(questionBox);
    }
}

function loadQuestion(index) {
    if (index < 0 || index >= state.questions.length) return;
    
    state.currentQuestionIndex = index;
    const question = state.questions[index];
    
    // Update question number display
    questionNumber.textContent = `Question ${index + 1} of ${state.questions.length}`;
    
    // Update question text
    questionText.textContent = question.text;
    
    // Update options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        // Check if this option is selected
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
    
    // Update question grid highlighting
    updateQuestionGrid();
    
    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === state.questions.length - 1 ? 'Finish' : 'Next';
}

function selectOption(optionIndex) {
    const currentIndex = state.currentQuestionIndex;
    const question = state.questions[currentIndex];
    
    // Toggle selection if clicking the same option
    if (state.userAnswers[currentIndex] === optionIndex) {
        delete state.userAnswers[currentIndex];
        // Close explanation modal if open
        closeModal(explanationModal);
    } else {
        state.userAnswers[currentIndex] = optionIndex;
        
        // Check if correct
        const isCorrect = optionIndex === question.answer;
        
        // Show explanation modal
        showExplanationModal(
            isCorrect,
            question.explanation || 'No explanation available.',
            isCorrect ? null : question.options[question.answer]
        );
        
        // Show toast
        if (isCorrect) {
            showToast(correctToast, "Correct! Check explanation.");
        } else {
            showToast(incorrectToast, "Incorrect. Check explanation.");
        }
    }
    
    // Reload question to update UI
    loadQuestion(currentIndex);
    
    // Update question grid
    updateQuestionGrid();
}

function showExplanationModal(isCorrect, explanation, correctAnswer = null) {
    // Update modal content based on correctness
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
        
        // Add correct answer to explanation if wrong
        if (correctAnswer !== null) {
            explanation += `<br><br><strong>Correct Answer:</strong> ${correctAnswer}`;
        }
    }
    
    // Set explanation text
    explanationText.innerHTML = explanation || 'No explanation available.';
    
    // Show modal
    openModal(explanationModal);
}

function handleContinueAfterExplanation() {
    closeModal(explanationModal);
    
    // Auto-go to next question
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
    
    // Close explanation modal if open
    closeModal(explanationModal);
    
    if (isLastQuestion) {
        // Finish quiz
        finishQuiz();
    } else {
        loadQuestion(currentIndex + 1);
    }
}

function finishQuiz() {
    // Check if all questions are answered
    const answeredCount = Object.keys(state.userAnswers).length;
    const totalQuestionsCount = state.questions.length;
    
    if (answeredCount < totalQuestionsCount) {
        showToast(unansweredToast, "You have unanswered questions!");
        return;
    }
    
    // Calculate score
    let correctCountValue = 0;
    for (let i = 0; i < totalQuestionsCount; i++) {
        if (state.userAnswers[i] === state.questions[i].answer) {
            correctCountValue++;
        }
    }
    
    const percentage = Math.round((correctCountValue / totalQuestionsCount) * 100);
    
    // Stop timer if running
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    // Update results modal
    scorePercentage.textContent = `${percentage}%`;
    correctCount.textContent = correctCountValue;
    totalQuestions.textContent = totalQuestionsCount;
    
    // SHOW AD (with smart refresh)
    showAd();
    
    // Show results modal
    setTimeout(() => {
        openModal(resultsModal);
        console.log("🎉 Quiz completed! Score:", percentage + "%");
        console.log(`📊 Score: ${percentage}% (${correctCountValue}/${totalQuestionsCount})`);
    }, 800); // Small delay to let ad load
}

function startTimer() {
    updateTimerDisplay();
    
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();
        
        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            // Auto-finish quiz when time is up
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    
    quizTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add warning styles when time is low
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
    console.log("📚 Showing subject selection modal");
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
    console.log(`🎯 Subject selected: ${subject}`);
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
        // Give ad a moment to appear
        setTimeout(() => {
            const placeholder = document.getElementById('adPlaceholder');
            if (placeholder && placeholder.innerHTML.trim() === '') {
                console.log("⚠️ Ad didn't load, retrying...");
                loadFreshAd();
            }
        }, 500);
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =============================================
// INITIALIZE APP
// =============================================

window.addEventListener('DOMContentLoaded', initApp);
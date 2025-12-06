// =============================================
// AD MANAGEMENT SYSTEM
// =============================================

let lastAdRefreshTime = 0;
const AD_COOLDOWN = 30000; // 30 seconds minimum between ad refreshes

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
            'height' : 250,
            'width' : 300,
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
    hasFullAccess: true, // All quizzes unlocked
    currentPage: 'loading',
    selectedSubject: null,
    selectedQuizType: 'random',
    selectedTopic: null,
    quizSetup: null,
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    quizTimeLimit: 0,
    timeRemaining: 0,
    timerInterval: null,
    questions: [], // Will hold questions from JSON
    randomQuizData: null, // Will hold random.json data
    topicQuizData: null // Will hold questions.json data
};

// Subjects with icons
const subjects = [
    { name: "Mathematics", icon: "fas fa-calculator" },
    { name: "English Language", icon: "fas fa-book" },
    { name: "Physics", icon: "fas fa-atom" },
    { name: "Chemistry", icon: "fas fa-flask" },
    { name: "Biology", icon: "fas fa-dna" },
    { name: "Economics", icon: "fas fa-chart-line" },
    { name: "Geography", icon: "fas fa-globe-americas" },
    { name: "History", icon: "fas fa-landmark" },
    { name: "Government", icon: "fas fa-balance-scale" },
    { name: "Commerce", icon: "fas fa-shopping-cart" },
    { name: "Accounting", icon: "fas fa-calculator" },
    { name: "Literature in English", icon: "fas fa-pen-fancy" },
    { name: "Christian Religious Studies", icon: "fas fa-cross" },
    { name: "Islamic Religious Studies", icon: "fas fa-star-and-crescent" },
    { name: "Further Mathematics", icon: "fas fa-square-root-alt" },
    { name: "French", icon: "fas fa-language" },
    { name: "Agricultural Science", icon: "fas fa-tractor" }
];

// Topic-based subjects (from questions.json structure)
const topicBasedSubjects = ["Mathematics", "Physics"];

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

// Loading Screen
const loadingScreen = document.getElementById('loadingScreen');
const waveProgress = document.getElementById('waveProgress');
const continueBtn = document.getElementById('continueBtn');

// Header
const mainHeader = document.getElementById('mainHeader');
const homeNavBtn = document.getElementById('homeNavBtn');

// Pages
const homePage = document.getElementById('homePage');
const subjectSelectionPage = document.getElementById('subjectSelectionPage');
const quizTypePage = document.getElementById('quizTypePage');
const topicQuizPage = document.getElementById('topicQuizPage');
const quizScreen = document.getElementById('quizScreen');

// Home Page
const takeQuizBtn = document.getElementById('takeQuizBtn');

// Subject Selection Page
const subjectSearchInput = document.getElementById('subjectSearchInput');
const subjectList = document.getElementById('subjectList');

// Quiz Type Page
const backToSubjectBtn = document.getElementById('backToSubjectBtn');
const quizTypeSubject = document.getElementById('quizTypeSubject');
const quizTypeSelect = document.getElementById('quizTypeSelect');
const randomQuizGrid = document.getElementById('randomQuizGrid');
const topicGrid = document.getElementById('topicGrid');
const noTopicsMessage = document.getElementById('noTopicsMessage');

// Topic Quiz Page
const backToTopicsBtn = document.getElementById('backToTopicsBtn');
const topicTitle = document.getElementById('topicTitle');
const topicQuizGrid = document.getElementById('topicQuizGrid');

// Quiz Screen
const quizSubjectTitle = document.getElementById('quizSubjectTitle');
const quizTimer = document.getElementById('quizTimer');
const questionGrid = document.getElementById('questionGrid');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Modals
const setupModal = document.getElementById('setupModal');
const selectedQuizLabel = document.getElementById('selectedQuizLabel');
const durationSelect = document.getElementById('durationSelect');
const quizSetupForm = document.getElementById('quizSetupForm');
const closeSetupModal = document.getElementById('closeSetupModal');

const explanationModal = document.getElementById('explanationModal');
const closeExplanationModal = document.getElementById('closeExplanationModal');
const explanationTitle = document.getElementById('explanationTitle');
const resultIcon = document.getElementById('resultIcon');
const resultText = document.getElementById('resultText');
const explanationText = document.getElementById('explanationText');
const continueQuizBtn = document.getElementById('continueQuizBtn');

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

// =============================================
// APP INITIALIZATION
// =============================================

function initApp() {
    console.log("🚀 A Plus Buddy Initializing...");
    
    // Listen for when the loading animation completes
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

// Set up all event listeners
function setupEventListeners() {
    // Continue Button
    continueBtn.addEventListener('click', handleContinue);
    
    // Home Navigation
    homeNavBtn.addEventListener('click', goToHomePage);
    
    // Home page
    takeQuizBtn.addEventListener('click', showSubjectSelectionPage);
    
    // Subject Selection Page
    subjectSearchInput.addEventListener('input', filterSubjects);
    
    // Quiz Type Page
    backToSubjectBtn.addEventListener('click', goToSubjectSelectionPage);
    quizTypeSelect.addEventListener('change', handleQuizTypeChange);
    
    // Topic Quiz Page
    backToTopicsBtn.addEventListener('click', goToQuizTypePage);
    
    // Setup Modal
    closeSetupModal.addEventListener('click', () => closeModal(setupModal));
    quizSetupForm.addEventListener('submit', handleQuizSetup);
    
    // Explanation Modal
    closeExplanationModal.addEventListener('click', () => closeModal(explanationModal));
    continueQuizBtn.addEventListener('click', handleContinueAfterExplanation);
    
    // Results Modal
    closeResultsModal.addEventListener('click', () => closeModal(resultsModal));
    backToQuizzesBtn.addEventListener('click', () => {
        closeModal(resultsModal);
        // Go back to appropriate page based on quiz type
        if (state.selectedTopic) {
            goToTopicQuizPage();
        } else {
            goToQuizTypePage();
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
            if (e.target === modal) {
                closeModal(modal);
            }
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
    
    // Load quiz data
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

async function loadQuizData() {
    try {
        console.log("📥 Loading quiz data...");
        
        // Load random quiz data
        const randomResponse = await fetch('random.json');
        if (randomResponse.ok) {
            state.randomQuizData = await randomResponse.json();
            console.log("✓ Loaded random.json", Object.keys(state.randomQuizData));
        } else {
            console.log("random.json not found");
            state.randomQuizData = null;
        }
        
        // Load topic-based quiz data
        const topicResponse = await fetch('questions.json');
        if (topicResponse.ok) {
            state.topicQuizData = await topicResponse.json();
            console.log("✓ Loaded questions.json", Object.keys(state.topicQuizData));
        } else {
            console.log("questions.json not found");
            state.topicQuizData = null;
        }
        
    } catch (error) {
        console.error("Error loading quiz data:", error);
        state.randomQuizData = null;
        state.topicQuizData = null;
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
// PAGE NAVIGATION FUNCTIONS
// =============================================

function hideAllPages() {
    homePage.classList.add('hidden');
    subjectSelectionPage.classList.add('hidden');
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
    // Reset state
    state.selectedSubject = null;
    state.selectedTopic = null;
    state.selectedQuizType = 'random';
    
    hideAllPages();
    homePage.classList.remove('hidden');
    state.currentPage = 'home';
    console.log("🏠 Navigated to homepage");
}

function showSubjectSelectionPage() {
    hideAllPages();
    subjectSelectionPage.classList.remove('hidden');
    state.currentPage = 'subjectSelection';
    populateSubjectList();
    console.log("📚 Showing subject selection page");
}

function goToSubjectSelectionPage() {
    hideAllPages();
    subjectSelectionPage.classList.remove('hidden');
    state.currentPage = 'subjectSelection';
    console.log("← Back to subject selection");
}

function showQuizTypePage() {
    hideAllPages();
    quizTypePage.classList.remove('hidden');
    state.currentPage = 'quizType';
    
    // Set the subject name
    quizTypeSubject.textContent = state.selectedSubject;
    
    // Reset selected topic
    state.selectedTopic = null;
    
    // Load quizzes based on current type
    handleQuizTypeChange();
    
    console.log("🎲 Showing quiz type selection page");
}

function goToQuizTypePage() {
    hideAllPages();
    quizTypePage.classList.remove('hidden');
    state.currentPage = 'quizType';
    state.selectedTopic = null;
    console.log("← Back to quiz type selection");
}

function showTopicQuizPage() {
    hideAllPages();
    topicQuizPage.classList.remove('hidden');
    state.currentPage = 'topicQuiz';
    
    // Set the title
    topicTitle.textContent = `${state.selectedSubject}: ${state.selectedTopic}`;
    
    // Load quizzes for this topic
    loadTopicQuizzes();
    
    console.log("📖 Showing topic quiz page");
}

function goToTopicQuizPage() {
    hideAllPages();
    topicQuizPage.classList.remove('hidden');
    state.currentPage = 'topicQuiz';
    console.log("↻ Returned to topic quiz page");
}

// =============================================
// SUBJECT MANAGEMENT
// =============================================

function populateSubjectList(filter = '') {
    subjectList.innerHTML = '';
    
    const filteredSubjects = subjects.filter(subject => 
        subject.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredSubjects.forEach(subject => {
        const item = document.createElement('div');
        item.className = 'subject-item';
        item.innerHTML = `
            <i class="${subject.icon}"></i>
            <div class="subject-name">${subject.name}</div>
        `;
        item.addEventListener('click', () => selectSubject(subject.name));
        subjectList.appendChild(item);
    });
    
    if (filteredSubjects.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'subject-item';
        noResults.innerHTML = '<div class="subject-name">No subjects found</div>';
        noResults.style.textAlign = 'center';
        noResults.style.color = 'var(--gray)';
        subjectList.appendChild(noResults);
    }
}

function filterSubjects() {
    populateSubjectList(subjectSearchInput.value);
}

async function selectSubject(subject) {
    console.log(`🎯 Selected subject: ${subject}`);
    
    state.selectedSubject = subject;
    
    // Check if subject has topic-based quizzes
    const hasTopicQuizzes = state.topicQuizData && state.topicQuizData[subject];
    
    // If no topic-based quizzes, disable topic option
    if (!hasTopicQuizzes) {
        quizTypeSelect.innerHTML = `
            <option value="random">Random Quiz</option>
            <option value="topic" disabled>Topic-Based Quiz (Not Available)</option>
        `;
        state.selectedQuizType = 'random';
    } else {
        quizTypeSelect.innerHTML = `
            <option value="random">Random Quiz</option>
            <option value="topic">Topic-Based Quiz</option>
        `;
    }
    
    // Go to quiz type selection page
    showQuizTypePage();
}

// =============================================
// QUIZ TYPE MANAGEMENT
// =============================================

function handleQuizTypeChange() {
    const quizType = quizTypeSelect.value;
    state.selectedQuizType = quizType;
    
    console.log(`🔄 Quiz type changed to: ${quizType}`);
    
    if (quizType === 'random') {
        // Show random quizzes
        topicGrid.classList.add('hidden');
        noTopicsMessage.classList.add('hidden');
        randomQuizGrid.classList.remove('hidden');
        loadRandomQuizzes();
    } else {
        // Show topic-based quizzes
        randomQuizGrid.classList.add('hidden');
        
        // Check if subject has topics
        if (state.topicQuizData && state.topicQuizData[state.selectedSubject]) {
            topicGrid.classList.remove('hidden');
            noTopicsMessage.classList.add('hidden');
            loadTopics();
        } else {
            topicGrid.classList.add('hidden');
            noTopicsMessage.classList.remove('hidden');
        }
    }
}

function loadRandomQuizzes() {
    randomQuizGrid.innerHTML = '';
    
    if (!state.randomQuizData || !state.randomQuizData[state.selectedSubject]) {
        // No random quizzes for this subject
        const noQuizzes = document.createElement('div');
        noQuizzes.className = 'quiz-card';
        noQuizzes.innerHTML = `
            <div class="quiz-card-header">
                <div class="quiz-subject">No Random Quizzes</div>
            </div>
            <div class="quiz-details">No random quizzes available for this subject.</div>
        `;
        randomQuizGrid.appendChild(noQuizzes);
        return;
    }
    
    // Get quizzes for this subject from random.json
    const subjectQuizzes = state.randomQuizData[state.selectedSubject];
    
    Object.keys(subjectQuizzes).forEach((quizKey, index) => {
        const quizData = subjectQuizzes[quizKey];
        const questionCount = quizData.length;
        
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
            <div class="quiz-card-header">
                <div class="quiz-subject">${state.selectedSubject} - Random Quiz ${index + 1}</div>
                <div class="quiz-status status-available">Available</div>
            </div>
            <div class="quiz-details">${questionCount} questions</div>
            <div class="quiz-card-footer">
                <div class="quiz-questions">${questionCount} questions</div>
                <button class="quiz-action" data-quiz-key="${quizKey}">
                    Start Quiz
                </button>
            </div>
        `;
        
        randomQuizGrid.appendChild(quizCard);
        
        const quizActionBtn = quizCard.querySelector('.quiz-action');
        quizActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRandomQuizSelection(quizKey, quizData);
        });
    });
}

function loadTopics() {
    topicGrid.innerHTML = '';
    
    if (!state.topicQuizData || !state.topicQuizData[state.selectedSubject]) {
        return;
    }
    
    const topics = state.topicQuizData[state.selectedSubject];
    
    Object.keys(topics).forEach(topicName => {
        const topicQuizzes = topics[topicName];
        let totalQuestions = 0;
        
        // Calculate total questions across all quizzes for this topic
        Object.values(topicQuizzes).forEach(quiz => {
            totalQuestions += quiz.length;
        });
        
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.innerHTML = `
            <i class="fas fa-folder topic-icon"></i>
            <div class="topic-name">${topicName}</div>
            <div class="topic-count">${Object.keys(topicQuizzes).length} quizzes • ${totalQuestions} questions</div>
        `;
        topicCard.addEventListener('click', () => selectTopic(topicName));
        
        topicGrid.appendChild(topicCard);
    });
}

function selectTopic(topic) {
    console.log(`🎯 Selected topic: ${topic}`);
    state.selectedTopic = topic;
    showTopicQuizPage();
}

function loadTopicQuizzes() {
    topicQuizGrid.innerHTML = '';
    
    if (!state.topicQuizData || 
        !state.topicQuizData[state.selectedSubject] || 
        !state.topicQuizData[state.selectedSubject][state.selectedTopic]) {
        
        const noQuizzes = document.createElement('div');
        noQuizzes.className = 'quiz-card';
        noQuizzes.innerHTML = `
            <div class="quiz-card-header">
                <div class="quiz-subject">No Quizzes Available</div>
            </div>
            <div class="quiz-details">No quizzes available for this topic.</div>
        `;
        topicQuizGrid.appendChild(noQuizzes);
        return;
    }
    
    const topicQuizzes = state.topicQuizData[state.selectedSubject][state.selectedTopic];
    
    Object.keys(topicQuizzes).forEach((quizKey, index) => {
        const quizData = topicQuizzes[quizKey];
        const questionCount = quizData.length;
        
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
            <div class="quiz-card-header">
                <div class="quiz-subject">${state.selectedSubject}: ${state.selectedTopic} - Quiz ${index + 1}</div>
                <div class="quiz-status status-available">Available</div>
            </div>
            <div class="quiz-details">${questionCount} questions</div>
            <div class="quiz-card-footer">
                <div class="quiz-questions">${questionCount} questions</div>
                <button class="quiz-action" data-quiz-key="${quizKey}">
                    Start Quiz
                </button>
            </div>
        `;
        
        topicQuizGrid.appendChild(quizCard);
        
        const quizActionBtn = quizCard.querySelector('.quiz-action');
        quizActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleTopicQuizSelection(quizKey, quizData);
        });
    });
}

// =============================================
// QUIZ SELECTION AND SETUP
// =============================================

function handleRandomQuizSelection(quizKey, quizData) {
    console.log(`🎯 Selected random quiz: ${quizKey}`);
    
    state.currentQuiz = {
        type: 'random',
        subject: state.selectedSubject,
        quizKey: quizKey,
        data: quizData
    };
    
    // Show quiz setup modal
    showQuizSetupModal();
}

function handleTopicQuizSelection(quizKey, quizData) {
    console.log(`🎯 Selected topic quiz: ${quizKey}`);
    
    state.currentQuiz = {
        type: 'topic',
        subject: state.selectedSubject,
        topic: state.selectedTopic,
        quizKey: quizKey,
        data: quizData
    };
    
    // Show quiz setup modal
    showQuizSetupModal();
}

function showQuizSetupModal() {
    // Update modal label based on quiz type
    let quizLabel = '';
    if (state.currentQuiz.type === 'random') {
        quizLabel = `${state.currentQuiz.subject} - Random Quiz`;
    } else {
        quizLabel = `${state.currentQuiz.subject}: ${state.currentQuiz.topic} - Quiz`;
    }
    
    // Add quiz number if available
    const quizMatch = state.currentQuiz.quizKey.match(/\d+/);
    if (quizMatch) {
        quizLabel += ` ${quizMatch[0]}`;
    }
    
    selectedQuizLabel.textContent = `Quiz: ${quizLabel}`;
    
    // Open modal
    openModal(setupModal);
}

function handleQuizSetup(e) {
    e.preventDefault();
    
    const duration = parseInt(durationSelect.value);
    
    // Save quiz setup
    state.quizSetup = {
        duration: duration,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('aPlusBuddyQuizSetup', JSON.stringify(state.quizSetup));
    
    // Close setup modal
    closeModal(setupModal);
    
    // Load and start the quiz
    loadQuestionsForQuiz();
}

// =============================================
// QUIZ EXECUTION
// =============================================

async function loadQuestionsForQuiz() {
    try {
        console.log(`📥 Loading questions...`);
        
        // Use the quiz data from currentQuiz
        if (state.currentQuiz && state.currentQuiz.data) {
            state.questions = state.currentQuiz.data;
            console.log(`✓ Loaded ${state.questions.length} questions`);
        } else {
            console.log("No questions found, using default");
            state.questions = defaultQuestions;
        }
        
        // Show quiz screen
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
    let quizTitle = '';
    if (state.currentQuiz.type === 'random') {
        quizTitle = state.currentQuiz.subject;
    } else {
        quizTitle = `${state.currentQuiz.subject}: ${state.currentQuiz.topic}`;
    }
    quizSubjectTitle.textContent = quizTitle;
    
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
        // Check if current question is answered
        const hasAnswer = state.userAnswers[currentIndex] !== undefined;
        
        if (hasAnswer) {
            // Go to next question without delay
            loadQuestion(currentIndex + 1);
        } else {
            // Just go to next question
            loadQuestion(currentIndex + 1);
        }
    }
}

// =============================================
// QUIZ COMPLETION AND RESULTS
// =============================================

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
        console.log("🎉 Quiz completed! Fresh ad displayed.");
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
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
    quizSetup: null,
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    quizTimeLimit: 0,
    timeRemaining: 0,
    timerInterval: null,
    questions: [], // Will hold questions from JSON
    allQuizzes: [] // Will hold quiz data
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
const quizSelectionPage = document.getElementById('quizSelectionPage');
const pageTitle = document.getElementById('pageTitle');
const quizGrid = document.getElementById('quizGrid');
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
const selectedSubjectLabel = document.getElementById('selectedSubjectLabel');
const topicSelect = document.getElementById('topicSelect');
const quizNumberSelect = document.getElementById('quizNumberSelect');
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
    takeQuizBtn.addEventListener('click', showSubjectModal);
    
    // Subject Modal
    closeSubjectModal.addEventListener('click', () => closeModal(subjectModal));
    subjectSearch.addEventListener('input', filterSubjects);
    
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
        showQuizSelectionPage();
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
        
        // Try to load from questions.json
        const response = await fetch('questions.json');
        
        if (response.ok) {
            const data = await response.json();
            console.log("✓ Loaded questions.json", Object.keys(data));
            
            // Process the data to create quiz list
            state.allQuizzes = processQuizData(data);
            console.log("✓ Processed quizzes:", state.allQuizzes.length);
        } else {
            console.log("questions.json not found, using default data");
            state.allQuizzes = createDefaultQuizzes();
        }
        
    } catch (error) {
        console.error("Error loading quiz data:", error);
        state.allQuizzes = createDefaultQuizzes();
    }
}

function processQuizData(data) {
    const quizzes = [];
    let quizId = 1;
    
    // Process each subject in the JSON
    for (const [subject, topics] of Object.entries(data)) {
        const isTopicBased = ["Mathematics", "Physics", "Chemistry", "Biology"].includes(subject);
        
        if (isTopicBased) {
            // Topic-based subjects: Show each topic separately
            for (const [topic, quizGroups] of Object.entries(topics)) {
                for (const [quizNumber, questions] of Object.entries(quizGroups)) {
                    quizzes.push({
                        id: quizId++,
                        subject: subject,
                        topic: topic,
                        quizNumber: quizNumber,
                        questions: questions.length,
                        isUnlocked: true
                    });
                }
            }
        } else {
            // Non-topic subjects: Show as "All Topics"
            if (topics["Default"]) {
                for (const [quizNumber, questions] of Object.entries(topics["Default"])) {
                    quizzes.push({
                        id: quizId++,
                        subject: subject,
                        topic: "All Topics",
                        quizNumber: quizNumber,
                        questions: questions.length,
                        isUnlocked: true
                    });
                }
            }
        }
    }
    
    return quizzes;
}

function createDefaultQuizzes() {
    return subjects.map((subject, index) => ({
        id: index + 1,
        subject: subject,
        topic: "All Topics",
        quizNumber: "quiz1",
        questions: 50,
        isUnlocked: true
    }));
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

function showHomePage() {
    hideAllPages();
    homePage.classList.remove('hidden');
    state.currentPage = 'home';
    console.log("✅ Homepage visible");
}

function goToHomePage() {
    hideAllPages();
    homePage.classList.remove('hidden');
    state.currentPage = 'home';
    console.log("🏠 Navigated to homepage");
}

function showQuizSelectionPage() {
    hideAllPages();
    quizSelectionPage.classList.remove('hidden');
    state.currentPage = 'quizSelection';
    
    // Load and display quizzes
    loadAndDisplayQuizzes();
    console.log("📚 Showing quiz selection page");
}

function loadAndDisplayQuizzes() {
    quizGrid.innerHTML = '';
    
    if (state.allQuizzes.length === 0) {
        state.allQuizzes = createDefaultQuizzes();
    }
    
    let quizzesToShow = state.allQuizzes;
    if (state.selectedSubject) {
        quizzesToShow = state.allQuizzes.filter(quiz => 
            quiz.subject === state.selectedSubject
        );
        pageTitle.textContent = `${state.selectedSubject} Quizzes`;
    } else {
        pageTitle.textContent = 'All Quizzes';
    }
    
    // Display quizzes
    quizzesToShow.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card active';
        quizCard.dataset.quizId = quiz.id;
        
        // Show quiz number and topic
        const displayName = quiz.topic === "All Topics" 
            ? `${quiz.subject} - ${quiz.quizNumber}` 
            : `${quiz.subject}: ${quiz.topic} - ${quiz.quizNumber}`;
            
        quizCard.innerHTML = `
            <div class="quiz-card-header">
                <div class="quiz-subject">${displayName}</div>
                <div class="quiz-status status-available">
                    Available
                </div>
            </div>
            <div class="quiz-details">${quiz.questions} questions</div>
            <div class="quiz-card-footer">
                <div class="quiz-questions">${quiz.questions} questions</div>
                <button class="quiz-action" data-quiz-id="${quiz.id}">
                    Start Quiz
                </button>
            </div>
        `;
        
        quizGrid.appendChild(quizCard);
        
        const quizActionBtn = quizCard.querySelector('.quiz-action');
        quizActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleQuizSelection(quiz);
        });
        
        quizCard.addEventListener('click', () => {
            handleQuizSelection(quiz);
        });
    });
}

async function handleQuizSelection(quiz) {
    console.log(`🎯 Selected quiz: ${quiz.subject} - ${quiz.quizNumber}`);
    
    // Save selected quiz
    state.currentQuiz = quiz;
    
    // Load questions for this quiz
    await loadQuestionsForQuiz(quiz);
}

async function loadQuestionsForQuiz(quiz) {
    try {
        console.log(`📥 Loading questions for ${quiz.subject} - ${quiz.topic} - ${quiz.quizNumber}`);
        
        const response = await fetch('questions.json');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data[quiz.subject]) {
                const isTopicBased = ["Mathematics", "Physics", "Chemistry", "Biology"].includes(quiz.subject);
                let questions = [];
                
                if (isTopicBased) {
                    // Topic-based subject: use specific topic
                    if (data[quiz.subject][quiz.topic] && data[quiz.subject][quiz.topic][quiz.quizNumber]) {
                        questions = data[quiz.subject][quiz.topic][quiz.quizNumber];
                    }
                } else {
                    // Non-topic subject: use "Default"
                    if (data[quiz.subject]["Default"] && data[quiz.subject]["Default"][quiz.quizNumber]) {
                        questions = data[quiz.subject]["Default"][quiz.quizNumber];
                    }
                }
                
                if (questions.length > 0) {
                    state.questions = questions;
                    console.log(`✓ Loaded ${state.questions.length} questions`);
                } else {
                    console.log("No questions found, using default");
                    state.questions = defaultQuestions;
                }
            } else {
                state.questions = defaultQuestions;
            }
        } else {
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
    
    // SHOW AD (with smart refresh) - NEW
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
// SUBJECT AND TOPIC MANAGEMENT
// =============================================

function hideAllPages() {
    homePage.classList.add('hidden');
    quizSelectionPage.classList.add('hidden');
    quizScreen.classList.add('hidden');
}

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

async function selectSubject(subject) {
    state.selectedSubject = subject;
    selectedSubjectLabel.textContent = `Subject: ${subject}`;
    
    // Load topics for this subject
    await loadTopicsForSubject(subject);
    
    // Load quiz numbers for the first topic
    if (topicSelect.value) {
        await loadQuizNumbers(subject, topicSelect.value);
    }
    
    // Close subject modal and open setup modal
    closeModal(subjectModal);
    openModal(setupModal);
}

async function loadTopicsForSubject(subject) {
    try {
        // Clear existing options
        topicSelect.innerHTML = '';
        
        // Check if this is a topic-based subject
        const isTopicBased = ["Mathematics", "Physics", "Chemistry", "Biology"].includes(subject);
        
        // Try to load from questions.json
        const response = await fetch('questions.json');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data[subject]) {
                if (isTopicBased) {
                    // For topic-based subjects: DON'T show "All Topics"
                    const topics = Object.keys(data[subject]);
                    
                    topics.forEach(topic => {
                        const option = document.createElement('option');
                        option.value = topic;
                        option.textContent = topic;
                        topicSelect.appendChild(option);
                    });
                    
                    // Don't add "All Topics" option
                } else {
                    // For non-topic subjects: Only show "All Topics"
                    const defaultOption = document.createElement('option');
                    defaultOption.value = 'All Topics';
                    defaultOption.textContent = 'All Topics';
                    topicSelect.appendChild(defaultOption);
                }
            } else {
                // Fallback: Use default topics
                addFallbackTopicOptions(subject, isTopicBased);
            }
        } else {
            // JSON not found, use fallback
            addFallbackTopicOptions(subject, isTopicBased);
        }
        
        // Add event listener for topic change
        topicSelect.addEventListener('change', async () => {
            await loadQuizNumbers(subject, topicSelect.value);
        });
        
        // Load quiz numbers for the first topic
        if (topicSelect.value) {
            await loadQuizNumbers(subject, topicSelect.value);
        }
        
    } catch (error) {
        console.error("Error loading topics:", error);
        addFallbackTopicOptions(subject, ["Mathematics", "Physics", "Chemistry", "Biology"].includes(subject));
    }
}

function addFallbackTopicOptions(subject, isTopicBased) {
    if (isTopicBased) {
        // Topic-based subjects
        const defaultTopics = {
            "Mathematics": ["Algebra", "Geometry", "Calculus", "Trigonometry"],
            "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electricity"],
            "Chemistry": ["Organic", "Inorganic", "Physical", "Analytical"],
            "Biology": ["Genetics", "Ecology", "Anatomy", "Microbiology"]
        };
        
        if (defaultTopics[subject]) {
            defaultTopics[subject].forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        }
    } else {
        // Non-topic subjects
        const defaultOption = document.createElement('option');
        defaultOption.value = 'All Topics';
        defaultOption.textContent = 'All Topics';
        topicSelect.appendChild(defaultOption);
    }
}

async function loadQuizNumbers(subject, topic) {
    try {
        // Clear existing options
        quizNumberSelect.innerHTML = '';
        
        // Try to load from questions.json
        const response = await fetch('questions.json');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data[subject]) {
                const isTopicBased = ["Mathematics", "Physics", "Chemistry", "Biology"].includes(subject);
                let quizData;
                
                if (isTopicBased) {
                    // Topic-based subject: topic is required
                    if (data[subject][topic]) {
                        quizData = data[subject][topic];
                    }
                } else {
                    // Non-topic subject: use "Default"
                    if (data[subject]["Default"]) {
                        quizData = data[subject]["Default"];
                    }
                }
                
                if (quizData) {
                    // Add quiz number options
                    Object.keys(quizData).forEach(quizNumber => {
                        const option = document.createElement('option');
                        option.value = quizNumber;
                        const questionCount = quizData[quizNumber].length;
                        option.textContent = `${quizNumber.toUpperCase()} (${questionCount} questions)`;
                        quizNumberSelect.appendChild(option);
                    });
                } else {
                    // Fallback option
                    addFallbackQuizOption();
                }
            } else {
                addFallbackQuizOption();
            }
        } else {
            addFallbackQuizOption();
        }
        
    } catch (error) {
        console.error("Error loading quiz numbers:", error);
        addFallbackQuizOption();
    }
}

function addFallbackQuizOption() {
    const fallbackOption = document.createElement('option');
    fallbackOption.value = 'quiz1';
    fallbackOption.textContent = 'Quiz 1 (50 questions)';
    quizNumberSelect.appendChild(fallbackOption);
}

function handleQuizSetup(e) {
    e.preventDefault();
    
    const subject = state.selectedSubject;
    const topic = topicSelect.value;
    const quizNumber = quizNumberSelect.value;
    const duration = parseInt(durationSelect.value);
    
    // For non-topic subjects, use "All Topics"
    const displayTopic = ["Mathematics", "Physics", "Chemistry", "Biology"].includes(subject) 
        ? topic 
        : 'All Topics';
    
    // Save quiz setup
    state.quizSetup = {
        subject: subject,
        topic: topic,
        quizNumber: quizNumber,
        duration: duration,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('aPlusBuddyQuizSetup', JSON.stringify(state.quizSetup));
    
    // Create quiz object
    const quiz = {
        id: Date.now(),
        subject: subject,
        topic: displayTopic,
        quizNumber: quizNumber,
        questions: 50, // Assuming 50 questions per quiz
        isUnlocked: true
    };
    
    state.currentQuiz = quiz;
    
    // Close setup modal
    closeModal(setupModal);
    
    // Load and start the quiz
    loadQuestionsForQuiz(quiz);
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
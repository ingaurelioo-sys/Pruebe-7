/* ==========================================================================
   TEMARIO SECUENCIAL CON CONOCIMIENTO, CUESTIONARIOS (20 PREGUNTAS) Y DESAFÍOS
   ========================================================================== */
const courseData = [
  {
    sectionId: 1,
    sectionTitle: "Capítulo 1: Introducción a C++",
    topics: [
      {
        id: "1.1", name: "1.1 C++", level: "Básico", levelClass: "badge-basic",
        theory: "<h3>Conocimiento de C++</h3><p>C++ es un lenguaje compilado, de alto rendimiento y multiparadigma desarrollado por Bjarne Stroustrup.</p>",
        quiz: Array.from({ length: 20 }, (_, i) => ({
          q: `Pregunta ${i + 1}: ¿Qué tipo de lenguaje es C++ principalmente?`,
          options: ["Interpretado", "Compilado", "De marcado", "Scripting"],
          answer: 1,
          whyCorrect: "C++ se compila directamente a código máquina ejecutables por el procesador.",
          whyIncorrect: "No es interpretado ni de marcado; requiere un proceso de compilación previo."
        })),
        task: "Presiona 'Ir a la Consola de Código' para escribir tu primer estructura base.",
        code: `#include <iostream>\nint main() {\n    return 0;\n}`,
        hints: ["Escribe un programa básico que retorne 0."],
        testCases: [{ input: "Setup", expected: "0" }],
        validate: (c) => c.includes("return 0;"), solution: `#include <iostream>\nint main() {\n    return 0;\n}`
      },
      {
        id: "1.2", name: "1.2 Hola Mundo", level: "Básico", levelClass: "badge-basic",
        theory: "<h3>Conocimiento de Hola Mundo</h3><p>Para imprimir texto en C++ se usa el objeto <code>std::cout</code> junto con el operador de inserción <code>&lt;&lt;</code>.</p>",
        quiz: Array.from({ length: 20 }, (_, i) => ({
          q: `Pregunta ${i + 1}: ¿Qué flujo de salida se usa para imprimir texto en la consola?`,
          options: ["std::cin", "std::cout", "std::cerr", "printf_s"],
          answer: 1,
          whyCorrect: "std::cout es el flujo estándar de salida en C++ definido en <iostream>.",
          whyIncorrect: "std::cin es para entrada de datos, no para salida."
        })),
        task: "Completa el código para imprimir 'Hola Mundo' en la consola.",
        code: `#include <iostream>\nint main() {\n    std::cout << "___";\n    return 0;\n}`,
        hints: ["Reemplaza ___ con Hola Mundo"],
        testCases: [{ input: "Ejecución", expected: "Hola Mundo" }],
        validate: (c) => c.includes("Hola Mundo") && !c.includes("___"),
        solution: `#include <iostream>\nint main() {\n    std::cout << "Hola Mundo";\n    return 0;\n}`
      }
    ]
  }
];

// Estado global de la aplicación
let currentSectionIdx = 0;
let currentTopic = null;
let currentQuizIndex = 0;
let quizScore = 0;
let revealedHintsCount = 0;
let unlockedTopics = ["1.1"];
let userXP = 350;

window.onload = () => {
  renderMap();
};

function renderMap() {
  const pathContainer = document.getElementById('nodesPath');
  pathContainer.innerHTML = '';

  const section = courseData[currentSectionIdx];
  document.getElementById('sectionTitle').innerText = section.sectionTitle;
  document.getElementById('sectionCounter').innerText = `Sección ${currentSectionIdx + 1} de ${courseData.length}`;

  section.topics.forEach((topic) => {
    const isUnlocked = unlockedTopics.includes(topic.id);

    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'node-wrapper';

    const titleLabel = document.createElement('div');
    titleLabel.className = 'node-title';
    titleLabel.innerText = topic.name;

    const hexNode = document.createElement('div');
    hexNode.className = `hex-node ${!isUnlocked ? 'locked' : ''} ${topic.isTrophy ? 'trophy' : ''}`;
    hexNode.innerHTML = !isUnlocked ? '<i class="fas fa-lock"></i>' : (topic.isTrophy ? '<i class="fas fa-trophy"></i>' : '<i class="fas fa-code"></i>');

    if (isUnlocked) {
      hexNode.onclick = () => openLesson(topic);
    }

    nodeWrapper.appendChild(titleLabel);
    nodeWrapper.appendChild(hexNode);

    const line = document.createElement('div');
    line.className = 'connector-line';
    nodeWrapper.appendChild(line);

    pathContainer.appendChild(nodeWrapper);
  });
}

function prevSection() { if (currentSectionIdx > 0) { currentSectionIdx--; renderMap(); } }
function nextSection() { if (currentSectionIdx < courseData.length - 1) { currentSectionIdx++; renderMap(); } }

function openLesson(topic) {
  currentTopic = topic;
  revealedHintsCount = 0;

  document.getElementById('mapView').classList.add('hidden');
  document.getElementById('lessonView').classList.remove('hidden');

  const badge = document.getElementById('difficultyBadge');
  badge.innerText = `Nivel ${topic.level}`;
  badge.className = `badge ${topic.levelClass}`;

  document.getElementById('refTitle').innerText = topic.name;
  document.getElementById('referenceText').innerHTML = topic.theory;
  document.getElementById('challengeTitle').innerText = topic.name;
  document.getElementById('challengeDescription').innerHTML = `<p>${topic.task}</p>`;

  document.getElementById('codeEditor').value = topic.code;
  document.getElementById('solutionCode').innerText = topic.solution;

  document.getElementById('hintsList').innerHTML = '';
  document.getElementById('hintCount').innerText = '0';
  document.getElementById('testResults').innerText = 'Presiona "Run / Submit" para compilar y evaluar tu código.';

  startQuiz();
  switchTab('reference');
}

/* ==========================================================================
   SISTEMA DE CUESTIONARIO CON RETROALIMENTACIÓN EXPLICATIVA
   ========================================================================== */
function startQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (!currentTopic || !currentTopic.quiz) return;
  const qData = currentTopic.quiz[currentQuizIndex];

  document.getElementById('quizQuestionCounter').innerText = `Pregunta ${currentQuizIndex + 1} de ${currentTopic.quiz.length}`;
  document.getElementById('quizScoreCounter').innerText = `Aciertos: ${quizScore}/${currentTopic.quiz.length}`;
  document.getElementById('quizQuestionText').innerText = qData.q;

  const optionsList = document.getElementById('quizOptionsList');
  optionsList.innerHTML = '';
  document.getElementById('quizFeedback').classList.add('hidden');

  qData.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerText = optText;
    btn.onclick = () => evaluateQuizAnswer(idx);
    optionsList.appendChild(btn);
  });
}

function evaluateQuizAnswer(selectedOptionIndex) {
  const qData = currentTopic.quiz[currentQuizIndex];
  const feedbackBox = document.getElementById('quizFeedback');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');

  document.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);

  if (selectedOptionIndex === qData.answer) {
    quizScore++;
    feedbackBox.className = 'quiz-feedback correct';
    feedbackTitle.innerText = '¡Correcto!';
    feedbackText.innerText = qData.whyCorrect;
  } else {
    feedbackBox.className = 'quiz-feedback incorrect';
    feedbackTitle.innerText = 'Respuesta Incorrecta';
    feedbackText.innerText = qData.whyIncorrect;
  }

  feedbackBox.classList.remove('hidden');
}

function nextQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < currentTopic.quiz.length) {
    renderQuizQuestion();
  } else {
    if (quizScore === currentTopic.quiz.length) {
      alert("¡Felicidades! Has completado el cuestionario con 20/20. Ahora puedes realizar el Desafío.");
      switchTab('challenge');
    } else {
      alert(`Obtuviste ${quizScore}/20 aciertos. Para continuar debes responder correctamente 20 de 20. El cuestionario se reiniciará.`);
      startQuiz();
    }
  }
}

function closeLesson() {
  document.getElementById('lessonView').classList.add('hidden');
  document.getElementById('mapView').classList.remove('hidden');
  document.getElementById('bugsyModal').classList.add('hidden');
}

function switchTab(tabName) {
  ['reference', 'quiz', 'challenge', 'code', 'solution'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.add('hidden');
    document.getElementById(`btn-tab-${t}`)?.classList.remove('active');
  });

  document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');
  document.getElementById(`btn-tab-${tabName}`)?.classList.add('active');
}

function revealNextHint() {
  if (!currentTopic || revealedHintsCount >= currentTopic.hints.length) return;
  const hintsList = document.getElementById('hintsList');
  const hintItem = document.createElement('div');
  hintItem.className = 'hint-item';
  hintItem.innerText = `Pista ${revealedHintsCount + 1}: ${currentTopic.hints[revealedHintsCount]}`;
  hintsList.appendChild(hintItem);
  revealedHintsCount++;
  document.getElementById('hintCount').innerText = revealedHintsCount;
}

function runCode() {
  const code = document.getElementById('codeEditor').value;
  const testResultsBox = document.getElementById('testResults');
  const testStatus = document.getElementById('testStatus');

  const isValid = currentTopic.validate(code);

  if (isValid) {
    testStatus.innerText = "PASADO";
    testStatus.style.color = "var(--primary-green)";
    testResultsBox.className = "test-results-box pass";
    testResultsBox.innerText = "Compilación exitosa. ¡Código validado!";

    userXP += 50;
    document.getElementById('xpCount').innerText = userXP;
    document.getElementById('successModal').classList.remove('hidden');

    const allTopics = courseData.flatMap(s => s.topics);
    const currIndex = allTopics.findIndex(t => t.id === currentTopic.id);
    if (currIndex !== -1 && currIndex + 1 < allTopics.length) {
      const nextId = allTopics[currIndex + 1].id;
      if (!unlockedTopics.includes(nextId)) {
        unlockedTopics.push(nextId);
      }
    }
  } else {
    testStatus.innerText = "FALLIDO";
    testStatus.style.color = "var(--level-adv)";
    testResultsBox.className = "test-results-box fail";
    testResultsBox.innerText = "Error: Asegúrate de completar el código correctamente.";
  }
}

function resetCode() { document.getElementById('codeEditor').value = currentTopic.code; }
function nextChallenge() {
  document.getElementById('successModal').classList.add('hidden');
  closeLesson();
  renderMap();
}

function askBugsy() {
  const bugsyModal = document.getElementById('bugsyModal');
  const bugsyResponse = document.getElementById('bugsyResponse');
  const code = document.getElementById('codeEditor').value;

  bugsyModal.classList.remove('hidden');
  if (code.includes("___")) {
    bugsyResponse.innerText = "Bugsy: Tienes espacios '___' por completar en el editor.";
  } else {
    bugsyResponse.innerText = "Bugsy: Revisa la sintaxis o consulta las pistas si lo necesitas.";
  }
}

function toggleBugsy() { document.getElementById('bugsyModal').classList.toggle('hidden')
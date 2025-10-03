// JAVASCRIPT: Lógica del Examen con Login y Persistencia

        // --- CREDENCIALES OCULTAS (ACTUALIZADAS PARA MÚLTIPLES USUARIOS) ---
        const VALID_USERS = [
            { username: 'Kvnsierra23', password: 'Keko25' },
            { username: 'Nthfontanez', password: 'Natasha2002' } // ¡NUEVO USUARIO AÑADIDO!
        ];

        const TIME_LIMIT_SECONDS = 900; // 15 minutos
        let timeLeft = TIME_LIMIT_SECONDS;
        let timerInterval;

        const quizQuestions = [
            { question: "¿Qué capa del modelo OSI es responsable del **direccionamiento lógico** y el enrutamiento de paquetes entre redes?", options: { a: "Capa de Enlace de Datos", b: "Capa de Transporte", c: "Capa de Red", d: "Capa de Aplicación" }, correctAnswer: "c" },
            { question: "¿Qué protocolo es **orientado a la conexión** y garantiza la entrega fiable de datos en el modelo TCP/IP?", options: { a: "UDP (User Datagram Protocol)", b: "IP (Internet Protocol)", c: "ARP (Address Resolution Protocol)", d: "TCP (Transmission Control Protocol)" }, correctAnswer: "d" },
            { question: "¿En la arquitectura **Cliente-Servidor**, ¿cuál es el rol principal del servidor de aplicaciones (o backend)?", options: { a: "Mostrar la interfaz de usuario directamente al cliente.", b: "Gestionar la lógica de negocio y acceder a la base de datos.", c: "Convertir la dirección IP en dirección MAC.", d: "Proporcionar exclusivamente el servicio DNS." }, correctAnswer: "b" },
            { question: "¿Qué significa el acrónimo **API** en el contexto del desarrollo de aplicaciones?", options: { a: "Application Processing Interface", b: "Advanced Program Integration", c: "Application Programming Interface", d: "Automatic Protocol Interpreter" }, correctAnswer: "c" },
            { question: "¿Qué número de puerto estándar utiliza el protocolo **HTTP** para la comunicación web no segura?", options: { a: "21", b: "25", c: "80", d: "443" }, correctAnswer: "c" },
            { question: "¿Cuál es el principal inconveniente de la arquitectura **Monolítica** en el desarrollo de aplicaciones?", options: { a: "Es muy fácil de escalar horizontalmente.", b: "La base de código está separada, lo que simplifica el desarrollo.", c: "Un fallo en una pequeña parte puede detener toda la aplicación.", d: "Requiere múltiples despliegues para cada cambio." }, correctAnswer: "c" },
            { question: "¿Qué protocolo se utiliza en la capa de **Aplicación** para transferir archivos de forma bidireccional?", options: { a: "ICMP", b: "SSH", c: "FTP", d: "Telnet" }, correctAnswer: "c" },
            { question: "¿Cuál es la función principal de un **Router** en una red?", options: { a: "Conectar dispositivos dentro de la misma subred (LAN).", b: "Replicar señales para aumentar la cobertura inalámbrica.", c: "Determinar el mejor camino para enviar paquetes a través de diferentes redes.", d: "Asignar direcciones MAC a las direcciones IP." }, correctAnswer: "c" },
            { question: "¿Cuál de las siguientes **NO** es una ventaja de utilizar una arquitectura de **Microservicios**?", options: { a: "Permite el uso de diferentes tecnologías para cada servicio.", b: "Facilita la escalabilidad de componentes individuales.", c: "Aumenta la complejidad de la gestión de la red y el despliegue.", d: "Permite a los equipos trabajar independientemente." }, correctAnswer: "c" },
            { question: "¿En el modelo **TCP/IP**, ¿qué protocolo se utiliza para el envío de correo electrónico?", options: { a: "POP3", b: "IMAP", c: "SMTP", d: "DHCP" }, correctAnswer: "c" }
        ];

        // Referencias del DOM
        const loginScreen = document.getElementById('login-screen');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('login-button');
        const loginMessage = document.getElementById('login-message');

        const startScreen = document.getElementById('start-screen');
        const quizContainer = document.getElementById('quiz');
        const resultsContainer = document.getElementById('results');
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');
        const submitButton = document.getElementById('submit');
        const prevButton = document.getElementById('prev-button');
        const scoreBlock = document.getElementById('score-block');
        const luckMessage = document.getElementById('luck-message');
        const startButton = document.getElementById('start-button');
        const progressText = document.getElementById('progress-text');
        const timerElement = document.getElementById('timer');
        const scoreText = document.getElementById('score-text');
        const finalSummaryElement = document.getElementById('final-summary');
        const gradeMotivationElement = document.getElementById('grade-motivation');
        const feedbackList = document.getElementById('feedback-list');

        let currentQuestionIndex = 0;
        let userSelections = {};
        let selectedOptionValue = null;

        // --- PERSISTENCIA DE DATOS ---

        function saveState() {
            if (quizContainer.style.display === 'block') {
                localStorage.setItem('userSelections', JSON.stringify(userSelections));
                localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
                localStorage.setItem('timeLeft', timeLeft);
                localStorage.setItem('examInProgress', 'true');
            }
        }

        function clearState() {
            localStorage.removeItem('userSelections');
            localStorage.removeItem('currentQuestionIndex');
            localStorage.removeItem('timeLeft');
            localStorage.removeItem('examInProgress');
        }

        function loadState() {
            const selections = localStorage.getItem('userSelections');
            const index = localStorage.getItem('currentQuestionIndex');
            const time = localStorage.getItem('timeLeft');
            const inProgress = localStorage.getItem('examInProgress');

            if (inProgress === 'true' && selections && index && time) {
                userSelections = JSON.parse(selections);
                currentQuestionIndex = parseInt(index);
                timeLeft = parseInt(time);
                return true;
            }
            return false;
        }

        // --- LÓGICA DE LOGIN (ACTUALIZADA) ---

        function handleLogin() {
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();

            // Ocultar mensajes previos
            loginMessage.classList.remove('error');
            loginMessage.style.visibility = 'hidden';
            loginMessage.style.opacity = '0';

            // VERIFICA SI EL USUARIO Y CONTRASEÑA COINCIDEN CON CUALQUIER PAR VÁLIDO
            const accessGranted = VALID_USERS.some(u => u.username === user && u.password === pass);

            if (accessGranted) {

                loginMessage.innerText = '¡Acceso Concedido!';
                loginMessage.style.visibility = 'visible';
                loginMessage.style.opacity = '1';

                // Ocultar login y mostrar pantalla de inicio
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    startQuiz(true); // Pasa al flujo normal del quiz
                }, 700);

            } else {
                loginMessage.innerText = 'Error: Usuario o Contraseña incorrectos.';
                loginMessage.classList.add('error');
                loginMessage.style.visibility = 'visible'; // Hacemos visible el error
                loginMessage.style.opacity = '1';

                passwordInput.value = '';
                usernameInput.focus();
            }
        }

        function showLoginScreen() {
            // Limpia todas las pantallas
            startScreen.style.display = 'none';
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'none';
            luckMessage.style.display = 'none';

            // Muestra el login
            loginScreen.style.display = 'flex';

            // Limpia el mensaje de error y asegura que esté oculto
            loginMessage.innerText = '';
            loginMessage.classList.remove('error');
            loginMessage.style.visibility = 'hidden';
            loginMessage.style.opacity = '0';

            // Detiene el temporizador si estaba corriendo
            if (timerInterval) clearInterval(timerInterval);
        }

        // --- LÓGICA DEL TEMA ---

        function setTheme(themeName) {
            // Elimina todas las clases de tema (light-mode, dark-mode, red-mode)
            document.body.classList.remove('dark-mode', 'light-mode', 'red-mode');
            if (themeName === 'dark') {
                document.body.classList.add('dark-mode');
            } else if (themeName === 'red') { // Modo "red"
                document.body.classList.add('red-mode');
            } else {
                document.body.classList.add('light-mode'); // Default es light
            }
            localStorage.setItem('theme', themeName);
        }

        function loadThemePreference() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
            // Ajusta para los IDs del nuevo interruptor
            const themeRadio = document.getElementById(`${savedTheme}-mode`);
            if (themeRadio) {
                themeRadio.checked = true;
            }
        }

        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                setTheme(e.target.value);
            });
        });

        // --- LÓGICA DE CONTROL ---

        function startExam(shouldLoadState = false) {
            startScreen.style.display = 'none';

            if (!shouldLoadState) {
                clearState();
                currentQuestionIndex = 0;
                userSelections = {};
                timeLeft = TIME_LIMIT_SECONDS;
            }

            // Mostrar la animación de suerte SOLO si NO estamos reanudando un estado guardado.
            if (!shouldLoadState) {
                luckMessage.style.display = 'flex';
                luckMessage.classList.remove('hide');
                luckMessage.classList.add('show');
            }

            const startDelay = shouldLoadState ? 0 : 1500;

            setTimeout(() => {
                luckMessage.classList.remove('show');
                luckMessage.classList.add('hide');

                setTimeout(() => {
                    luckMessage.style.display = 'none';
                    quizContainer.style.display = 'block';

                    startTimer();
                    loadQuestion();

                    // Guardado automático cada 10 segundos
                    setInterval(saveState, 10000);

                }, shouldLoadState ? 0 : 500);

            }, startDelay);
        }


        function startQuiz(isInitialLoad = true) {
            resultsContainer.style.display = 'none';
            quizContainer.style.display = 'none';
            loginScreen.style.display = 'none';
            startScreen.style.display = 'flex';
            luckMessage.style.display = 'none';

            if (isInitialLoad) {
                loadThemePreference();
            }

            const originalText = 'Este es un examen de nivel fundamental. Tienes 15 minutos para responder 10 preguntas. ¡Demuestra tu conocimiento de protocolos y arquitectura!';
            const pElement = document.querySelector('#start-screen p');

            // Limpiamos listeners previos para evitar duplicados
            startButton.removeEventListener('click', () => startExam(true));
            startButton.removeEventListener('click', () => startExam(false));

            if (loadState()) {
                startButton.innerText = 'Reanudar Examen Pendiente';
                startButton.classList.add('resume-mode');
                startButton.addEventListener('click', () => startExam(true));
                pElement.innerHTML = originalText + '<br><br>¡Tienes un examen a medio terminar! Haz clic para reanudar donde lo dejaste.';
            } else {
                startButton.innerText = 'Comenzar Examen';
                startButton.classList.remove('resume-mode');
                startButton.addEventListener('click', () => startExam(false));
                pElement.innerHTML = originalText;
            }
        }

        /**
         * Función que se ejecuta al presionar "Reintentar" en la pantalla de resultados.
         * Borra el estado anterior y va a la pantalla de inicio para mostrar la animación de suerte.
         */
        function restartQuizAfterResults() {
            clearState(); // Borra el estado de la prueba anterior
            startQuiz(false);
        }

        // --- LÓGICA DEL TEMPORIZADOR ---
        function updateTimerDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            timerElement.innerText = timeString;

            if (timeLeft <= 60) {
                timerElement.classList.add('critical');
            } else {
                timerElement.classList.remove('critical');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (selectedOptionValue) {
                    userSelections[currentQuestionIndex] = selectedOptionValue;
                    saveState();
                }
                showResults(true);
            }
            timeLeft--;
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timerElement.classList.remove('critical');
            updateTimerDisplay();
            timerInterval = setInterval(updateTimerDisplay, 1000);
        }

        // --- LÓGICA DE NAVEGACIÓN Y CARGA DE PREGUNTAS ---

        function loadQuestion() {
            if (currentQuestionIndex >= quizQuestions.length) {
                clearInterval(timerInterval);
                showResults(false);
                return;
            }

            const currentQuestion = quizQuestions[currentQuestionIndex];
            questionElement.innerText = currentQuestion.question;
            optionsElement.innerHTML = '';
            selectedOptionValue = userSelections[currentQuestionIndex] || null;

            progressText.innerText = `Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}`;

            prevButton.disabled = currentQuestionIndex === 0;
            submitButton.innerText = currentQuestionIndex === quizQuestions.length - 1 ? "Finalizar Examen y Ver Resultados" : "Siguiente Pregunta";
            submitButton.disabled = !selectedOptionValue;

            let delay = 0.1;
            for (const key in currentQuestion.options) {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option');
                optionDiv.innerText = `${key.toUpperCase()}: ${currentQuestion.options[key]}`;
                optionDiv.dataset.value = key;
                optionDiv.style.animationDelay = `${delay}s`;
                delay += 0.1;

                if (userSelections[currentQuestionIndex] === key) {
                    optionDiv.classList.add('selected');
                }

                optionDiv.addEventListener('click', () => selectOption(optionDiv, key));
                optionsElement.appendChild(optionDiv);
            }
        }

        function selectOption(selectedDiv, selectedKey) {
            const allOptions = optionsElement.querySelectorAll('.option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            selectedDiv.classList.add('selected');
            selectedOptionValue = selectedKey;
            submitButton.disabled = false;
            saveState();
        }

        function handleNext() {
            if (selectedOptionValue) {
                userSelections[currentQuestionIndex] = selectedOptionValue;
                saveState();
            }
            currentQuestionIndex++;
            loadQuestion();
        }

        function handlePrevious() {
            if (selectedOptionValue) {
                userSelections[currentQuestionIndex] = selectedOptionValue;
                saveState();
            }

            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                loadQuestion();
            }
        }

        // --- LÓGICA DE CALIFICACIÓN Y RESULTADOS ---

        function determineGradeAndMessage(percentage) {
            let grade, message, cssClass;

            if (percentage >= 90) { grade = 'A'; message = "¡Impresionante! Tu dominio en Redes y Desarrollo es **EXCELENTE**. ¡Tienes un nivel profesional!"; cssClass = 'grade-A';
            } else if (percentage >= 80) { grade = 'B'; message = "¡Muy Sólido! Tienes un **Fuerte conocimiento** de los fundamentos. Revisa tus fallos para la perfección."; cssClass = 'grade-B';
            } else if (percentage >= 60) { grade = 'C'; message = "Resultado **Aceptable**. Concéntrate en la diferencia de capas y protocolos. ¡Sigue practicando para consolidar!"; cssClass = 'grade-C';
            } else if (percentage >= 40) { grade = 'D'; message = "Necesitas **Reforzar** los modelos OSI/TCP y la arquitectura de aplicaciones. ¡No te rindas, los fundamentos son la clave!"; cssClass = 'grade-D';
            } else { grade = 'F'; message = "Es crucial que **Revistas los Fundamentos** de Redes. Dedica tiempo a entender los protocolos principales (TCP, IP, HTTP, etc.)."; cssClass = 'grade-F'; }
            return { grade, message, cssClass };
        }

        function getAnswerText(questionIndex, key) {
            const question = quizQuestions[questionIndex];
            return key && question.options[key] ? question.options[key] : "No contestaste";
        }

        function showResults(timedOut) {
            clearInterval(timerInterval);

            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
            feedbackList.innerHTML = '';
            scoreBlock.className = '';

            let score = 0;
            const totalQuestions = quizQuestions.length;
            const answeredQuestionsCount = Object.keys(userSelections).length;

            quizQuestions.forEach((q, index) => {
                const userAnswerKey = userSelections[index];
                const isCorrect = userAnswerKey === q.correctAnswer;

                if (isCorrect) { score++; }

                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item', isCorrect ? 'correct' : 'incorrect');

                const userAnswerText = getAnswerText(index, userAnswerKey);
                const correctAnswerText = getAnswerText(index, q.correctAnswer);

                let feedbackHTML = `
                    <p><strong>${index + 1}. ${q.question}</strong></p>
                    <p>Tu respuesta: <span class="user-answer">${userAnswerText}</span></p>
                `;

                if (!isCorrect) {
                    feedbackHTML += `<p>Respuesta correcta: <span class="correct-answer">${correctAnswerText}</span></p>`;
                } else {
                    feedbackHTML += `<p><span class="correct-answer">¡Respuesta Correcta!</span></p>`;
                }

                feedbackItem.innerHTML = feedbackHTML;
                feedbackList.appendChild(feedbackItem);
            });

            const percentage = (score / totalQuestions) * 100;
            const { grade, message, cssClass } = determineGradeAndMessage(percentage);

            let summaryText = timedOut
                ? `El tiempo ha finalizado. Lograste responder ${answeredQuestionsCount} de ${totalQuestions} preguntas. ¡Revisa tu desempeño!`
                : `¡Examen completado a tiempo! Has demostrado habilidad bajo presión.`;

            finalSummaryElement.innerText = summaryText;
            scoreText.innerHTML = `Puntuación: <strong>${score} de ${totalQuestions}</strong> (${percentage.toFixed(0)}%) | **GRADO: ${grade}**`;
            scoreBlock.classList.add(cssClass);
            gradeMotivationElement.className = '';
            gradeMotivationElement.classList.add(cssClass);
            gradeMotivationElement.innerText = message;
        }

        // EVENTOS
        loginButton.addEventListener('click', handleLogin);
        usernameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
        passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

        submitButton.addEventListener('click', handleNext);
        prevButton.addEventListener('click', handlePrevious);

        // Inicializa, mostrando la pantalla de login
        showLoginScreen();

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBzwxsTVx-EIyuTvd9ZbBBrd4jHkUDDsrU",
    authDomain: "quiz-app-46828.firebaseapp.com",
    projectId: "quiz-app-46828",
    storageBucket: "quiz-app-46828.firebasestorage.app",
    messagingSenderId: "407814209869",
    appId: "1:407814209869:web:0ce9738e5b24478b6db704"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

window.signup = function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Sign up successful. Please log in.");
            document.getElementById("signupForm").style.display = "none";
            document.getElementById("loginForm").style.display = "block";
        })
        .catch((error) => alert(error.message));
}

window.login = function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById("signupForm").style.display = "none";
            document.getElementById("loginForm").style.display = "none";
            document.getElementById("quizApp").style.display = "block";
            loadQuiz();
        })
        .catch((error) => alert(error.message));
}

window.logout = function logout() {
    signOut(auth).then(() => {
        document.getElementById("quizApp").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
    });
}

window.loadQuiz = function loadQuiz() {
    const quizList = document.getElementById("quizList");
    quizList.innerHTML = "";

    const quizRef = ref(database, "quizQuestions");
    onValue(quizRef, (snapshot) => {
        const questions = snapshot.val();
        if (questions) {
            for (let questionId in questions) {
                const question = questions[questionId];
                const li = document.createElement("li");

                // Display question text
                const questionText = document.createElement("p");
                questionText.textContent = question.text;
                li.appendChild(questionText);

                // Display answer options as radio buttons
                question.options.forEach((option) => {
                    const label = document.createElement("label");
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = questionId;
                    input.value = option;
                    label.appendChild(input);
                    label.append(option);
                    li.appendChild(label);
                    li.appendChild(document.createElement("br"));
                });

                quizList.appendChild(li);
            }
        } else {
            quizList.innerHTML = "<p>No questions available</p>";
        }
    });
}

window.submitQuiz = function submitQuiz() {
    const userId = auth.currentUser.uid;
    const answers = {};
    const quizRef = ref(database, "quizQuestions");

    onValue(quizRef, (snapshot) => {
        const questions = snapshot.val();
        let score = 0;
        let totalQuestions = 0;

        const quizList = document.getElementById("quizList");
        for (let questionId in questions) {
            const question = questions[questionId];
            const selectedOption = quizList.querySelector(`input[name="${questionId}"]:checked`);
            totalQuestions++;

            if (selectedOption && selectedOption.value === question.answer) {
                score++;
                answers[questionId] = "Correct";
            } else {
                answers[questionId] = "Incorrect";
            }
        }

        // Display results
        alert(`Quiz submitted! Your score: ${score} out of ${totalQuestions}`);

        // Store answers in the database under the user's ID
        set(ref(database, "quizAnswers/" + userId), { answers, score })
            .then(() => console.log("Quiz submitted successfully"))
            .catch((error) => console.error("Error submitting quiz:", error));
    });
}

// Monitor auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("quizApp").style.display = "block";
        loadQuiz();
    } else {
        document.getElementById("quizApp").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
    }
});

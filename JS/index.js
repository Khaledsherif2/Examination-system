class App {
  constructor() {
    // Registration Elements
    this.registrationSection = document.getElementById("registration-section");
    this.hrOne = this.registrationSection.querySelector(".one");
    this.hrTwo = this.registrationSection.querySelector(".two");
    this.pOne = this.registrationSection.querySelector(".div1 > p");
    this.pTwo = this.registrationSection.querySelector(".div2 > p");
    this.form = this.registrationSection.querySelector("#form");
    this.firstName = this.registrationSection.querySelector("#firstName");
    this.lastName = this.registrationSection.querySelector("#lastName");
    this.validFirst = this.registrationSection.querySelector(".valid-first");
    this.validLast = this.registrationSection.querySelector(".valid-last");

    // Exam Elements
    this.examSection = document.getElementById("exam-section");
    this.sidePanel = this.examSection.querySelector(".side-panel");
    this.progBar = this.examSection.querySelector(".main-2 .progress-bar");
    this.ldiv = this.examSection.querySelector(".main-2 .left");
    this.t = this.ldiv.querySelector(".t");
    this.div = this.examSection.querySelector(".main-2 .left .q");
    this.rDiv = this.examSection.querySelector(".main-2 .right");
    this.name = this.examSection.querySelector(".user-info > p");
    this.photo = document.querySelector(".user-info > img");
    this.flags = this.examSection.querySelector(".content .flags");
    this.logOut = this.examSection.querySelector(".logout-btn");
    this.progressBar = this.examSection.querySelector(".progress");
    this.progressPercentage = this.examSection.querySelector(
      ".progress-percentage"
    );
    this.timerDisplay = this.examSection.querySelector(".timer");
    this.submitBtn = this.examSection.querySelector(".submit-btn");

    // Result Section
    this.resultSection = document.getElementById("result-section");

    // Shared Data
    this.accounts = JSON.parse(sessionStorage.getItem("accounts")) || [];
    // this.fName = this.accounts[0]?.firstName || "User";
    // this.lName = this.accounts[0]?.lastName || "";
    // this.image = sessionStorage.getItem("uploadedImage") || "";
    this.selectedAnswers = {};
    this.flaggedQuestions = new Set();

    // Timer
    this.totalTime = 1 * 60;
    this.timeLeft = this.totalTime;
    this.timerStarted = false;
    this.timerInterval = null;

    // Exam State
    this.num = 1;

    // Initialize
    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleToEmailClick(e));

    this.div.addEventListener("click", this.handleExamStart.bind(this));
    this.logOut.addEventListener("click", this.logout.bind(this));
    this.submitBtn.addEventListener("click", this.handleSubmit.bind(this));

    document.addEventListener("DOMContentLoaded", () => {
      const imageDataURL = sessionStorage.getItem("uploadedImage");
      const userAvatar = this.examSection.querySelector(".user-avatar");
      if (imageDataURL) {
        userAvatar.src = imageDataURL;
      } else {
        userAvatar.alt = "No image uploaded";
      }
    });
  }

  storeAccount(firstName, lastName, email, password) {
    this.accounts.push({ firstName, lastName, email, password });
    sessionStorage.setItem("accounts", JSON.stringify(this.accounts));
  }

  handleToEmailClick(e) {
    e.preventDefault();

    const fName = this.firstName.value.trim();
    const lName = this.lastName.value.trim();

    if (fName && lName) {
      this.showEmailForm(fName, lName);
      this.hrOne.style.backgroundColor = "green";
      this.pOne.style.cssText = "background-color: green;";
    } else {
      if (!fName)
        this.validFirst.textContent = "Please enter a valid First Name";
      if (!lName) this.validLast.textContent = "Please enter a valid Last Name";
    }
  }

  showEmailForm(fName, lName) {
    this.form.innerHTML = `
      <h6>Email</h6>
      <input id="email" type="text" required />
      <p class="valid-email"></p>
      <h6>Image</h6>
      <input type="file" id="fileUpload" name="file-upload" style="font-size: 10px;" />
      <p class="valid-file"></p>
      <button type="submit" id="toPassword">NEXT</button><br>
      <button type="button" id="previousToName">PREVIOUS</button>
    `;

    document
      .getElementById("fileUpload")
      .addEventListener("change", (e) => this.handleFileUpload(e));
    document
      .getElementById("toPassword")
      .addEventListener("click", (e) => this.toPasswordForm(e, fName, lName));
    document
      .getElementById("previousToName")
      .addEventListener("click", () => this.goBackToNameForm(fName, lName));
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataURL = e.target.result;
        sessionStorage.setItem("uploadedImage", imageDataURL);
      };
      reader.readAsDataURL(file);
    }
  }

  toPasswordForm(e, fName, lName) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const validEmail = document.querySelector(".valid-email");
    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (email && emailFormat.test(email)) {
      this.showPasswordForm(fName, lName, email);
      this.hrTwo.style.backgroundColor = "green";
      this.pTwo.style.cssText = "background-color: green;";
    } else {
      validEmail.innerHTML = `Please enter a valid Email`;
    }
  }

  showPasswordForm(fName, lName, email) {
    this.form.innerHTML = `
      <h6>Password</h6>
      <input id="password" type="password" required />
      <p class="valid-pass"></p>
      <h6>Re-enter Password</h6>
      <input id="Re-enter" type="password" required />
      <p class="valid-rePass"></p>
      <button type="submit" id="submit">NEXT</button><br>
      <button type="button" id="previousToEmail">PREVIOUS</button>
    `;

    document
      .getElementById("submit")
      .addEventListener("click", (e) =>
        this.toLogInForm(e, fName, lName, email)
      );
    document
      .getElementById("previousToEmail")
      .addEventListener("click", () =>
        this.goBackToEmailForm(fName, lName, email)
      );
  }

  toLogInForm(e, fName, lName, email) {
    e.preventDefault();

    const pass = document.getElementById("password").value;
    const rePass = document.getElementById("Re-enter").value;
    const validPass = document.querySelector(".valid-pass");
    const validReEnter = document.querySelector(".valid-rePass");
    const passFormat = /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~-]).{6,}$/;

    if (pass === rePass && pass && passFormat.test(pass)) {
      this.storeAccount(fName, lName, email, pass);
      this.showLoginForm();
    } else {
      if (!pass || !passFormat.test(pass)) {
        validPass.textContent =
          "Password must be at least 6 characters and contain a symbol";
      }
      if (pass !== rePass) {
        validReEnter.textContent = "The Passwords do not match";
      }
    }
  }

  showLoginForm() {
    const topDiv = this.registrationSection.querySelector(".log-left-top");
    const leftDiv = document.querySelector("#registration-section .log-left");
    const rightDiv = document.querySelector("#registration-section .log-right");
    if (topDiv) topDiv.innerHTML = "";

    this.form.innerHTML = `
      <h6>USERNAME</h6>
      <input id="user" type="text" required />
      <p class="valid-user"></p>
      <h6>PASSWORD</h6>
      <input id="logInPass" type="password" required />
      <p class="valid-login-pass"></p>
      <button type="submit" id="logIn">LOG IN</button>
    `;

    rightDiv.innerHTML = `
      <h3>Welcome Back!</h3>
      <p>To keep connected with us, please log in with your personal information</p>
    `;

    leftDiv.classList.toggle("move");
    rightDiv.classList.toggle("move");

    document
      .getElementById("logIn")
      .addEventListener("click", (e) => this.toStart(e));
  }

  goBackToNameForm(fName, lName) {
    this.hrOne.style.backgroundColor = "balck";
    this.pOne.style.cssText = "background-color: balck";
    this.form.innerHTML = `
      <h6>First Name</h6>
      <input id="firstName" type="text" value="${fName}" required />
      <p class="valid-first"></p>
      <h6>Last Name</h6>
      <input id="lastName" type="text" value="${lName}" required />
      <p class="valid-last"></p>
      <button type="submit" id="toEmail">NEXT</button>
    `;

    this.form.addEventListener("submit", (e) => this.handleToEmailClick(e));
  }

  goBackToEmailForm(fName, lName, email) {
    this.hrTwo.style.backgroundColor = "black";
    this.pTwo.style.cssText = "background-color: black;";
    this.form.innerHTML = `
      <h6>Email</h6>
      <input id="email" type="email" value="${email}" required />
      <p class="valid-email"></p>
      <h6>Image</h6>
      <input type="file" id="fileUpload" name="file-upload" style="font-size: 10px;" />
      <p class="valid-file"></p>
      <button type="submit" id="toPassword">NEXT</button><br>
      <button type="button" id="previousToName">PREVIOUS</button>
    `;

    document
      .getElementById("fileUpload")
      .addEventListener("change", (e) => this.handleFileUpload(e));
    this.form.addEventListener("submit", (e) =>
      this.toPasswordForm(e, fName, lName)
    );
    document
      .getElementById("previousToName")
      .addEventListener("click", () => this.goBackToNameForm(fName, lName));
  }

  toStart(e) {
    e.preventDefault();

    const userName = document.getElementById("user").value;
    const password = document.getElementById("logInPass").value;
    const validUser = document.querySelector(".valid-user");
    const validLoginPass = document.querySelector(".valid-login-pass");

    const account = this.accounts.find(
      (acc) => acc.email === userName && acc.password === password
    );

    if (account) {
      this.registrationSection.style.display = "none";
      this.examSection.style.display = "block";
    } else {
      validUser.innerHTML = "Invalid username or password.";
      validLoginPass.innerHTML = "Invalid username or password.";
    }

    document.querySelector(".q").addEventListener("click", () => {
      this.handleExamStart();
    });
  }

  handleExamStart() {
    fetch("./JS/api.json")
      .then((res) => res.json())
      .then((data) => {
        setTimeout(() => {
          this.question(data);
          if (!this.timerStarted) {
            this.startTimer();
            this.timerStarted = true;
          }
        }, 1500);
      });

    const fName = this.accounts[0]?.firstName || "User";
    const lName = this.accounts[0]?.lastName || "";
    const image = sessionStorage.getItem("uploadedImage") || "";
    this.div.classList.add("active");
    this.photo.src = image;
    this.name.innerText = `${fName} ${lName}`;
    this.sidePanel.style.display = "flex";
    this.progBar.style.display = "block";
    this.ldiv.style.flex = "100%";

    if (this.t && this.ldiv.contains(this.t)) {
      this.ldiv.removeChild(this.t);
    }

    if (
      this.rDiv &&
      this.examSection.querySelector(".main-2").contains(this.rDiv)
    ) {
      this.examSection.querySelector(".main-2").removeChild(this.rDiv);
    }

    this.div.removeEventListener("click", this.handleExamStart.bind(this));
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timeOver();
      } else {
        this.timeLeft--;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`;
        const progressPercent =
          ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        this.progressPercentage.textContent = `${Math.round(progressPercent)}%`;
      }
    }, 1000);
  }

  logout() {
    sessionStorage.clear();
    window.location.reload();
  }

  handleSubmit() {
    this.stopTimer();
    fetch("./JS/api.json")
      .then((res) => res.json())
      .then((data) => {
        this.result(data);
      });
  }

  question(data) {
    if (!this.timeLeft) {
      this.timeLeft = this.totalTime;
    }

    if (this.num < 1) this.num = 1;
    if (this.num > 10) this.num = 10;

    const currentQuestion = data[0][this.num];

    this.div.innerHTML = `
      <div class="quiz-container">
        <div class="question-header">
          <p>Question ${this.num}:</p>
          <h2>${currentQuestion.question}</h2>
        </div>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="answerOne">${
            currentQuestion.answerOne
          }</button>
          <button class="quiz-option" data-answer="answerTwo">${
            currentQuestion.answerTwo
          }</button>
          <button class="quiz-option" data-answer="answerThree">${
            currentQuestion.answerThree
          }</button>
          <button class="quiz-option" data-answer="answerFour">${
            currentQuestion.answerFour
          }</button>
        </div>
        <div class="quiz-navigation">
          <button class="nav-btn prev">Previous</button>
          <div class="pagination">
            <button class="flag-btn">🚩</button>
            <div>
              ${[...Array(10)]
                .map(
                  (_, idx) =>
                    `<span class="dot ${
                      idx === this.num - 1 ? "active" : ""
                    }"></span>`
                )
                .join("")}
            </div>
          </div>
          <button class="nav-btn next">Next</button>
        </div>
      </div>
    `;

    this.updateNavigationButtons();
    this.handlePagination(data);
    this.handleFlagging();
    this.handleAnswerSelection();

    document.querySelector(".next").addEventListener("click", () => {
      if (this.num < 10) {
        this.num++;
        this.question(data);
      }
    });

    document.querySelector(".prev").addEventListener("click", () => {
      if (this.num > 1) {
        this.num--;
        this.question(data);
      }
    });
  }

  updateNavigationButtons() {
    const prevBtn = this.examSection.querySelector(".prev");
    const nextBtn = this.examSection.querySelector(".next");

    if (this.num === 1) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "inline-block";
    }

    if (this.num === 10) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-block";
    }
  }

  handlePagination(data) {
    const spans = this.examSection.querySelectorAll(".dot");
    spans.forEach((span, index) => {
      if (index === this.num - 1) {
        span.classList.add("active");
      } else {
        span.classList.remove("active");
      }
      span.addEventListener("click", () => {
        this.num = index + 1;
        this.question(data);
      });
    });
  }

  handleFlagging() {
    const flagBtn = this.examSection.querySelector(".flag-btn");
    flagBtn.addEventListener("click", () => {
      if (!this.flaggedQuestions.has(this.num)) {
        this.flaggedQuestions.add(this.num);
        this.updateFlaggedQuestionsList();
      } else {
        this.flaggedQuestions.delete(this.num);
        this.updateFlaggedQuestionsList();
      }
    });
  }

  updateFlaggedQuestionsList() {
    this.flags.innerHTML = "";
    this.flaggedQuestions.forEach((questionNumber) => {
      const flag = document.createElement("div");
      flag.classList.add("flag");
      flag.textContent = `Question ${questionNumber}`;
      flag.addEventListener("click", () => {
        this.num = questionNumber;
        fetch("./JS/api.json")
          .then((res) => res.json())
          .then((data) => this.question(data));
      });
      this.flags.appendChild(flag);
    });
  }

  handleAnswerSelection() {
    const selectedAnswer = this.selectedAnswers[this.num];
    if (selectedAnswer) {
      const selectedOption = this.div.querySelector(
        `.quiz-option[data-answer="${selectedAnswer}"]`
      );
      if (selectedOption) {
        selectedOption.classList.add("selected");
      }
    }

    const answers = this.div.querySelectorAll(".quiz-option");
    answers.forEach((option) => {
      option.addEventListener("click", () => {
        answers.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
        const answerKey = option.getAttribute("data-answer");
        this.selectedAnswers[this.num] = answerKey;
      });
    });
  }

  handleSubmit() {
    this.stopTimer();
    fetch("./JS/api.json")
      .then((res) => res.json())
      .then((data) => {
        this.result(data);
      });
  }

  result(data) {
    let numCorrect = 0;
    for (let i = 1; i <= 10; i++) {
      if (data[0][i].correct === this.selectedAnswers[i]) {
        numCorrect++;
      }
    }
    this.displayResult(numCorrect);
  }

  displayResult(numCorrect) {
    this.examSection.style.display = "none";
    this.resultSection.style.display = "block";

    if (numCorrect === 10) {
      this.resultSection.innerHTML = `
        <div class="main-4">
          <div class="left">
            <h3>YOU GOT THE FULL MARK <br>
              10/10</h3>
          </div>
          <div class="right">
            <img src="./img/3427112.jpg" alt="">
          </div> 
        </div>
      `;
    } else {
      this.resultSection.innerHTML = `
        <div class="main-3">
          <div class="left">
            <p>Hi ${this.fName} ${this.lName}<br>
              your score is <span>${numCorrect}/10</span></p>
            <button class="retake">Retake</button>
          </div>
          <div class="right">
            <img src="./img/survey.png" alt="">
          </div>
        </div>
      `;
      document.querySelector(".retake").addEventListener("click", () => {
        window.location.reload();
      });
    }
  }

  timeOver() {
    this.examSection.style.display = "none";
    this.resultSection.style.display = "block";

    this.resultSection.innerHTML = `
      <div class="main-5">
        <div class="mid">
          <i class="fa-regular fa-clock"></i>
          <p>Sorry, Your time is out</p>
          <button class="retake">Retake</button>
        </div>
      </div>
    `;
    document.querySelector(".retake").addEventListener("click", () => {
      window.location.reload();
    });
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});

class Exam {
  constructor() {
    this.main = document.querySelector(".main-2");
    this.sidePanel = document.querySelector(".side-panel");
    this.progBar = document.querySelector(".main-2 .progress-bar");
    this.ldiv = document.querySelector(".main-2 .left");
    this.t = this.ldiv.querySelector(".t");
    this.div = document.querySelector(".main-2 .left .q");
    this.rDiv = this.main.querySelector(".right");
    this.name = document.querySelector(".user-info > p");
    // this.image = document.querySelector(".user-info > img");
    this.accounts = JSON.parse(sessionStorage.getItem('accounts')) || [];
    this.fName = this.accounts[0]?.firstName || 'User';
    this.lName = this.accounts[0]?.lastName || '';
    this.flags = document.querySelector(".content .flags");
    this.logOut = document.querySelector(".logout-btn");
    this.progressBar = document.querySelector(".progress");
    this.progressPercentage = document.querySelector(".progress-percentage");
    this.timerDisplay = document.querySelector(".timer");


    this.totalTime = 1 * 60;
    this.timeLeft = this.totalTime;
    this.timerStarted = false;

    this.num = 1;
    this.selectedAnswers = {};
    this.flaggedQuestions = new Set();

    this.div.addEventListener('click', this.handleEvent.bind(this));
    this.logOut.addEventListener("click", this.logout.bind(this));
    const submit = document.querySelector(".submit-btn");
    submit.addEventListener("click", this.handleSubmit.bind(this));
  }
  
  startTimer() {
    const countdown = setInterval(() => {
      if (this.timeLeft <= 0) {
        clearInterval(countdown);
        this.timeOver();
      } else {
        this.timeLeft--;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        const progressPercent = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        this.progressPercentage.textContent = `${Math.round(progressPercent)}%`;
      }
    }, 1000);
  }

  logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
  }

  handleEvent() {
    fetch("./JS/api.json")
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          this.question(data);
          if (!this.timerStarted) {
            this.startTimer();
            this.timerStarted = true;
          }
        }, 1500);
      });

    this.div.classList.add('active');
    this.sidePanel.style.display = "flex";
    this.name.innerHTML = `${this.fName} ${this.lName}`;
    this.progBar.style.display = "block";
    this.ldiv.style.flex = "100%";

    if (this.t && this.ldiv.contains(this.t)) {
      this.ldiv.removeChild(this.t);
    }

    if (this.rDiv && this.main.contains(this.rDiv)) {
      this.main.removeChild(this.rDiv);
    }

    this.div.removeEventListener('click', this.handleEvent.bind(this));
  }

  question(data) {
    if (!this.timeLeft) {
      this.timeLeft = this.totalTime;
    }

    this.div.innerHTML = `
      <div class="quiz-container">
        <div class="question-header">
          <p>Question ${this.num}:</p>
          <h2>${data[0][this.num].question}</h2>
        </div>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="answerOne">${data[0][this.num].answerOne}</button>
          <button class="quiz-option" data-answer="answerTwo">${data[0][this.num].answerTwo}</button>
          <button class="quiz-option" data-answer="answerThree">${data[0][this.num].answerThree}</button>
          <button class="quiz-option" data-answer="answerFour">${data[0][this.num].answerFour}</button>
        </div>
        <div class="quiz-navigation">
          <button class="nav-btn prev">Previous</button>
          <div class="pagination">
            <button class="flag-btn">🚩</button>
            <div>
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
          <button class="nav-btn next">Next</button>
        </div>
      </div>
      `;

    this.updateNavigationButtons();
    this.handlePagination(data);
    this.handleFlagging(data);
    this.handleAnswerSelection(data);

    document.querySelector(".next").addEventListener("click", () => {
      this.num++;
      this.question(data);
    });

    document.querySelector(".prev").addEventListener("click", () => {
      this.num--;
      this.question(data);
    });
  }

  updateNavigationButtons() {
    if (this.num === 1) {
      document.querySelector(".prev").style.display = "none";
    } else {
      document.querySelector(".prev").style.display = "inline-block";
    }

    if (this.num === 10) {
      document.querySelector(".next").style.display = "none";
    } else {
      document.querySelector(".next").style.display = "inline-block";
    }
  }

  handlePagination(data) {
    const spans = document.querySelectorAll('.dot');
    spans.forEach((span, index) => {
      if (index === this.num - 1) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
      span.addEventListener('click', () => {
        this.num = index + 1;
        this.question(data);
      });
    });
  }

  handleFlagging(data) {
    document.querySelector(".flag-btn").addEventListener("click", () => {
      if (!this.flaggedQuestions.has(this.num)) {
        this.flaggedQuestions.add(this.num);
        this.updateFlaggedQuestionsList(data);
      }
    });
  }

  handleAnswerSelection(data) {
    if (this.selectedAnswers[this.num]) {
      const selectedOption = document.querySelector(`.quiz-option[data-answer="${this.selectedAnswers[this.num]}"]`);
      if (selectedOption) {
        selectedOption.classList.add('selected');
      }
    }

    const answers = document.querySelectorAll('.quiz-option');
    answers.forEach(option => {
      option.addEventListener('click', () => {
        answers.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        const answerKey = option.getAttribute('data-answer');
        this.selectedAnswers[this.num] = answerKey;
      });
    });
  }

  updateFlaggedQuestionsList(data) {
    this.flags.innerHTML = '';
    this.flaggedQuestions.forEach(questionNumber => {
      const flag = document.createElement('div');
        flag.classList.add('flag');
        flag.textContent = `Question ${questionNumber}`;
        flag.addEventListener('click', () => {
          this.num = questionNumber;
          this.question(data);
        });
      this.flags.appendChild(flag);
    });
  }

  handleSubmit() {
    this.stopTimer()
    fetch("./JS/api.json")
      .then(res => res.json())
      .then(data => {
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
    const mainContainer = document.querySelector(".main-container");
    if (numCorrect === 10) {
      window.location.href = "result.html";
    } else {
      mainContainer.innerHTML = `
        <div class="main-3">
          <div class="left">
            <p>Hi ${this.fName} ${this.lName}<br>
              your score is <span>${numCorrect}/10</span></p>
            <button class="retake">Retake</button>
          </div>
          <div class="right">
            <img src="../img/Customer Survey-rafiki.png" alt="">
          </div>
        </div>
      `;
      document.querySelector(".retake").addEventListener("click", () => {
        window.location.reload();
      });
    }
  }

  timeOver() {
    const mainContainer = document.querySelector(".main-container");
    mainContainer.innerHTML = `
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
  const imageDataURL = sessionStorage.getItem('uploadedImage');
  if (imageDataURL) {
    document.querySelector(".user-info > img").src = imageDataURL;
  } else {
    document.querySelector(".user-info > img").alt = 'No image uploaded';
  }
  new Exam();
});
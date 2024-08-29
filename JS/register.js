class Register {
  constructor() {
    this.hrOne = document.querySelector(".one");
    this.hrTwo = document.querySelector(".two");
    this.pOne = document.querySelector(".div1 > p");
    this.pTwo = document.querySelector(".div2 > p");
    this.toEmail = document.getElementById("toEmail");
    this.form = document.getElementById("form");
    this.firstName = document.getElementById("firstName");
    this.lastName = document.getElementById("lastName");
    this.validFirst = document.querySelector(".valid-first");
    this.validLast = document.querySelector(".valid-last");
    this.leftDiv = document.querySelector(".log-left");
    this.rightDiv = document.querySelector(".log-right");
    
    this.accounts = JSON.parse(sessionStorage.getItem('accounts')) || [];
    this.init();
  }

  init() {
    this.toEmail.addEventListener("click", (e) => this.handleToEmailClick(e));
  }

  storeAccount(firstName, lastName, email, password) {
    this.accounts.push({ firstName, lastName, email, password });
    sessionStorage.setItem('accounts', JSON.stringify(this.accounts));
  }

  handleToEmailClick(e) {
    e.preventDefault();

    const fName = this.firstName.value;
    const lName = this.lastName.value;

    if (fName && lName) {
      this.showEmailForm(fName, lName);
      this.hrOne.style.backgroundColor = "green";
      this.pOne.style.cssText = "background-color: green;";
    } else {
      this.validFirst.innerHTML = `Please enter a valid First Name`;
      this.validLast.innerHTML = `Please enter a valid Last Name`;
    }
  }

  showEmailForm(fName, lName) {
    this.form.innerHTML = `
      <h6>Email</h6>
      <input id="email" type="text" />
      <p class="valid-email"></p>
      <h6>Image</h6>
      <input type="file" id="fileUpload" name="file-upload" style="font-size: 10px;">
      <p class="valid-file"></p>
      <button id="toPassword">NEXT</button><br>
      <button id="previousToName">PREVIOUS</button>
    `;

    document.getElementById('fileUpload').addEventListener('change', (e) => this.handleFileUpload(e));
    document.getElementById('toPassword').addEventListener('click', (e) => this.toPasswordForm(e, fName, lName));
    document.getElementById('previousToName').addEventListener('click', (e) => this.goBackToNameForm(e));
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataURL = e.target.result;
        sessionStorage.setItem('uploadedImage', imageDataURL);
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
      <input id="password" type="password" />
      <p class="valid-pass"></p>
      <h6>Re-enter Password</h6>
      <input id="Re-enter" type="password" />
      <p class="valid-rePass"></p>
      <button id="toLogIn">NEXT</button><br>
      <button id="previousToEmail">PREVIOUS</button>
    `;

    document.getElementById('toLogIn').addEventListener('click', (e) => this.toLogInForm(e, fName, lName, email));
    document.getElementById('previousToEmail').addEventListener('click', (e) => this.goBackToEmailForm(e, fName, lName, email));
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
      validPass.innerHTML = "Password must be at least 6 characters and contain a symbol";
      validReEnter.innerHTML = `The Passwords do not match`;
    }
  }

  showLoginForm() {
    const topDiv = document.querySelector(".log-left-top");

    topDiv.innerHTML = "";
    this.form.innerHTML = `
      <h6>USERNAME</h6>
      <input id="user" type="text" required />
      <p class="valid-user"></p>
      <h6>PASSWORD</h6>
      <input id="logInPass" type="password" required />
      <p class="valid-login-pass"></p>
      <button id="toQuiz">LOG IN</button>
    `;

    this.rightDiv.innerHTML = `
      <h3>Welcome Back!</h3>
      <p>To keep connected with us, please log in with your personal information</p>
    `;

    this.leftDiv.classList.toggle("move");
    this.rightDiv.classList.toggle("move");

    document.getElementById("toQuiz").addEventListener("click", (e) => this.toStart(e));
  }

  toStart(e) {
    e.preventDefault();

    const userName = document.getElementById("user").value;
    const password = document.getElementById("logInPass").value;
    const validUser = document.querySelector(".valid-user");
    const validLoginPass = document.querySelector(".valid-login-pass");

    const account = this.accounts.find(acc => acc.email === userName && acc.password === password);

    if (account) {
      window.location.href = "exam.html";
    } else {
      validUser.innerHTML = "Invalid username or password.";
      validLoginPass.innerHTML = "Invalid username or password.";
    }
  }

  goBackToNameForm(e) {
    e.preventDefault();

    this.form.innerHTML = `
      <h6>First Name</h6>
      <input id="firstName" type="text" value="${this.firstName.value}" />
      <p class="valid-first"></p>
      <h6>Last Name</h6>
      <input id="lastName" type="text" value="${this.lastName.value}" />
      <p class="valid-last"></p>
      <button id="toEmail">NEXT</button>
    `;

    document.getElementById('toEmail').addEventListener('click', (e) => this.handleToEmailClick(e));
  }

  goBackToEmailForm(e, fName, lName, email) {
    e.preventDefault();

    this.form.innerHTML = `
      <h6>Email</h6>
      <input id="email" type="text" value="${email}" />
      <p class="valid-email"></p>
      <h6>Image</h6>
      <input type="file" id="file-upload" name="file-upload" style="font-size: 10px;">
      <p class="valid-file"></p>
      <button id="toPassword">NEXT</button><br>
      <button id="previousToName">PREVIOUS</button>
    `;

    document.getElementById('toPassword').addEventListener('click', (e) => this.toPasswordForm(e, fName, lName));
    document.getElementById('previousToName').addEventListener('click', (e) => this.goBackToNameForm(e));
  }
}


document.addEventListener('DOMContentLoaded', () => {
  new Register();
});

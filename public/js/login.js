console.log('fuck');

const loginFormHandler = async (event) => {
    event.preventDefault();

    const emailLogin = document.getElementById('email-login').value.trim();
    const passwordLogin = document.getElementById('password-login').value.trim();

    if (emailLogin && passwordLogin) {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({
            email: emailLogin,
            password: passwordLogin
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        document.location.replace('/');
      } else {
        alert('Failed to log in.');
      }
    }
};

const signupFormHandler = async (event) => {
    event.preventDefault();

    const emailSignup = document.getElementById('email-signup').value.trim();
    const passwordSignup = document.getElementById('password-signup').value.trim();
    const username = document.getElementById('username').value.trim();

    if (username && emailSignup && passwordSignup) {
      const response = await fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({
            user_name: username,
            email: emailSignup,
            password: passwordSignup }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        document.location.replace('/');
      } else {
        alert('Failed to sign up.');
      }
    }
};

async function updateCoin() {
  const response = await fetch('/api/coin/price', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.ok) {
    console.log('coin updated');
  } else {
    alert('Failed to update coins.');
  }
}

const submitLogin = document.getElementById('submit-login');
const submitSignup = document.getElementById('submit-signup');

submitLogin.addEventListener('click', () => {
  updateCoin();
  loginFormHandler();
});
submitSignup.addEventListener('click', () => {
  updateCoin();
  signupFormHandler();
});
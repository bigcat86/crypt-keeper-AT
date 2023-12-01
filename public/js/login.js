const loginFormHandler = async (event) => {
  // event.preventDefault();

  const emailLogin = document.getElementById('email-login').value.trim();
  const passwordLogin = document.getElementById('password-login').value.trim();

  if (emailLogin && passwordLogin) {
      try {
          const response = await fetch('/api/user/login', {
              method: 'POST',
              body: JSON.stringify({
                  email: emailLogin,
                  password: passwordLogin
              }),
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
                window.location.href = result.redirectTo;
            } else {
                alert('Failed to log in');
            }
        } else {
            const errorData = await response.json();
            alert('Failed to log in: ' + errorData.message);
        }
        
      } catch (error) {
          alert(`THIS IS YOUR ERROR: ${error}`);
      }
  } else {
      alert('Please enter both email and password.');
  }
};

const demoLogin = async (event) => {
  // event.preventDefault();

      try {
          const response = await fetch('/api/user/login', {
              method: 'POST',
              body: JSON.stringify({
                  email: 'demo@cryptkeeper.com',
                  password: 'password'
              }),
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
                window.location.href = result.redirectTo;
            } else {
                alert('Failed to log in');
            }
        } else {
            const errorData = await response.json();
            alert('Failed to log in: ' + errorData.message);
        }
        
      } catch (error) {
          alert(`THIS IS YOUR ERROR: ${error}`);
      }
  };

const signupFormHandler = async () => {
    // event.preventDefault();

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
  // event.preventDefault();

  const response = await fetch('/api/coin/price', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.ok) {
    console.log('coin updated');
  } else {
    alert('Failed to update coins.');
  }
};

const submitLogin = document.getElementById('submit-login');
const submitSignup = document.getElementById('submit-signup');
const demoButton = document.getElementById('demo-button');

submitLogin.addEventListener('click',() => {
  updateCoin();
  loginFormHandler();
});

demoButton.addEventListener('click', () => {
  updateCoin();
  demoLogin();
});

submitSignup.addEventListener('click', () => {
  updateCoin();
  signupFormHandler();
});
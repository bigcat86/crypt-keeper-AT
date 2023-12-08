// Buy button -- working
async function handleBuyClick() {
    try {

        const coinId = document.querySelector('#buycoin').value;
        const quantity = document.querySelector('#quantity').value;

        const response = await fetch('/api/portfolio/coin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            coin_name: coinId, 
            quantity: quantity 
        }),
    });

    console.log(`bought ${coinId}`)

    } catch (error) {
        alert(error);
    }
};

// Sell button -- working
const handleSellClick = async (event) => {
    event.preventDefault();
    try {
        const id = 1;
        const coin = document.querySelector('[id^="sell-"]').value
            console.log(`${coin}`);
        const response = await fetch(`/api/portfolio/coin`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin_name: coin })
      });
       
      console.log('coin sold');

    } catch (error) {
        alert(error);
    }
};

// Refresh button -- in progress
async function handleRefreshClick(event) {
    event.preventDefault();
    location.reload()
    //save new portfolio value
    try {
        const refreshValue = document.querySelector('#port-value').value;
        console.log(refreshValue);
    } catch (error) {
        
    }
};

// refresh coin prices on dropdown click -- in progress (not rendering)
const handleBuyRefresh = async (event) => {
    event.preventDefault();
   try {
        console.log('clicky click')
        const response = await fetch('/api/coin/price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    })
    
    if (response.ok) {
        const data = await response.json();
        console.log(data);
    }
    } catch (error) {
      alert(error);
   }
}

// logout -- working
const handleLogout = async (event) => {
    event.preventDefault();
   
    const response = await fetch('/api/user/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
        document.location.replace('/login');
      } else {
        alert(response.statusText);
      }
};

const handleGPT = async (event) => {
    event.preventDefault();
    const gptBody = document.querySelector('#gpt-body')
    const response = await fetch('/api/portfolio/3/gpt', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
        const gpt = await response.json();
        const spinner = document.querySelector('#spinner');
        const gimme = document.querySelector('#gimme');
        const gptEl = document.createElement('div');
        if(gptEl) {
            spinner.style.display = 'none';
            gimme.style.display = 'none';
        }
        gptEl.innerHTML = gpt;
        gptBody.appendChild(gptEl);
      } else {
        alert(response.statusText);
      }
}

const handleDeposit = async (event) => {
    console.log('deposit clicked')  
    event.preventDefault();
    const deposit = document.querySelector('#depositAmount').value.trim();
    const depositNUmber = Number(deposit);

    const response = await fetch('/api/portfolio/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit: depositNUmber })
    })
    if (response.ok) {
        const data = await response.json();
        window.location.reload();
        console.log(data);
      } else {
        alert(response.statusText);
      }
}

// Define buttons
const buyButton = document.querySelector('#buy');
const sellButton = document.querySelector('#sell');
const refreshButton = document.querySelector('#refresh');
const buyRefreshButton = document.querySelector('#buyRefresh');
const logoutButton = document.getElementById('logout');
const gptButton = document.getElementById('gpt');
const depositButton = document.querySelector('#deposit');
// Add event listeners to the buttons
buyButton.addEventListener('click', handleBuyClick);
sellButton.addEventListener('click', handleSellClick);
refreshButton.addEventListener('click', handleRefreshClick);
// buyRefreshButton.addEventListener('click', handleBuyRefresh);
logoutButton.addEventListener('click', handleLogout);
gptButton.addEventListener('click', handleGPT);
depositButton.addEventListener('click', handleDeposit);

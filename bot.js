const botList = document.querySelector(".bot-list");
const botName = document.querySelector(".bot-name");
const apiKey = document.querySelector(".api-key");
const apiSecret = document.querySelector(".api-secret");
const environment = document.querySelector(".environment");
const domain = document.querySelector(".domain");
const header = document.querySelector(".header");
// const headerSwitch = document.querySelector(".header-switch");
const onlineStatus = document.querySelector(".online-status-text");
const onlineStatusImage = document.querySelector(".online-status-image");
const leftArrow = document.querySelector(".left-arrow-icon");
const rightArrow = document.querySelector(".right-arrow-icon");
const botAddDiv = document.querySelector(".bot-cred-input");
const chatBotPluginSrc = "http://192.168.56.1:3000"; // ! For local development only, should be changed while pushing
// const chatBotPluginSrc = "http://35.233.213.62:3000/"; // For Dev

// headerSwitch.addEventListener("change", () => {
//   toggleHeaderSwitch();
// });
/**
 *  Creates bot list from botInfo stored in localStorage
 */
const createStoredBotList = () => {
  const storedBotList = JSON.parse(localStorage.getItem("botInfo-List"));

  storedBotList.forEach((bot) => {
    console.log("adding Stored bot");
    const botNameValue = bot.botName;
    const apiKeyValue = bot.apiKey;
    const apiSecretValue = bot.apiSecret;
    const environment = bot.environment;
    const domain = bot.domain;
    let isActive;

    if (getLocalStorageItem("currentBot") !== null) {
      const currentBotInfo = getLocalStorageItem("currentBot");
      isActive = currentBotInfo.apiSecret === apiSecretValue;
    } else {
      isActive = false;
    }

    const botItem = createBot(
      botNameValue,
      apiKeyValue,
      apiSecretValue,
      environment,
      domain,
      isActive,
      environment
    );

    botList.append(botItem);
  });
};
/**
 * Creates a botItem from the given parameters
 *
 * @param  {string} botNameValue botname value taken from the input
 * @param  {string} apiKeyValue apiKey value taken from the input
 * @param  {string} apiSecretValue apiSecret value taken from the input
 * @param  {string} environment the environment the bot runs in
 * @param  {boolean} isActive check to see if the current bot is active
 */
const createBot = (
  botNameValue,
  apiKeyValue,
  apiSecretValue,
  environment,
  domain,
  isActive,
  env
) => {
  const botItem = document.createElement("div"); //  Bot Item
  botItem.classList.add("bot-item");

  isActive && botItem.classList.add("active");

  botItem.innerHTML += `
  <div class="card-side chatBot-card-front-side">
  <div class="bot-item-text">
  <div class="bot-item-header">
    <img
      class="bot-item-botImg"
      src="./assets/robot-fill.svg"
      alt="bot"
    />
    <h2 class="bot-item-header-text">${botNameValue}</h2>
  </div>
  <ul class="bot-item-details">
    <li>
      <span class="bot-item-details-key">ApiKey:</span> ${apiKeyValue}
    </li>
    <li>
      <span class="bot-item-details-key">ApiSecret:</span>
      ${apiSecretValue}
    </li>
    <li>
      <span class="bot-item-details-key">Environment:</span>
      ${environment}
    </li>
    <li>
      <span class="bot-item-details-key">Domain:</span>
     ${domain}
    </li>
  </ul>
</div>
</>
 `;

  const chatBot_backSide = document.createElement("div");
  chatBot_backSide.classList.add("card-side");
  chatBot_backSide.classList.add("chatBot-card-back-side");

  const buttonWrapper = document.createElement("div");
  buttonWrapper.classList.add("button-wrapper");

  const deleteButton = document.createElement("button"); //  Initate Button
  deleteButton.classList.add("delete-button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteBotItem(apiSecretValue, botItem);
  });
  buttonWrapper.append(deleteButton);

  const initiateButton = document.createElement("button"); //  Initate Button
  initiateButton.classList.add("initiate-button");
  initiateButton.innerText = "Initiate";
  initiateButton.addEventListener("click", () => {
    initiateChatBot(botNameValue, apiKeyValue, apiSecretValue, domain, env);
  });
  buttonWrapper.append(initiateButton);
  chatBot_backSide.append(buttonWrapper);

  botItem.append(chatBot_backSide);

  return botItem;
};
/**
 * Adds a botItem to the list after it is created
 */
const addBot = () => {
  console.log("addbot called");
  const botNameValue = botName.value;
  const apiKeyValue = apiKey.value;
  const apiSecretValue = apiSecret.value;
  const environmentValue = environment.value;
  const domainValue = domain.value;
  if (
    botNameValue &&
    apiKeyValue &&
    apiSecretValue &&
    environmentValue &&
    domainValue
  ) {
    createNewBotItem();
  } else {
    alert("input fields cannot be empty");
  }
};
const removeUser = () => {
  const keysToRemove = [
    "customerData",
    "mappingId",
    "anydoneSession",
    "anydoneApiKeyData",
  ];

  for (key of keysToRemove) {
    localStorage.removeItem(key);
  }
  window.location.reload();
};
/**
 * Create a botItem from the data taken from the input
 */
const createNewBotItem = () => {
  console.log("createbotItem called");
  const botNameValue = botName.value;
  const apiKeyValue = apiKey.value;
  const apiSecretValue = apiSecret.value;
  const environmentValue = environment.value;
  const domainValue = domain.value;

  saveInfoToLocalStorage(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue,
    domainValue
  );

  const botItem = createBot(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue,
    domainValue,
    false
  );

  botList.append(botItem);
  console.log(botList);

  apiKey.value = "";
  botName.value = "";
  apiSecret.value = "";
  environment.value = "";
  domain.value = "";
};
/**
 * Initiate the bot
 *
 * @param  {string} botName
 * @param  {string} apiKey
 * @param  {string} apiSecret
 */
const initiateChatBot = (botName, apiKey, apiSecret, domain, env) => {
  console.log("chat bot initialized");

  const currentBotInfo = getLocalStorageItem("currentBot");
  if (currentBotInfo !== null) {
    if (currentBotInfo.apiKey === apiKey) {
      //  if the initiated chatbot is the same as the currentBot saved in localStorage then do not remove localstorage data
      const currentIframe = document.getElementById("anydone-chat-id");
      if (currentIframe !== null) {
        removeCurrentIframe();
      }
      init_anydone_chat(apiKey, apiSecret, domain, env);
      window.location.reload();
    } else {
      removeCurrentIframe();
      removeBotKeyDataFromLocalStorage();
      saveCurrentBotData(botName, apiKey, apiSecret, domain, env);

      init_anydone_chat(apiKey, apiSecret, domain, env);
      window.location.reload();
    }
  } else {
    removeCurrentIframe();
    saveCurrentBotData(botName, apiKey, apiSecret, domain, env);
    removeBotKeyDataFromLocalStorage();

    init_anydone_chat(apiKey, apiSecret, domain, env);
    window.location.reload();
  }
};
/**
 * Save the botInfo to localStorage
 *
 * @param  {string} botName
 * @param  {string} apiKey
 * @param  {string} apiSecret
 */
const saveCurrentBotData = (botName, apiKey, apiSecret, domain, env) => {
  const botInfo = {
    botName,
    apiKey,
    apiSecret,
    domain,
    env,
  };
  localStorage.setItem("currentBot", JSON.stringify(botInfo));
};
/**
 * Remove specific keys from localStorage
 */
const removeBotKeyDataFromLocalStorage = () => {
  const keysToRemove = [
    "customerData",
    "mappingId",
    "anydoneSession",
    "anydoneApiKeyData",
  ];

  for (key of keysToRemove) {
    localStorage.removeItem(key);
  }
};
/**
 * Delete a bot item from the list
 *
 * @param  {string} apiSecret
 * @param  {Node} botItem
 */
const deleteBotItem = (apiSecret, botItem) => {
  console.log("delete bot action initiated");
  const savedBotInfoList = JSON.parse(localStorage.getItem("botInfo-List"));
  // console.log(savedBotInfoList);
  const filteredBotInfoList = savedBotInfoList.filter(
    (info) => info.apiSecret !== apiSecret
  );
  console.log(filteredBotInfoList);
  localStorage.setItem("botInfo-List", JSON.stringify(filteredBotInfoList));
  botItem.remove();
};
/**
 *  Save botInfo to the localstorage
 *
 * @param  {string} botName
 * @param  {string} apiKey
 * @param  {string} apiSecret
 * @param  {string} environment
 */
const saveInfoToLocalStorage = (
  botName,
  apiKey,
  apiSecret,
  environment,
  domain
) => {
  if (localStorage.getItem("botInfo-List") !== null) {
    const savedBotInfoList = JSON.parse(localStorage.getItem("botInfo-List"));
    const newBotCred = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
      environment: environment,
      domain: domain,
    };
    savedBotInfoList.push(newBotCred);
    localStorage.setItem("botInfo-List", JSON.stringify(savedBotInfoList));
  } else {
    const botInfoList = [];
    const botCred = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
      environment: environment,
      domain: domain,
    };
    botInfoList.push(botCred);
    localStorage.setItem("botInfo-List", JSON.stringify(botInfoList));
  }
};
/**
 * Removes the current iFrame while a new one is being initiated
 */
const removeCurrentIframe = () => {
  console.log("removing previous iframe");
  const currentIframe = document.getElementById("anydone-chat-id");
  if (currentIframe !== null) {
    currentIframe.remove();
  }
};
/**
 * Toggle between prod and dev switch and save data to LocalStorage
 * also switches the env info of the plugin using postmessage
 */
// const toggleHeaderSwitch = () => {
//   if (headerSwitch.checked) {
//     console.log("header switch checked");
//     setLocalStorageItem("environment", "Production");
//     // post("Switch-Environment", "Production");
//   } else {
//     console.log("header switch unchecked");
//     setLocalStorageItem("environment", "Development");
//     // post("Switch-Environment", "Development");
//   }
// };
/**
 * Creates a data object from the parameters given and postsMessage to iFrame source
 *
 * @param  {string} action
 * @param  {any} value
 */
const post = (action, value) => {
  let data = {
    type: action,
  };

  if (value) {
    data.message = value;
  }
  let message = JSON.stringify(data);
  const currentIframe = document.getElementById("anydone-chat-id");
  currentIframe.contentWindow.postMessage(message, chatBotPluginSrc);
};
/**
 * Check to see if the network is active
 */
const checkOnlineStatus = async () => {
  try {
    const online = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    return online.status >= 200 && online.status < 300;
  } catch (error) {
    return false;
  }
};
/**
 * Checks the internet status every 15secs
 *
 * @param  {async} async
 */
// setInterval(async () => {
//   const result = await checkOnlineStatus();
//   setOnlineStatus(result);
//   // console.log(result);
// }, 15000);
/**
 * Changes the status icon and text for the network status given
 *
 * @param  {boolean} online
 */
const setOnlineStatus = (online) => {
  if (online) {
    onlineStatus.innerText = "Online";
    onlineStatusImage.setAttribute("src", "./assets/online.svg");
  } else {
    onlineStatus.innerText = "Offline";
    onlineStatusImage.setAttribute("src", "./assets/offline.svg");
  }
};

const createUserDataHeader = (customerData) => {
  const name = customerData.fullName;
  const email = customerData.email;
  const customerId = customerData.customerId;
  const mappingId = customerData.session[0].mappingId;
  const userDetailsWrapper = document.createElement("div");
  userDetailsWrapper.classList.add("user-details-wrapper");
  const userDetails = `
  <img src="./assets/user-fill.svg" alt="user" width="50" height="50" />
  <div class="user-data">
  <div><span class="user-data-key">Name:</span> ${name}</div>
          <div><span class="user-data-key">Email:</span>  ${email}</div>
          <div><span class="user-data-key">Mapping id:</span> ${customerId}</div>
          <div><span class="user-data-key">Customer id:</span> ${mappingId}</div>
  
  </div>
  `;
  userDetailsWrapper.innerHTML = userDetails;
  header.append(userDetailsWrapper);
  addRemoveUserButton();
};

const addRemoveUserButton = () => {
  const removeUserButton = document.createElement("button");
  removeUserButton.innerText = "New User";
  removeUserButton.classList.add("new-user-button");
  removeUserButton.type = "button";
  removeUserButton.addEventListener("click", () => {
    removeUser();
  });
  botAddDiv.append(removeUserButton);
};
/**
 * Adds botItems to the botList from the given list
 */
const addInitialBotList = () => {
  const initialBotInfoList = [
    // {
    //   apiKey: "dev_chat_bot_test",
    //   apiSecret: "EHZHc83AbELe",
    //   botName: "Nepal Police Bot",
    //   environment: "Production",
    //   domain: "http://nptest.nepalpolice.gov.np/",
    // },
    {
      apiKey: "anydone_bot",
      apiSecret: "wwohzI76SZdX",
      botName: "Treeleaf Bot",
      environment: "Production",
      domain: "http://treeleaf.ai",
    },
    {
      apiKey: "anydone_chat_plugin",
      apiSecret: "v08GQikEfLXY",
      botName: "Anydone Bot",
      environment: "Production",
      domain: "https://anydone.com",
    },
    {
      apiKey: "_new_testing",
      apiSecret: "rgmwHZR95pzj",
      botName: "Kshitij Dev TestBot",
      environment: "Development",
      domain: "35.233.213.62:3000",
    },
    {
      apiKey: "education_api_key",
      apiSecret: "idub0oI0AFMg",
      botName: "Education Bot",
      environment: "Development",
      domain: "35.233.213.62:3000",
    },
    {
      botName: "Automated Replies Test",
      apiKey: "Automated replies",
      apiSecret: "rqbABYdjKKXW",
      environment: "development",
      domain: "http://google.com",
    },
  ];
  setLocalStorageItem("botInfo-List", initialBotInfoList);
};

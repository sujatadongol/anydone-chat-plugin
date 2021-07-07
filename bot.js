const botList = document.querySelector(".bot-list");
const botName = document.querySelector(".bot-name");
const apiKey = document.querySelector(".api-key");
const apiSecret = document.querySelector(".api-secret");
const environment = document.querySelector(".environment");
const headerSwitch = document.querySelector(".header-switch");
const onlineStatus = document.querySelector(".online-status-text");
const onlineStatusImage = document.querySelector(".online-status-image");
// const chatBotPluginSrc = "http://192.168.56.1:3000"; // ! For local development only, should be changed while pushing
const chatBotPluginSrc = 'http://35.233.213.62:3000/'; // For Dev

headerSwitch.addEventListener("change", () => {
  toggleHeaderSwitch();
});
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
      isActive
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
  isActive
) => {
  const botItem = document.createElement("div"); //  Bot Item
  botItem.classList.add("bot-item");

  isActive && botItem.classList.add("active");

  botItem.innerHTML += `
  <div class="bot-item-text">
    <p class="bot-name">Bot: ${botNameValue}</p>
    <ul>
      <li><p>ApiKey = ${apiKeyValue}</p></li>
      <li><p>ApiSecret = ${apiSecretValue}</p></li>
      <li><p>Environment = ${environment}</p></li>
      <li>
        <span>Status = </span><span class="${
          isActive ? "active" : "inactive"
        }-status">${isActive ? "Active" : "Inactive"}</span>
      </li>
    </ul>
</div>`;

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
    initiateChatBot(botNameValue, apiKeyValue, apiSecretValue);
  });
  buttonWrapper.append(initiateButton);

  botItem.append(buttonWrapper);

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
  if (botNameValue && apiKeyValue && apiSecretValue && environmentValue) {
    createNewBotItem();
  } else {
    alert("input fields cannot be empty");
  }
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

  saveInfoToLocalStorage(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue
  );

  const botItem = createBot(
    botNameValue,
    apiKeyValue,
    apiSecretValue,
    environmentValue,
    false
  );

  botList.append(botItem);
  console.log(botList);

  apiKey.value = "";
  botName.value = "";
  apiSecret.value = "";
  environment.value = "";
};
/**
 * Initiate the bot
 *
 * @param  {string} botName
 * @param  {string} apiKey
 * @param  {string} apiSecret
 */
const initiateChatBot = (botName, apiKey, apiSecret) => {
  console.log("chat bot initialized");

  const currentBotInfo = getLocalStorageItem("currentBot");
  if (currentBotInfo !== null) {
    if (currentBotInfo.apiKey === apiKey) {
      //  if the initiated chatbot is the same as the currentBot saved in localStorage then do not remove localstorage data
      const currentIframe = document.getElementById("anydone-chat-id");
      if (currentIframe !== null) {
        removeCurrentIframe();
      }
      init_anydone_chat(apiKey, apiSecret);
      window.location.reload();
    } else {
      removeCurrentIframe();
      removeBotKeyDataFromLocalStorage();
      saveCurrentBotData(botName, apiKey, apiSecret);

      init_anydone_chat(apiKey, apiSecret);
      window.location.reload();
    }
  } else {
    removeCurrentIframe();
    saveCurrentBotData(botName, apiKey, apiSecret);
    removeBotKeyDataFromLocalStorage();

    init_anydone_chat(apiKey, apiSecret);
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
const saveCurrentBotData = (botName, apiKey, apiSecret) => {
  const botInfo = {
    botName: botName,
    apiKey: apiKey,
    apiSecret: apiSecret,
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
const saveInfoToLocalStorage = (botName, apiKey, apiSecret, environment) => {
  if (localStorage.getItem("botInfo-List") !== null) {
    const savedBotInfoList = JSON.parse(localStorage.getItem("botInfo-List"));
    const newBotCred = {
      botName: botName,
      apiKey: apiKey,
      apiSecret: apiSecret,
      environment: environment,
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
const toggleHeaderSwitch = () => {
  if (headerSwitch.checked) {
    console.log("header switch checked");
    setLocalStorageItem("environment", "Production");
    post("Switch-Environment", "Production");
  } else {
    console.log("header switch unchecked");
    setLocalStorageItem("environment", "Development");
    post("Switch-Environment", "Development");
  }
};
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
    // },
    {
      apiKey: "education_api_key",
      apiSecret: "idub0oI0AFMg",
      botName: "Education Bot",
      environment: "Development",
    },
    // {
    //   apiKey: "_new_testing",
    //   apiSecret: "rgmwHZR95pzj",
    //   botName: "Kshitij Dev TestBot",
    //   environment: "Development",
    // },
  ];
  setLocalStorageItem("botInfo-List", initialBotInfoList);
};

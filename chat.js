function init_anydone_chat(apiKey, apiSecret) {
  const chatPluginSrc = "https://chatplugin.anydone.com/";

  const apiKeyEl = document.createElement("input");
  apiKeyEl.hidden = true;
  apiKeyEl.id = "anydone-chat-plugin-api-key";
  apiKeyEl.value = apiKey;

  const apiSecEl = document.createElement("input");
  apiSecEl.hidden = true;
  apiSecEl.id = "anydone-chat-plugin-api-secret";
  apiSecEl.value = apiSecret;

  const bodyTag = document.body;
  bodyTag.appendChild(apiKeyEl);
  bodyTag.appendChild(apiSecEl);

  //iframe content
  const iframeTag = document.createElement("iframe");
  iframeTag.id = "anydone-chat-id";
  iframeTag.src = chatPluginSrc;

  iframeTag.onload = () => {
    const onMessageReceivedFromChatPlugin = (event) => {
      if (typeof event.data !== "string") {
        return false;
      }
      const chatPluginData = JSON.parse(event.data);
      const { type, message } = chatPluginData;
      switch (type) {
        case "API_KEY_DATA": {
          setLocalStorageItem("anydoneApiKeyData", message);
          break;
        }
        case "MAPPING_ID": {
          setLocalStorageItem("mappingId", message);
          document.cookie = "mappingId=" + message;
          break;
        }
        case "ANYDONE_SESSION_DATA": {
          setLocalStorageItem("anydoneSession", message);
          break;
        }
        case "CUSTOMER_DATA": {
          setLocalStorageItem("customerData", message);
          break;
        }
        case "PAGE_LOCATION_REQUEST": {
          const page = {
            pageLocation: window.location.href,
          };
          console.log(window.location.href);
          post("PAGE_LOCATION_RESPONSE", page);
        }
        default:
          break;
      }
      return true;
    };
    window.addEventListener("message", onMessageReceivedFromChatPlugin);
    // Helper function for sending a message to the chatPlugin
    const post = (action, value) => {
      let data = {
        type: action,
      };

      if (value) {
        data.message = value;
      }

      let message = JSON.stringify(data);
      iframeTag.contentWindow.postMessage(message, chatPluginSrc);
    };

    const cookieData = getCookie("mappingId");
    const localData = getLocalStorageItem("mappingId");
    if (cookieData !== localData) {
      const keysToRemove = [
        "customerData",
        "mappingId",
        "anydoneSession",
        "anydoneApiKeyData",
      ];

      for (key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }
    const customerData = getLocalStorageItem("customerData") || false;
    const mappingId = getLocalStorageItem("mappingId") || false;
    const keyData = getLocalStorageItem("anydoneApiKeyData") || false;
    const anydoneSession = getLocalStorageItem("anydoneSession") || false;
    const apiKeyData = {
      apiKey,
      apiSecret,
      hostName: window.location.origin,
      domain: window.location.hostname,
      customerData,
      mappingId,
      keyData,
      anydoneSession,
    };
    post("API_CONFIG", apiKeyData);
  };
  iframeTag.style.visibility = "hidden";
  iframeTag.style.bottom = "70px";
  iframeTag.style.position = "fixed";
  iframeTag.style.zIndex = "9999";
  iframeTag.style.border = "none";
  iframeTag.style.right = "33px";

  if (mobileSize.matches) {
    iframeTag.style.width = "100%";
    console.log("this is mobile sized");
  } else iframeTag.style.width = "350px";

  iframeTag.style.height = "528px";
  iframeTag.style.borderRadius = "10px";
  iframeTag.crossOrigin = "";
  iframeTag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.25)";

  bodyTag.appendChild(iframeTag);

  //floating icon to toggle chat screen
  const anydoneIcon = document.createElement("img");
  anydoneIcon.id = "anydone-logo-id";
  anydoneIcon.src =
    "https://storage.googleapis.com/anydone_files/d72d9a1a61ba4f0e8bbb92f70616af91.png";
  anydoneIcon.style.visibility = "visible";
  anydoneIcon.style.width = "50px";
  anydoneIcon.style.height = "50px";
  anydoneIcon.style.borderRadius = "50%";
  anydoneIcon.style.cursor = "pointer";
  anydoneIcon.style.position = "fixed";
  anydoneIcon.style.zIndex = "9999";
  anydoneIcon.style.right = "30px";
  anydoneIcon.style.bottom = "30px";

  const anydoneCloseIcon = document.createElement("img");
  anydoneCloseIcon.id = "anydone-close-id";
  anydoneCloseIcon.src =
    "https://storage.googleapis.com/anydone_files/17cf71ff8a614609a2631540717b05d8.png";
  anydoneCloseIcon.style.visibility = "hidden";
  anydoneCloseIcon.style.width = "50px";
  anydoneCloseIcon.style.height = "50px";
  anydoneCloseIcon.style.borderRadius = "50%";
  anydoneCloseIcon.style.cursor = "pointer";
  anydoneCloseIcon.style.position = "fixed";
  anydoneCloseIcon.style.zIndex = "9999";
  anydoneCloseIcon.style.right = "30px";
  anydoneCloseIcon.style.bottom = "30px";

  anydoneIcon.addEventListener("click", () => {
    anydoneIcon.style.visibility = "hidden";
    anydoneCloseIcon.style.visibility = "visible";
    anydoneCloseIcon.style.animation = "rotation 2s linear";
    iframeTag.style.visibility = "visible";
    iframeTag.style.bottom = "85px";
    iframeTag.style.transition = "bottom 0.3s linear";
    iframeTag.style.zIndex = "9999";
  });
  anydoneCloseIcon.addEventListener("click", () => {
    anydoneIcon.style.visibility = "visible";
    anydoneCloseIcon.style.visibility = "hidden";
    iframeTag.style.visibility = "hidden";
    iframeTag.style.zIndex = "-1";
    iframeTag.style.bottom = "30px";
  });

  bodyTag.appendChild(anydoneIcon);
  bodyTag.appendChild(anydoneCloseIcon);
}

const setLocalStorageItem = (key, data) => {
  return localStorage.setItem(key, JSON.stringify(data));
};

const getLocalStorageItem = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const clearLocalStorage = () => {
  window.localStorage.clear();
};

const getCookie = (name) => {
  let matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

var mobileSize = window.matchMedia("(max-width: 480px)");

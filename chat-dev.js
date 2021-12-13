function init_anydone_chat(apiKey, apiSecret, devDomain, env) {
  // for dev
  const chatPluginSrc =
    env.toLowerCase() === "production"
      ? "https://chatplugin.anydone.com/"
      : "http://35.233.213.62:3000/";
  // ! For local development only, should be changed while pushing
  // const chatPluginSrc =
  //   env.toLowerCase() === "production"
  //     ? "https://chatplugin.anydone.com/"
  //     : "http://192.168.56.1:3000";
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
  iframeTag.allowFullscreen = true;
  iframeTag.src = chatPluginSrc;

  //floating icon to toggle chat screen
  const anydoneIcon = document.createElement("img");
  const anydoneCloseIcon = document.createElement("img");
  const mobileCloseIcon = document.createElement("img");

  var mobileSize = window.matchMedia("(max-width: 480px)");

  const resizeForMobile = (mobileSize) => {
    if (mobileSize.matches) {
      anydoneCloseIcon.style.visibility = "hidden";
      iframeTag.hidden = true;
      anydoneIcon.style.visibility = "visible";
      iframeTag.style.bottom = "0px";
      iframeTag.style.position = "fixed";
      iframeTag.style.zIndex = "9999";
      iframeTag.style.border = "none";
      iframeTag.style.right = "0px";
      iframeTag.style.width = "100vw";
      iframeTag.style.height = "100vh";
      iframeTag.crossOrigin = "";
      iframeTag.style.borderRadius = "0px";
      iframeTag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.25)";
      mobileCloseIcon.style.visibility = "hidden";
      anydoneIcon.style.right = "20px";
      anydoneIcon.style.bottom = "71px";
      // console.log("this is mobile sized");
    } else {
      // console.log("above mobile size");
      iframeTag.style.bottom = "100px";
      iframeTag.style.position = "fixed";
      iframeTag.style.zIndex = "9999";
      iframeTag.style.border = "none";
      iframeTag.style.right = "33px";
      iframeTag.style.width = "350px";
      iframeTag.style.height = "528px";
      iframeTag.style.borderRadius = "10px";
      iframeTag.crossOrigin = "";
      iframeTag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.25)";
      anydoneIcon.style.right = "30px";
      anydoneIcon.style.bottom = "30px";
      if (iframeTag.hidden === false) {
        anydoneCloseIcon.style.visibility = "visible";
        anydoneCloseIcon.style.zIndex = "8888";
      }
    }
  };

  mobileSize.addListener(resizeForMobile);

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

  iframeTag.onload = () => {
    resizeForMobile(mobileSize);
    const onMessageReceivedFromChatPlugin = (event) => {
      if (typeof event.data !== "string") {
        return false;
      }
      const chatPluginData = JSON.parse(event.data);
      const { type, message } = chatPluginData;
      switch (type) {
        case "SDK_INTEGRATION_IS_ENABLED":
          {
            showChatPlugin();
          }
          break;
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
          createUserDataHeader(message);
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
    // const post = (action, value) => {
    //   let data = {
    //     type: action,
    //   };

    //   if (value) {
    //     data.message = value;
    //   }

    //   let message = JSON.stringify(data);
    //   iframeTag.contentWindow.postMessage(message, chatPluginSrc);
    // };

    const page = {
      pageLocation: window.location.href,
    };
    console.log(window.location.href);
    post("PAGE_LOCATION_RESPONSE", page);

    window.addEventListener("onhashchange", () => {
      const page = {
        pageLocation: window.location.href,
      };
      console.log(window.location.href);
      post("PAGE_LOCATION_RESPONSE", page);
    });

    const showChatPlugin = () => {
      anydoneIcon.style.visibility = "visible";
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
    const dummyDomain = devDomain || false;
    const environment = env || false;
    const apiKeyData = {
      apiKey,
      apiSecret,
      hostName: window.location.origin,
      domain: window.location.hostname,
      customerData,
      mappingId,
      keyData,
      anydoneSession,
      devDomain: dummyDomain,
      environment,
    };
    post("API_CONFIG", apiKeyData);
  };

  iframeTag.hidden = true;
  iframeTag.style.bottom = "100px";
  iframeTag.style.position = "fixed";
  iframeTag.style.zIndex = "9999";
  iframeTag.style.border = "none";
  iframeTag.style.right = "33px";
  iframeTag.style.width = "350px";
  iframeTag.style.height = "528px";
  iframeTag.style.borderRadius = "10px";
  iframeTag.crossOrigin = "";
  iframeTag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.25)";

  bodyTag.appendChild(iframeTag);

  anydoneIcon.id = "anydone-logo-id";
  anydoneIcon.src =
    "https://storage.googleapis.com/anydone_files_prod/anydone-logo.svg";
  anydoneIcon.style.visibility = "hidden";
  anydoneIcon.style.width = "60px";
  anydoneIcon.style.height = "60px";
  anydoneIcon.style.borderRadius = "50%";
  anydoneIcon.style.cursor = "pointer";
  anydoneIcon.style.position = "fixed";
  anydoneIcon.style.zIndex = "8888";
  anydoneIcon.style.right = "30px";
  anydoneIcon.style.bottom = "30px";

  anydoneCloseIcon.id = "anydone-close-id";
  anydoneCloseIcon.src =
    "https://storage.googleapis.com/anydone_files_prod/close-icon.svg";
  anydoneCloseIcon.style.visibility = "hidden";
  anydoneCloseIcon.style.width = "60px";
  anydoneCloseIcon.style.height = "60px";
  anydoneCloseIcon.style.borderRadius = "50%";
  anydoneCloseIcon.style.cursor = "pointer";
  anydoneCloseIcon.style.position = "fixed";
  anydoneCloseIcon.style.zIndex = "8888";
  anydoneCloseIcon.style.right = "30px";
  anydoneCloseIcon.style.bottom = "30px";

  mobileCloseIcon.id = "mobile-close-id";
  mobileCloseIcon.src =
    "https://storage.googleapis.com/anydone_files/close_mark.svg";
  mobileCloseIcon.style.visibility = "hidden";
  mobileCloseIcon.style.width = "16px";
  mobileCloseIcon.style.height = "16px";
  mobileCloseIcon.style.cursor = "pointer";
  mobileCloseIcon.style.position = "fixed";
  mobileCloseIcon.style.zIndex = "999999";
  mobileCloseIcon.style.top = "17px";
  mobileCloseIcon.style.right = "20px";

  let clickCount = 0;
  anydoneIcon.addEventListener("click", () => {
    if (clickCount === 0) {
      post("INITIAL_CHATPLUGIN_LOAD", "");
      clickCount += 1;
    }
    anydoneIcon.style.visibility = "hidden";
    anydoneCloseIcon.style.animation = "rotation 2s linear";
    iframeTag.hidden = false;
    if (mobileSize.matches) {
      anydoneCloseIcon.style.visibility = "hidden";
      mobileCloseIcon.style.visibility = "visible";
      iframeTag.style.bottom = "0px";
    } else {
      anydoneCloseIcon.style.visibility = "visible";
      anydoneCloseIcon.style.zIndex = "8888";
      iframeTag.style.bottom = "100px";
    }
    // iframeTag.style.transition = "bottom 0.3s linear";
    iframeTag.style.zIndex = "9999";
    iframeTag.animate(
      [
        // keyframes
        {
          transform: "scale(0, 0)",
          transformOrigin: "bottom right",
          opacity: 0,
          // transitionTimingFunction: "ease-in",
        },
        {
          transform: "scale(1.03, 1.03)",
          transformOrigin: "bottom right",
          // opacity: 1,
        },
        {
          transform: "scale(1, 1)",
          transformOrigin: "bottom right",
          opacity: 1,
          // transitionTimingFunction: "ease-in",
        },
      ],
      {
        // timing options
        duration: 200,
        iterations: 1,
      }
    );
  });
  anydoneCloseIcon.addEventListener("click", () => {
    anydoneIcon.style.visibility = "visible";
    anydoneCloseIcon.style.visibility = "hidden";
    iframeTag.hidden = true;
    iframeTag.style.zIndex = "-1";
    iframeTag.style.bottom = "30px";
  });
  mobileCloseIcon.addEventListener("click", () => {
    mobileCloseIcon.style.visibility = "hidden";
    anydoneIcon.style.zIndex = "8888";
    anydoneCloseIcon.style.zIndex = "-1";
    anydoneIcon.style.visibility = "visible";
    iframeTag.hidden = true;
    iframeTag.style.zIndex = "-1";
    iframeTag.style.bottom = "30px";
  });

  bodyTag.appendChild(anydoneIcon);
  bodyTag.appendChild(anydoneCloseIcon);
  bodyTag.appendChild(mobileCloseIcon);

  // let modalWrapperStyles = {
  //   display: "none" /* Hidden by default */,
  //   position: "fixed" /* Stay in place */,
  //   "z-index": 1 /* Sit on top */,
  //   "padding-top": "100px" /* Location of the box */,
  //   left: 0,
  //   top: 0,
  //   width: "100%" /* Full width */,
  //   height: "100%" /* Full height */,
  //   overflow: "auto" /* Enable scroll if needed */,
  //   "background-color": "rgb(0,0,0)" /* Fallback color */,
  //   "background-color": "rgba(0,0,0,0.4)" /* Black w/ opacity */,
  // };

  // const callModal = document.createElement("div");
  // Object.assign(callModal.style, modalWrapperStyles);
  // bodyTag.appendChild(callModal);

  // let modalContentStyles = {
  //   "background-color": "#fefefe",
  //   margin: "auto",
  //   padding: "20px",
  //   border: "1px solid #888",
  //   width: "80%",
  // };

  // const modalContent = document.createElement("div");
  // Object.assign(modalContent.style, modalContentStyles);
  // modalContent.innerHTML = "<h1>This is the call Modal</h1>";
  // callModal.appendChild(modalContent);

  // const openModalButton = document.querySelector(".modalButton");
  // openModalButton.onClick = () => {
  //   callModal.style.display = "block";
  //   console.log("button clicked");
  // };
  // openModalButton.addEventListener("click", () => {
  //   callModal.style.display = "block";
  // });

  // callModal.addEventListener("click", (event) => {
  //     console.log(event.target)
  //   if (event.target === callModal) {
  //     callModal.style.display = "none";
  //   }
  // });
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

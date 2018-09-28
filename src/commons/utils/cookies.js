if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

const noop = () => {};

const Cookies = {
  get(name, callback = () => {}) {
    chrome.tabs.getSelected(null, ({ url }) => {
      chrome.cookies.get({ url, name }, (cookie) => {
        callback(cookie);
      })
    })
  },

  set(name, value, domain, callback = noop) {
    chrome.tabs.getSelected(null, ({ url }) => {
      chrome.cookies.set({
        url,
        domain,
        name,
        value,
      }, (cookie) => {
        callback(cookie);
      })
    });
  },

  multiSet(sets, callback = noop) {
    if (Object.prototype.toString.call(sets) !== '[object Array]') {
      return;
    }

    chrome.tabs.getSelected(null, ({ url }) => {
      const tasks = [];
      sets.forEach((set) => {
        const p = new Promise((resolve, reject) => {
          try {
            chrome.cookies.set({
              url,
              name: set[0],
              value: set[1],
              domain: set[2],
            }, (cookie) => {
              resolve(cookie);
            });
          } catch (err) {
            reject(err);
          }
        });
        tasks.push(p);
      });

      Promise.all(tasks).then(values => callback(values));
    });
  },

  allRemove(names, url) {
    names.forEach((name) => {
      chrome.cookies.remove({
        name,
        url,
      }, () => {

      })
    });
    // chrome.cookies.getAll({}, (cookies) => {
    //   console.log(222, cookies);
    // });
  },
}

export default Cookies;

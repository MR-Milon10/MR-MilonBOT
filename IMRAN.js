module.exports = async ({ api, event }) => {
  const logger = require('./main/catalogs/MILONC.js') // আপনার নামে logger ফাইল

  const configCustom = {
    autosetbio: {
      status: false,
      bio: `prefix : ${global.config.PREFIX}`,
      note: 'automatically change the MR-MILON BOT bio.'
    },
    greetings: {
      status: false,
      morning: `good morning everyone, have a nice day.`,
      afternoon: `good afternoon everyone, don’t forget to eat your lunch.`,
      evening: `good evening everyone, don’t forget to eat.`,
      sleep: `good night everyone, time to sleep.`,
      note: 'greetings every morning, afternoon, evening and sleep time. timezone: Asia/Manila'
    },
    autoDeleteCache: {
      status: true,
      time: 10, // 10 minutes
      note: 'auto delete caches, set true to enable, false to disable.'
    },
    autoRestart: {
      status: false,
      time: 40, // 40 minutes
      note: 'periodic bot restarts to avoid issues, set false to disable.'
    },
    acceptPending: {
      status: false,
      time: 10, // 10 minutes
      note: 'automatically approve pending threads, set false to disable.'
    }
  }

  function autosetbio(config) {
    if (config.status) {
      try {
        api.changeBio(config.bio, (err) => {
          if (err) logger(`unexpected error: ${err}`, 'setbio')
          return logger(`changed MR-MILON BOT bio to: ${config.bio}`, 'setbio')
        })
      } catch (error) {
        logger(`unexpected error: ${error}`, 'setbio')
      }
    }
  }

  function greetings(config) {
    if (config.status) {
      try {
        const schedules = [
          { timer: '5:00:00 AM', message: [config.morning] },
          { timer: '11:00:00 AM', message: [config.afternoon] },
          { timer: '6:00:00 PM', message: [config.evening] },
          { timer: '10:00:00 PM', message: [config.sleep] }
        ];
        setInterval(() => {
          const r = a => a[Math.floor(Math.random() * a.length)];
          const current = new Date(Date.now() + 25200000).toLocaleString().split(/,/).pop().trim();
          const found = schedules.find(i => i.timer == current);
          if (found) global.data.allThreadID.forEach(i => api.sendMessage(r(found.message), i));
        }, 1000);
      } catch (error) {
        logger(`unexpected error: ${error}`, 'greetings')
      }
    }
  }

  function autoDeleteCache(config) {
    if(config.status) {
      setInterval(async () => {
        const { exec } = require('child_process');
        exec('rm -rf ../../scripts/commands/cache && mkdir -p ../../scripts/commands/cache && rm -rf ../../scripts/events/cache && mkdir -p ../../scripts/events/cache', (error, stdout, stderr) => {
          if (error) return logger(`error: ${error}`, "cache")
          if (stderr) return logger(`stderr: ${stderr}`, "cache")
          return logger(`successfully deleted caches`, "cache")
        })
      }, config.time * 60 * 1000)
    }
  }

  function autoRestart(config) {
    if(config.status) {
      setInterval(async () => {
        logger(`MR-MILON BOT is auto restarting, please wait...`, "mr-milon")
        process.exit(1)
      }, config.time * 60 * 1000)
    }
  }

  function acceptPending(config) {
    if(config.status) {
      setInterval(async () => {
        const list = [
          ...(await api.getThreadList(1, null, ['PENDING'])),
          ...(await api.getThreadList(1, null, ['OTHER']))
        ];
        if (list[0]) {
          api.sendMessage('This thread is automatically approved by MR-MILON BOT system.', list[0].threadID);
        }
      }, config.time * 60 * 1000)
    }
  }

  // Run all
  autosetbio(configCustom.autosetbio)
  greetings(configCustom.greetings)
  autoDeleteCache(configCustom.autoDeleteCache)
  autoRestart(configCustom.autoRestart)
  acceptPending(configCustom.acceptPending)
};

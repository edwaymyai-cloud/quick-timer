(function () {
  const dayEl = document.getElementById('days');
  const hourEl = document.getElementById('hours');
  const minuteEl = document.getElementById('minutes');
  const secondEl = document.getElementById('seconds');
  const lunarTodayEl = document.getElementById('lunar-today');
  const targetInfoEl = document.getElementById('target-info');

  const lunarFullFormatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lunarMonthDayFormatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', {
    month: 'long',
    day: 'numeric'
  });

  const lunarNumericFormatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  const ONE_DAY = 24 * 60 * 60 * 1000;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function setLunarToday() {
    const now = new Date();
    const lunarText = lunarFullFormatter.format(now);
    const solarText = dateFormatter.format(now);
    lunarTodayEl.textContent = `今天：${solarText} ｜ 農曆：${lunarText}`;
  }

  function findNextLunarNewYear(fromDate) {
    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    for (let i = 0; i < 900; i++) {
      const candidate = new Date(start.getTime() + i * ONE_DAY);
      const formatted = lunarNumericFormatter.format(candidate);
      if (formatted.includes('正月') && /(?:^|\D)1$/.test(formatted)) {
        return candidate;
      }
    }
    return null;
  }

  function updateTargetInfo(targetDate) {
    if (!targetDate) {
      targetInfoEl.textContent = '找不到下一個農曆新年日期，請確認系統時間與地區設定。';
      return;
    }
    const eve = new Date(targetDate.getTime() - ONE_DAY);
    const eveLunar = lunarMonthDayFormatter.format(eve);
    const newYearLunar = lunarMonthDayFormatter.format(targetDate);
    targetInfoEl.textContent = `除夕：${dateFormatter.format(eve)}（農曆${eveLunar}） · 新年：${dateFormatter.format(targetDate)}（農曆${newYearLunar}）`;
  }

  function updateCountdown(targetDate) {
    const now = new Date();
    let nextTarget = targetDate;

    if (!nextTarget || now >= nextTarget) {
      nextTarget = findNextLunarNewYear(new Date(now.getTime() + ONE_DAY));
      updateTargetInfo(nextTarget);
    }

    const diffMs = nextTarget ? nextTarget.getTime() - now.getTime() : 0;
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    dayEl.textContent = pad(days);
    hourEl.textContent = pad(hours);
    minuteEl.textContent = pad(minutes);
    secondEl.textContent = pad(seconds);

    return nextTarget;
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLunarToday();
    let targetDate = findNextLunarNewYear(new Date());
    updateTargetInfo(targetDate);
    updateCountdown(targetDate);
    setInterval(() => {
      setLunarToday();
      targetDate = updateCountdown(targetDate);
    }, 1000);
  });
})();

/* Magic Mirror
 * Module: MMM-SimpleNotifyTrashDay
 *
 * By sabo10o29 https://github.com/sabo10o29
 * MIT Licensed.
 */

const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

Module.register("MMM-SimpleNotifyTrashDay", {
  // Module config defaults.
  defaults: {
    notify: 1,
    animationSpeed: 1000,
    updateInterval: 60 * 60 * 1000, //msec
    timeFormat: "MM/DD",
    title: "Trash day",
    expiredTime: 0
  },

  // Define required scripts.
  getScripts: function () {
    return ["moment.js"];
  },
  // Define styles.
  getStyles: function () {
    return ["styles.css"];
  },
  // Define start sequence.
  start: function () {
    var self = this;
    Log.info("Starting module: " + self.name);

    setInterval(function () {
      self.updateDom(self.config.animationSpeed);
    }, self.config.updateInterval);

    self.updateDom(self.config.animationSpeed);
  },

  getOptions() {
    // eslint-disable-next-line no-undef
    return (options = {
      url: this.config.api,
      method: "GET"
    });
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    const trashes = this.config.trashDay;
    const noticePeriodInAdvance = this.config.notify;
    const now = new Date();
    const endDate = getEndDate(now, noticePeriodInAdvance);

    if (trashes.length === 0) {
      console.log("There are no configuration items.");
      return wrapper;
    }

    const notificationItems = getNotificationItems(
      trashes,
      now,
      endDate,
      this.config.expiredTime
    );

    if (notificationItems.length === 0) {
      console.log("There are no items to notify.");
      return wrapper;
    }

    const title = document.createElement("text");
    title.innerHTML = this.config.title;

    const table = document.createElement("table");
    table.className = "info";
    if (
      this.data.position === "top_right" ||
      this.data.position === "bottom_right"
    ) {
      table.style.marginLeft = "auto";
      title.style.textAlign = "right";
    }

    addNotificationItemsToTable(
      table,
      notificationItems,
      this.config.timeFormat
    );

    wrapper.appendChild(title);
    wrapper.appendChild(table);
    return wrapper;
  }
});

/**
 * Adds notify items to a table.
 *
 * @param {HTMLTableElement} table - The table element to add the notify items to.
 * @param {Array} notifyItems - An array of notify items.
 * @param {string} timeFormat - The format for displaying the time.
 */
function addNotificationItemsToTable(table, notifyItems, timeFormat) {
  notifyItems
    .sort((a, b) => a.trashDate - b.trashDate)
    .forEach((i) => {
      var infoItem = document.createElement("tr");
      infoItem.className = "bright";
      // Add time
      var time = document.createElement("td");
      time.className = "time";
      time.innerHTML = moment(i.trashDate).format(timeFormat);
      infoItem.appendChild(time);
      //Add event content
      var content = document.createElement("td");
      content.innerHTML = i.trashItem.LABEL;
      infoItem.appendChild(content);
      table.appendChild(infoItem);
    });
}

/**
 * Retrieves the notify items based on the given trashes, current date, end date, and expired time.
 *
 * @param {Array} trashes - The array of trash items.
 * @param {Date} now - The current date.
 * @param {Date} endDate - The end date.
 * @param {number} expiredTime - The expired time.
 * @returns {Array} - The array of notify items.
 */
function getNotificationItems(trashes, now, endDate, expiredTime) {
  const targetMonths = getMonthsInRange(now, endDate);
  const notifyItems = [];
  for (var trashIndex = 0; trashIndex < trashes.length; trashIndex++) {
    const trashItem = trashes[trashIndex];
    const targetDays = trashItem.DOW;
    const targetWeeks = trashItem.NOW;

    for (
      var targetMonthIndex = 0;
      targetMonthIndex < targetMonths.length;
      targetMonthIndex++
    ) {
      for (
        var targetWeekIndex = 0;
        targetWeekIndex < targetWeeks.length;
        targetWeekIndex++
      ) {
        for (
          var targetDayIndex = 0;
          targetDayIndex < targetDays.length;
          targetDayIndex++
        ) {
          const targetDay = DAYS[targetDays[targetDayIndex]];
          const trashDate = getDateFromDayOfMonth(
            targetMonths[targetMonthIndex],
            targetDay,
            targetWeeks[targetWeekIndex],
            expiredTime
          );
          if (isNotifyItem(trashDate, now, endDate)) {
            notifyItems.push({ trashDate, trashItem });
          }
        }
      }
    }
  }
  return notifyItems;
}

/**
 * Get the date based on the day of the month, day of the week, week number, and expired time.
 *
 * @param {number} month - The month (0-11) to calculate the date for.
 * @param {number} dayOfWeek - The day of the week (0-6, where 0 is Sunday) to find in the month.
 * @param {number} weekNumber - The week number (1-5) to add to the found date.
 * @param {number} expiredTime - The hour of the day (0-23) to set for the resulting date.
 * @returns {Date} The calculated date.
 */
function getDateFromDayOfMonth(month, dayOfWeek, weekNumber, expiredTime) {
  const result = new Date(month);

  // Set the date to the first day of the current month
  result.setDate(1);

  // Find the first occurrence of the specified day of the week in the current month
  while (result.getDay() !== dayOfWeek) {
    result.setDate(result.getDate() + 1);
  }

  // Add the specified number of weeks to the found date
  result.setDate(result.getDate() + (weekNumber - 1) * 7);

  result.setHours(expiredTime);
  return result;
}

/**
 * Returns an array of months between the given start and end dates.
 *
 * @param {string|Date} startDate - The start date of the range.
 * @param {string|Date} endDate - The end date of the range.
 * @returns {Date[]} An array of Date objects representing the months in the range.
 */
function getMonthsInRange(startDate, endDate) {
  const start = new Date(startDate);
  start.setDate(1);
  const end = new Date(endDate);
  end.setDate(1);
  const months = [];

  while (start <= end) {
    months.push(new Date(start));
    start.setMonth(start.getMonth() + 1);
  }

  return months;
}

/**
 * Calculates the end date by adding the specified number of days to the given date.
 *
 * @param {Date} now - The starting date.
 * @param {number} noticePeriodInAdvance - The number of days to add to the starting date.
 * @returns {Date} The end date after adding the specified number of days.
 */
function getEndDate(now, noticePeriodInAdvance) {
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + noticePeriodInAdvance);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

/**
 * Checks if the target date falls within the specified range.
 *
 * @param {Date} target - The target date to check.
 * @param {Date} now - The current date.
 * @param {Date} endDate - The end date of the range.
 * @returns {boolean} - Returns true if the target date is within the range, otherwise false.
 */
function isNotifyItem(target, now, endDate) {
  return now <= target && target <= endDate;
}

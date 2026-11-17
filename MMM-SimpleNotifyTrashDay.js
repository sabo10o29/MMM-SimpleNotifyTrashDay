"use strict";
const DAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
function validateConfig(config) {
    if (!Number.isInteger(config.notify) || config.notify < 0 || config.notify > 3660)
        throw new Error("notify must be an integer from 0 to 3660");
    if (!Number.isFinite(config.expiredTime) || config.expiredTime < 0 || config.expiredTime > 24)
        throw new Error("expiredTime must be a number from 0 to 24");
    if (!Number.isInteger(config.updateInterval) || config.updateInterval < 1000 || config.updateInterval > 2147483647)
        throw new Error("updateInterval must be an integer from 1000 to 2147483647");
    if (!Number.isFinite(config.animationSpeed) || config.animationSpeed < 0)
        throw new Error("animationSpeed must be a non-negative number");
    if (typeof config.title !== "string" || typeof config.timeFormat !== "string")
        throw new Error("title and timeFormat must be strings");
    if (!Array.isArray(config.trashDay))
        throw new Error("trashDay must be an array");
    for (const item of config.trashDay) {
        if (!item || typeof item.LABEL !== "string" || !Array.isArray(item.DOW) || !Array.isArray(item.NOW) ||
            !item.DOW.every(day => typeof day === "string" && Object.hasOwn(DAYS, day)) ||
            !item.NOW.every(week => Number.isInteger(week) && week >= 1 && week <= 5))
            throw new Error("Each trashDay needs LABEL, DOW (sun to sat), and NOW (1 to 5)");
    }
}
function getEndDate(now, days) {
    const end = new Date(now);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return end;
}
function getMonthsInRange(startDate, endDate) {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const months = [];
    while (start <= end) {
        months.push(new Date(start));
        start.setMonth(start.getMonth() + 1);
    }
    return months;
}
function getDateFromDayOfMonth(month, dayOfWeek, weekNumber, expiredTime) {
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6 ||
        !Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 5 ||
        !Number.isFinite(expiredTime) || expiredTime < 0 || expiredTime > 24)
        return null;
    const result = new Date(month.getFullYear(), month.getMonth(), 1);
    result.setDate(1 + (dayOfWeek - result.getDay() + 7) % 7 + (weekNumber - 1) * 7);
    if (result.getMonth() !== month.getMonth())
        return null;
    // The cutoff may be midnight on the following day (expiredTime: 24).
    result.setHours(Math.floor(expiredTime), Math.round((expiredTime % 1) * 60), 0, 0);
    return result;
}
function getNotificationItems(trashes, now, endDate, expiredTime) {
    // Include yesterday's month for a last-day collection with a midnight cutoff.
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    const items = [];
    for (const trashItem of trashes) {
        for (const month of getMonthsInRange(start, endDate)) {
            for (const week of new Set(trashItem.NOW)) {
                for (const day of new Set(trashItem.DOW)) {
                    const cutoff = getDateFromDayOfMonth(month, DAYS[day], week, expiredTime);
                    if (!cutoff || cutoff < now)
                        continue;
                    const date = new Date(month.getFullYear(), month.getMonth(), 1);
                    date.setDate(1 + (DAYS[day] - date.getDay() + 7) % 7 + (week - 1) * 7);
                    if (date <= endDate)
                        items.push({ trashDate: date, trashItem });
                }
            }
        }
    }
    return items.sort((a, b) => a.trashDate.getTime() - b.trashDate.getTime());
}
Module.register("MMM-SimpleNotifyTrashDay", {
    defaults: {
        trashDay: [], notify: 1, animationSpeed: 1000, updateInterval: 3600000,
        timeFormat: "MM/DD", title: "Trash day", expiredTime: 0
    },
    getScripts() { return ["moment.js"]; },
    getStyles() { return ["styles.css"]; },
    start() {
        validateConfig(this.config);
        if (this.timer !== undefined)
            clearInterval(this.timer);
        this.timer = setInterval(() => this.updateDom(this.config.animationSpeed), this.config.updateInterval);
    },
    suspend() {
        if (this.timer !== undefined)
            clearInterval(this.timer);
        this.timer = undefined;
    },
    resume() {
        if (this.timer !== undefined)
            clearInterval(this.timer);
        this.timer = setInterval(() => this.updateDom(this.config.animationSpeed), this.config.updateInterval);
        this.updateDom(this.config.animationSpeed);
    },
    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "simple-notify-trash-day";
        try {
            validateConfig(this.config);
        }
        catch (error) {
            wrapper.textContent = `MMM-SimpleNotifyTrashDay: ${error.message}`;
            return wrapper;
        }
        const now = new Date();
        const items = getNotificationItems(this.config.trashDay, now, getEndDate(now, this.config.notify), this.config.expiredTime);
        if (!items.length)
            return wrapper;
        const title = document.createElement("div");
        title.className = "trash-title";
        title.textContent = this.config.title;
        const table = document.createElement("table");
        table.className = "info";
        if (this.data.position.endsWith("right")) {
            table.style.marginLeft = "auto";
            title.style.textAlign = "right";
        }
        for (const item of items) {
            const row = document.createElement("tr");
            row.className = "bright";
            const time = document.createElement("td");
            time.className = "time";
            time.textContent = moment(item.trashDate).format(this.config.timeFormat);
            const label = document.createElement("td");
            label.textContent = item.trashItem.LABEL;
            row.appendChild(time);
            row.appendChild(label);
            table.appendChild(row);
        }
        wrapper.appendChild(title);
        wrapper.appendChild(table);
        return wrapper;
    }
});

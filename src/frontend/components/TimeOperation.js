const zeroPad = (num, places) => String(num).padStart(places, '0')
const units = {
    year: 31536000000,
    month: 2628000000,
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
}
export const getTimeLeftStringStartDuration = (currentTimestamp, startTimestamp, duration) => {
    // console.log("getTimeLeftStringStartDuration", startTimestamp, duration, currentTimestamp)
    return getTimeLeftString(startTimestamp + duration - currentTimestamp)
}

export const getTimeLeftString = (timestampRelative) => {
    const daysLeft = Math.floor(timestampRelative / units.day)
    timestampRelative -= daysLeft * units.day

    const hoursLeft = Math.floor(timestampRelative / units.hour)
    timestampRelative -= hoursLeft * units.hour

    const minsLeft = Math.floor(timestampRelative / units.minute)
    timestampRelative -= minsLeft * units.minute

    const secsLeft = Math.floor(timestampRelative / units.second)

    return zeroPad(daysLeft, 2) + ":" + zeroPad(hoursLeft, 2) + ":" + zeroPad(minsLeft, 2) + ":" + zeroPad(secsLeft, 2) + "";
}

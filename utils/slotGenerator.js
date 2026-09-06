export const timeStrToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

export const minutesToTimeStr = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const overlapsBreak = (slotStart, slotEnd, breaks) => {
    return breaks.some(b => {
        const bs = timeStrToMinutes(b.startTime);
        const be = timeStrToMinutes(b.endTime);
        return slotStart < be && bs < slotEnd;
    });
};

/**
 * Generates discrete bookable slots for ONE day from the doctor's rules.
 * @param {Array} windows - [{startTime, endTime}] working windows for that day
 * @param {Number} slotDurationMinutes
 * @param {Number} bufferMinutes - gap enforced after each generated slot
 * @param {Array} breaks - [{startTime, endTime}] excluded windows for that day
 * @returns {string[]} e.g. ["09:00-09:20", "09:30-09:50", ...]
 */
export const generateDaySlots = (windows, slotDurationMinutes, bufferMinutes, breaks = []) => {
    const slots = [];

    windows.forEach(w => {
        let cursor = timeStrToMinutes(w.startTime);
        const windowEnd = timeStrToMinutes(w.endTime);

        while (cursor + slotDurationMinutes <= windowEnd) {
            const slotStart = cursor;
            const slotEnd = cursor + slotDurationMinutes;

            if (!overlapsBreak(slotStart, slotEnd, breaks)) {
                slots.push(`${minutesToTimeStr(slotStart)}-${minutesToTimeStr(slotEnd)}`);
            }

            cursor += slotDurationMinutes + bufferMinutes;
        }
    });

    return slots;
};
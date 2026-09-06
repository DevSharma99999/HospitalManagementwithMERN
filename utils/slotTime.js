
// Parses "09:00-10:00" -> [540, 600] (minutes from midnight)
export const parseSlotRange = (slot) => {
    const [startStr, endStr] = slot.split('-');
    const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    return [toMinutes(startStr), toMinutes(endStr)];
};

// True if slotA and slotB are within `bufferMinutes` of touching/overlapping each other
export const isWithinBuffer = (slotA, slotB, bufferMinutes) => {
    const [aStart, aEnd] = parseSlotRange(slotA);
    const [bStart, bEnd] = parseSlotRange(slotB);
    return aStart < bEnd + bufferMinutes && bStart < aEnd + bufferMinutes;
};
//19:00 -> ["19", "00"] -> [19, 00] -> 1140
export function convertHourStringToMinutes(hourString: string) {
    const [hours, minutes] = hourString.split(':').map(Number);

    const minutesAmout = (hours * 60) + minutes;
    
    return minutesAmout;
}
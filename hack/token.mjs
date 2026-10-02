// A figure appears in an approved string as a whole number token: not
// inside a larger number on either side, a grouping comma included ("10"
// is in neither "100", "10,000" nor "1,10x"; "250 MB" is not in "1,250 MB").
export const tokenPattern = (text) => new RegExp("(^|[^0-9.,])" + text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![0-9.]|,[0-9])");
export const carriesToken = (haystack, text) => tokenPattern(text).test(haystack);

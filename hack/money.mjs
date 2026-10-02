// moneyText renders a whole number of minor units as the approved strings
// do: "€24", "€8.40". A minor amount that is not a whole number is refused
// rather than rendered ("$1.20.5" was the alternative): the price book
// carries whole cents, and a floor that is not would be a book error, not
// a formatting case.
export function moneyText(symbol, minor, label) {
  if (!Number.isInteger(minor)) throw new Error("not a whole number of minor units: " + label + " " + minor);
  const major = Math.floor(minor / 100), rem = minor % 100;
  return symbol + major + (rem ? "." + String(rem).padStart(2, "0") : "");
}

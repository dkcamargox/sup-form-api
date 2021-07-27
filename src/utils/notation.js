module.exports = function CSStoObjectNotation(string) {
  const splitedStrings = string.split("-");
  const objectNotationSplitedStrings = splitedStrings.map(
    (splitedString, index) => {
      if (index !== 0) {
        return splitedString.charAt(0).toUpperCase() + splitedString.slice(1);
      } else {
        return splitedString;
      }
    }
  );
  return objectNotationSplitedStrings.join("");
};

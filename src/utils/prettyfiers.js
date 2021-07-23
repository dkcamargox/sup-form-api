module.exports = {
  prettyfyTrueFalse(string) {
    return string === true || string === "true" ? "Sí" : "No";
  },
  invertedprettyfyTrueFalse(string) {
    return string === true || string === "true" ? "No" : "Sí";
  },
  prettyfyFrequency(frequency) {
    return {
      once: "Una ves",
      twice: "Dos veces",
      no: "No visita",
      distance: "A distancia"
    }[frequency];
  }
};

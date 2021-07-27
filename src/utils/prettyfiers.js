module.exports = {
  prettyfyTrueFalse(string) {
    if (string === undefined || string === "undefined") {
      return "";
    } else {
      return string === true || string === "true" ? "Sí" : "No";
    }
  },
  invertedprettyfyTrueFalse(string) {
    if (string === undefined || string === "undefined") {
      return "";
    } else {
      return string === true || string === "true" ? "No" : "Sí";
    }
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

const matches =
  JSON.parse(
    localStorage.getItem("cornermanMatches") || "[]"
  );

const keywords = {
  bottom: 0,
  finish: 0,
  conditioning: 0,
  stance: 0,
  hands: 0,
  nearfall: 0
};

matches.forEach(match => {

  const text = `
    ${match.coachNotes || ""}
    ${match.athleteFeedback || ""}
    ${match.practiceFocus || ""}
  `.toLowerCase();

  Object.keys(keywords).forEach(word => {

    if (text.includes(word)) {
      keywords[word]++;
    }

  });

});

const patternsEl =
  document.getElementById("patterns");

Object.entries(keywords)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, count]) => {

    patternsEl.innerHTML += `
      <div class="pattern-row">
        <strong>${name}</strong>
        <div>${count} mention(s)</div>
      </div>
    `;

  });

const topPattern =
  Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])[0];

const recommendationEl =
  document.getElementById("recommendation");

if (!topPattern || topPattern[1] === 0) {

  recommendationEl.innerHTML =
    "Not enough match data yet.";

} else {

  recommendationEl.innerHTML =
    `Focus training on <strong>${topPattern[0]}</strong>.`;

}
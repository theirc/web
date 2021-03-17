import tinycolor from "tinycolor2";

const brandColors = {
  irc: "#ffda1a",
  generic: "#29991f",
  mc: "#e60000",
  nrc: "#ff7602",
  pg: "#59c2ed",
  cuenta: "#29991f",
};

const brancColorReverse = {
  irc: "#000000",
  nrc: "#ffffff",
  generic: "#ffffff",
  mc: "#ffffff",
  pg: "#ffffff",
  cuenta: "#ffffff",
};

function darken(color, percent = 0) {
  return tinycolor(color).darken(percent).toHexString();
}

function lighten(color, percent = 0) {
  return tinycolor(color).lighten(percent).toHexString();
}

const themes = Object.keys(brandColors).map((k) => [
  k,
  {
    color: brandColors[k],
    inverse: brancColorReverse[k],
    name: k,
  },
]);

const titleBackground = `#f0f0f0`;
const dividerColor = darken(titleBackground, 30);

export default {
  brandColors,
  brancColorReverse,
  themes,
  darken,
  lighten,
  titleBackground,
  dividerColor,
};

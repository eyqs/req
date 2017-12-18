export const codefolder_url =
    "https://raw.githubusercontent.com/eyqs/req/master/data/ubc/2017/codes/";

export const app_style = {
  paddingTop: "2rem",
  margin: "0 auto",
  width: "70vw",
};

export const button_style = {
  textAlign: "center",
  width: "100%",
  height: "2rem",
  lineHeight: "2rem",
  border: "1px solid black",
  cursor: "default",
};

export const button_row_style = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 6rem)",
  gridGap: "0.7rem",
  paddingTop: "1.5rem",
};

export const button_colours = {
  "done": "greenyellow",
  "none": "whitesmoke",
  "xout": "lavender",
  "outs": "wheat",
  "creq": "gold",
  "preq": "pink",
  "excl": "lightsteelblue",
};

export const button_descriptions = {
  "done": " is already taken.",
  "none": " can be taken.",
  "xout": " can be taken"
      + " unless you've taken some credit excluded course outside the tree.",
  "outs": " cannot be taken"
      + " unless you've taken some requisite course outside the tree.",
  "creq": " cannot be taken, due to a missing corequisite.",
  "preq": " cannot be taken, due to a missing prerequisite.",
  "excl": " cannot be taken, due to a"
      + " credit excluded course that you've already taken.",
};

export const border_colours = {
  "highs": "black",
  "preqs": "deeppink",
  "creqs": "darkorange",
  "excls": "indigo",
  "dreqs": "olive",
};

export const border_descriptions = {
  "highs": " is the highlighted course.",
  "preqs": " is a prerequisite of the highlighted course.",
  "creqs": " is a corequisite of the highlighted course.",
  "excls": " is credit excluded with the highlighted course.",
  "dreqs": " has the highlighted course as a requisite.",
};

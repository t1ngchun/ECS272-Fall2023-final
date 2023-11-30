export function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export function filterShootingType(value) {
  let shooting_type = ["targeted", "accidental", "indiscriminate"];
  let str = "targeted";
  let newShootingType;
  if (value?.includes(str)) {
    newShootingType = str;
  }
  if (shooting_type.includes(value)) {
    newShootingType = value;
  } else {
    newShootingType = "others";
  }
  return newShootingType;
}

export function filterShooterDeceased(deceased, note) {
  if (deceased === "0") {
    return "alive";
  }
  if (deceased === "1" && note === null) {
    return "others";
  }
  if (deceased === "1") {
    return note.includes("police") ? "police" : note;
  }
  return "others";
}

export function filterWeaponSource(value) {
  let purchased = "purchased";
  let stolen = "stolen";
  let issued = "issued";
  let family = "family";
  let friend = "friend";

  if (value === null) {
    return "others";
  }
  if (value?.includes(purchased)) {
    return purchased;
  }
  if (value?.includes("puchased")) {
    return purchased;
  }
  if (value?.includes(stolen)) {
    return stolen;
  }
  if (value?.includes(issued)) {
    return issued;
  }
  if (value?.includes("police")) {
    return issued;
  }
  if (value?.includes("classmate")) {
    return friend;
  }
  if (value?.includes("parent")) {
    return family;
  }
  if (value?.includes("home")) {
    return family;
  }
  if (value?.includes("mom")) {
    return family;
  }
  if (value?.includes("mother")) {
    return family;
  }
  if (value?.includes("father")) {
    return family;
  }
  if (value?.includes("family")) {
    return family;
  }
  if (value?.includes("brother")) {
    return family;
  }
  if (value?.includes("uncle")) {
    return family;
  }
  if (value?.includes("relative")) {
    return family;
  }
  if (value?.includes(friend)) {
    return friend;
  }
  return "others";
}

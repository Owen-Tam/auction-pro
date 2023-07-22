var ids = {
  209907823: false,
  211076985: false,
};

class gamepass {
  static getGamepass() {
    for (let v in ids) {
      if (ids[v] == false) {
        ids[v] = true;
        return v;
      }
    }
    return null;
  }

  static freeGamepass(id) {
    if (ids[id] == true) ids[id] = false;
  }
}

module.exports = gamepass;

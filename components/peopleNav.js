let api = {
  openProfile() {},
  openGroup() {},
  openReview() {},
};

export function setPeopleApi(next) {
  api = { ...api, ...(next || {}) };
}

export function peopleApi() {
  return api;
}

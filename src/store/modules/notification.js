const state = () => ({
	show: false,
	type: "success",
	message: "",
	icon: "",
	autoClose: true,
});

const mutations = {
  updateShow(state, display) {
    state.show = display;
  },
  updateType(state, type) {
    state.type = type;
  },
  updateMessage(state, message) {
    state.message = message;
  },
  updateIcon(state, icon) {
    state.icon = icon;
  },
  updateAutoClose(state, autoClose) {
    state.autoClose = autoClose;
  },
};

const actions = {
  updateNotification(
    { commit },
    { show, type, message, icon, autoClose } = {}
  ) {
    if (show !== undefined) {
      commit("updateShow", show);
      commit("updateAutoClose", autoClose);
      if (autoClose) {
        setTimeout(commit, 2500, "updateShow", false);
      }
    }
    if (type !== undefined) {
      commit("updateType", type);
    }
    if (message !== undefined) {
      commit("updateMessage", message);
    }
    if (icon !== undefined) {
      commit("updateIcon", icon);
    }
  },
};

export default {
	namespaced: true,
	state,
	mutations,
	actions,
};

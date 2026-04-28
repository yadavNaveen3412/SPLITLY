import { createStore } from "vuex";
import auth from "./modules/auth";
import group from "./modules/group";
import friends from "./modules/friends";
import chats from "./modules/chats";
import categories from "./modules/categories";
import expenses from "./modules/expenses";
import cloudinary from "./modules/cloudinary";
import settlements from "./modules/settlements";

const store = createStore({
  modules: {
    auth,
    group,
    friends,
    chats,
    categories,
    expenses,
    cloudinary,
    settlements,
  },
});
export default store;

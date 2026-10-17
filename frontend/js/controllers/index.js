// Maps every data-act="..." in the views to a controller function.
import { state, render } from '../models/store.js';
import { closeModal } from '../views/ui.js';
import { sync, signOut, prepareSheet } from './sessionController.js';
import { addB, editB, remB } from './buildingController.js';
import { addU, editU, remU } from './unitController.js';
import { addP, editP, delP } from './paymentController.js';
import { gen, gnext, run, dl, share } from './billController.js';

export const actions = {
  close: closeModal,
  tab: (d) => { state.view = d.id; state.q = ''; render(); },
  toggle: (d) => { state.open.has(d.id) ? state.open.delete(d.id) : state.open.add(d.id); render(); },
  sync: () => sync(true),
  out: signOut,
  setup: prepareSheet,
  addB, editB, remB,
  addU, editU, remU,
  addP, editP, delP,
  gen, gnext, gnohold: run, dl, share,
};

import { login } from './controllers/authController.js';
import { index } from './controllers/dataController.js';
import { run as setup } from './controllers/setupController.js';
import { saveUnit, removeUnit, addBuilding, editBuilding, removeBuilding } from './controllers/unitController.js';
import { savePayment, removePayment } from './controllers/paymentController.js';

// "METHOD path" → controller. `public: true` skips the login check.
export const routes = {
  'POST login':           { public: true, handler: login },
  'GET data':             { handler: index },
  'POST setup':           { handler: setup },
  'POST unit/save':       { handler: saveUnit },
  'POST unit/remove':     { handler: removeUnit },
  'POST building/add':    { handler: addBuilding },
  'POST building/edit':   { handler: editBuilding },
  'POST building/remove': { handler: removeBuilding },
  'POST payment/save':    { handler: savePayment },
  'POST payment/remove':  { handler: removePayment },
};

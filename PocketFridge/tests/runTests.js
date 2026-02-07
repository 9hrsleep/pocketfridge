// Quick and dirty - just test the functions
const helpers = require('../utils/helpers');

console.log("ID:", helpers.generateItemId());
console.log("Receipt ID:", helpers.generateReceiptId("2026-02-06"));
console.log("Has tomato icon:", helpers.checkHasIcon("tomato"));
console.log("Icon name for milk:", helpers.getIconName("milk"));

// to test: node tests/runTests.js
// need to be in root directory to run
// jk not gonna do bc compiling to ts? for now at least
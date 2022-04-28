import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib();

const startingBalance = stdlib.parseCurrency(100);
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);

const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

const HAND = ["Rock","Paper", "Scissors"]
const OUTCOME = ["Bob wins", "Draw","Alice Wins"]

const Player = (who) => ({
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${who} played ${HAND[hand]}`);
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${who} saw outcome ${OUTCOME[outcome]}`);
  },
});
await Promise.all([
  ctcAlice.p.Alice({
    ...Player("Alice"),
  }),
  ctcBob.p.Bob({
    // implement Bob's interact object here
    ...Player("Bob"),
  }),
]);

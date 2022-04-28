import { loadStdlib, ask } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib();

const isAlice = await ask.ask(`Are you Alice?`, ask.yesno);
const who = isAlice ? "Alice" : "Bob";

console.log(`Starting Rock, Paper, Scissors! as ${who}`);

let acc = null;
const createAcc = await ask.ask(
  `Would you like to create an account? ( Only possible on devnet)`,
  ask.yesno
);
if (createAcc) {
  acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} 
else {
  const secret = await ask.ask(
    `What is your account secret?`,
   (x => x)
   );
  acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null
if(isAlice){
  ctc = acc.contract(backend)
  ctc.getInfo().then((info)=>{
    console.log(`The contract is deployed as =${JSON.stringify(info)}`)
  })
}
else{
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  )
  ctc = acc.contract(backend, info)
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance()
console.log(`Your balance is ${before}`)

const interact = { ...stdlib.hasRandom}

interact.informTimeout = () =>{
  console.log(`There was a timeout. `)
  process.exit(1)
}

if (isAlice) {
  const amt = await ask.ask(
    `How much do you want to wager?`,
    stdlib.parseCurrency
    )
    interact.wager = amt
    interact.deadline = {ETH: 100, ALGO: 100, CFX: 1000}[stdlib.connector];
}
else{
  interact.acceptWager = async (amt) =>{
    const accepted = await ask.ask(
      `Do you accept the wager of ${fmt(amt)}?`,
      ask.yesno
    )
    if(!accepted){
      process.exit(0)
    }
  }
}

const HAND = ["Rock", "Paper", "Scissors"];
const HANDS ={
  "Rock": 0, "R" :0, "r":0,
  "Paper":1, "P":1, "p": 1,
  "Scissors": 2, "S":2, "s": 2
}

interact.getHand = async () => {
  const hand = await ask.ask(`What hand will you play?`, (x) => {
    const hand = HANDS[x];
    if (hand === undefined) {
      throw Error(`Not a valid hand ${hand}`);
    }
    return hand;
  });
  console.log(`You played ${HAND[hand]}`);
  return hand;
};

const OUTCOME = ["Bob wins", "Draw", "Alice wins"];

interact.seeOutcome = async (outcome) =>{
  console.log(`The outcome is: ${OUTCOME[outcome]}`)
}
const part = isAlice ? ctc.p.Alice : ctc.p.Bob
await part(interact)

const after = await  getBalance()
console.log(`Your balance is  now ${after}`)

ask.done()

const Player = (who) => ({
  ...stdlib.hasRandom,
  getHand: async () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${who} played ${HAND[hand]}`);
    if (Math.random() <= 0.01) {
      for (let i = 0; i < 10; i++) {
        console.log(` ${who} takes their sweet time sending it back...`);
        await stdlib.wait(1);
      }
    }
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${who} saw outcome ${OUTCOME[outcome]}`);
  },
  informTimeout: () => {
    console.log(`${who} observed a timeout`);
  },
});

// await Promise.all([
//   ctcAlice.p.Alice({
//     ...Player("Alice"),
//     wager: stdlib.parseCurrency(5),
//     deadline: 10,
//   }),
//   ctcBob.p.Bob({
//     // implement Bob's interact object here
//     ...Player("Bob"),
//    accept Wager: async (amt) => {
//       if (Math.random() <= 0.5) {
//         for (let i = 0; i < 10; i++) {
//           console.log(`  Bob takes his sweet time...`);
//           await stdlib.wait(1);
//         }
//       } else {
//         console.log(`Bob accepts the wager of ${fmt(amt)}.`);
//       }
//     },
//   }),
// ]);
// const afterAlice = await getBalance(accAlice);
// const afterBob = await getBalance(accBob);

// console.log(`Alice went from ${beforeAlice} to ${afterAlice}`);
// console.log(`Bob went from ${beforeBob} to ${afterBob}`);
